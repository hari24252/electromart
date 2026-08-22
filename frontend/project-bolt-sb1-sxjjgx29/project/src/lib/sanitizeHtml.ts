const allowedTags = new Set(['a', 'b', 'br', 'em', 'h2', 'h3', 'h4', 'li', 'ol', 'p', 'strong', 'ul']);
const removableTags = new Set(['iframe', 'object', 'script', 'style', 'svg', 'template']);
const allowedAttributes: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
};

function isSafeHref(value: string): boolean {
  return /^(?:https?:|mailto:|tel:|\/|#)/i.test(value.trim());
}

/**
 * Keeps product copy expressive without allowing administrator-entered HTML to execute
 * scripts, attach event handlers, or inject unsafe protocols into storefront pages.
 */
export function sanitizeProductHtml(value: string): string {
  if (typeof DOMParser === 'undefined') return value.replace(/<[^>]*>/g, '');
  const document = new DOMParser().parseFromString(value, 'text/html');

  const clean = (element: Element): void => {
    for (const child of Array.from(element.children)) clean(child);

    const tag = element.tagName.toLowerCase();
    if (removableTags.has(tag)) {
      element.remove();
      return;
    }
    if (!allowedTags.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const permitted = allowedAttributes[tag] ?? new Set<string>();
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (!permitted.has(name) || name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (tag === 'a' && name === 'href' && !isSafeHref(attribute.value)) element.removeAttribute(attribute.name);
    }
    if (tag === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  };

  for (const element of Array.from(document.body.children)) clean(element);
  return document.body.innerHTML;
}
