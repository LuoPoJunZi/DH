import { ImageOff } from 'lucide-react';
import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';

interface ExternalImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackLabel?: string;
  fallback?: ReactNode;
  fallbackClassName?: string;
}

export function ExternalImage({
  src,
  alt,
  fallbackLabel = '图片暂不可用',
  fallback,
  fallbackClassName,
  loading = 'lazy',
  onError,
  ...props
}: ExternalImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={['image-fallback', fallbackClassName].filter(Boolean).join(' ')}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        {fallback ?? (
          <>
            <ImageOff size={22} aria-hidden="true" />
            <span>{fallbackLabel}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...props}
    />
  );
}
