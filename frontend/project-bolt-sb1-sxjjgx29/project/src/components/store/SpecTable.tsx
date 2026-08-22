import type { Product } from '@/types';
import { Tabs } from '@/components/ui/Tabs';
import { Check } from 'lucide-react';
import { sanitizeProductHtml } from '@/lib/sanitizeHtml';

interface SpecTableProps {
  product: Product;
}

export function SpecTable({ product }: SpecTableProps) {
  const specGroups = product.specifications.reduce((acc, spec) => {
    if (!acc[spec.group]) acc[spec.group] = [];
    acc[spec.group].push(spec);
    return acc;
  }, {} as Record<string, typeof product.specifications>);

  const specsContent = (
    <div className="space-y-4">
      {Object.entries(specGroups).map(([group, specs]) => (
        <div key={group} className="brutal-border bg-white">
          <div className="bg-ink-900 text-white px-4 py-2">
            <h4 className="text-xs font-bold uppercase tracking-wider">{group}</h4>
          </div>
          <table className="w-full">
            <tbody>
              {specs.map((spec, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-paper-100' : 'bg-white'}>
                  <td className="px-4 py-2.5 text-sm font-semibold text-ink-700 w-1/3 border-r-2 border-ink-100">
                    {spec.key}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-ink-900">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  const descriptionContent = (
    <div className="brutal-border bg-white p-6">
      <div
        className="prose prose-sm max-w-none text-ink-700 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:mb-2 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm [&_li]:mb-1 [&_p]:text-sm [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.longDescription) }}
      />
    </div>
  );

  const warrantyContent = (
    <div className="brutal-border bg-white p-6 space-y-4">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">Warranty Duration</h4>
        <p className="text-sm font-semibold">{product.warranty.duration}</p>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">Warranty Type</h4>
        <p className="text-sm font-semibold">{product.warranty.type}</p>
      </div>
      {product.warranty.details && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">Details</h4>
          <p className="text-sm">{product.warranty.details}</p>
        </div>
      )}
      {product.termsAndConditions && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">Terms & Conditions</h4>
          <p className="text-sm">{product.termsAndConditions}</p>
        </div>
      )}
    </div>
  );

  const boxContent = (
    <div className="brutal-border bg-white p-6">
      <ul className="space-y-2">
        {product.whatsInTheBox.map((item, i) => (
          <li key={i} className="text-sm flex items-center gap-2">
            <span className="brutal-border bg-success-500 text-white p-1">
              <Check className="w-3 h-3" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { label: 'Specifications', content: specsContent },
        { label: 'Description', content: descriptionContent },
        { label: "What's in the Box", content: boxContent },
        { label: 'Warranty', content: warrantyContent },
      ]}
    />
  );
}
