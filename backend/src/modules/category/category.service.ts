import { conflict, notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { slugifyName } from '../../utils/slug.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { categoryRepository } from './category.repository.js';

type CategoryInput = { name?: string; parentCategory?: string | null; image?: string; isActive?: boolean; sortOrder?: number };

async function uniqueSlug(name: string, excludingId?: string): Promise<string> {
  const root = slugifyName(name);
  let slug = root;
  let suffix = 2;
  while (true) {
    const match = await categoryRepository.findBySlugOrName(slug);
    if (!match || match.id === excludingId) return slug;
    slug = `${root}-${suffix++}`;
  }
}

export const categoryService = {
  async tree() {
    const categories = await categoryRepository.findAll();
    const nodes = new Map(categories.map((category) => [category._id.toString(), { ...category, subcategories: [] as unknown[] }]));
    const roots: unknown[] = [];
    for (const category of categories) {
      const node = nodes.get(category._id.toString());
      if (!node) continue;
      if (category.parentCategory) {
        const parent = nodes.get(category.parentCategory.toString());
        if (parent) (parent.subcategories as unknown[]).push(node);
        else roots.push(node);
      } else roots.push(node);
    }
    return roots;
  },

  async bySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw notFound('Category');
    const [all, productCount] = await Promise.all([categoryRepository.findAll(), categoryRepository.countProducts(category._id.toString())]);
    return { ...category, subcategories: all.filter((item) => item.parentCategory?.toString() === category._id.toString()), productCount };
  },

  async create(input: Required<Pick<CategoryInput, 'name'>> & CategoryInput, adminId: string) {
    const data: Record<string, unknown> = { ...input, slug: await uniqueSlug(input.name) };
    if (input.parentCategory) {
      const parent = await categoryRepository.findById(ensureObjectId(input.parentCategory, 'parent category').toString());
      if (!parent) throw notFound('Parent category');
    }
    const category = await categoryRepository.create(data);
    await writeAdminAudit(adminId, 'category.create', 'category', category.id, { name: category.name });
    return category;
  },

  async update(id: string, input: CategoryInput, adminId: string) {
    const categoryId = ensureObjectId(id, 'category').toString();
    if (input.parentCategory === categoryId) throw conflict('A category cannot be its own parent', 'CATEGORY_CYCLE');
    if (input.parentCategory) {
      const parent = await categoryRepository.findById(ensureObjectId(input.parentCategory, 'parent category').toString());
      if (!parent) throw notFound('Parent category');
      let ancestor = parent;
      const visited = new Set<string>();
      while (ancestor) {
        const ancestorId = ancestor.id;
        if (ancestorId === categoryId) throw conflict('A category cannot be moved below one of its descendants', 'CATEGORY_CYCLE');
        if (visited.has(ancestorId) || !ancestor.parentCategory) break;
        visited.add(ancestorId);
        const next = await categoryRepository.findById(ancestor.parentCategory.toString());
        if (!next) break;
        ancestor = next;
      }
    }
    const data: Record<string, unknown> = { ...input };
    if (input.name) data.slug = await uniqueSlug(input.name, categoryId);
    const category = await categoryRepository.update(categoryId, data);
    if (!category) throw notFound('Category');
    await writeAdminAudit(adminId, 'category.update', 'category', category.id, input);
    return category;
  },

  async remove(id: string, adminId: string) {
    const categoryId = ensureObjectId(id, 'category').toString();
    const [children, products] = await Promise.all([categoryRepository.countChildren(categoryId), categoryRepository.countActiveProducts(categoryId)]);
    if (children > 0 || products > 0) throw conflict('Cannot delete a category that still has subcategories or active products', 'CATEGORY_IN_USE');
    const category = await categoryRepository.remove(categoryId);
    if (!category) throw notFound('Category');
    await writeAdminAudit(adminId, 'category.delete', 'category', categoryId, { name: category.name });
  },
};
