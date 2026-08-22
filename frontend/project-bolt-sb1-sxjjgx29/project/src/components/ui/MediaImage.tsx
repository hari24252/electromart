import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { createMediaPlaceholder, resolveMediaUrl } from '@/lib/media';

interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  fallbackLabel?: string;
}

/** A resilient image primitive for product media and intentional image placeholders. */
export function MediaImage({ src, fallbackLabel, alt = '', onError, ...props }: MediaImageProps) {
  const fallback = createMediaPlaceholder(fallbackLabel || alt || 'ElectroMart');
  const [resolvedSrc, setResolvedSrc] = useState(() => resolveMediaUrl(src, fallbackLabel || alt));

  useEffect(() => {
    setResolvedSrc(resolveMediaUrl(src, fallbackLabel || alt));
  }, [alt, fallbackLabel, src]);

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        if (event.currentTarget.src !== fallback) setResolvedSrc(fallback);
        onError?.(event);
      }}
    />
  );
}
