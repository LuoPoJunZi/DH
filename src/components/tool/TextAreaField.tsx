import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, hint, id, className = '', ...props }, ref) => {
    const fieldId = id ?? `field-${label.replaceAll(/\s+/g, '-').toLowerCase()}`;
    return (
      <label className={`field ${className}`} htmlFor={fieldId}>
        <span className="field__header">
          <span className="field__label">{label}</span>
          {hint ? <span className="field__hint">{hint}</span> : null}
        </span>
        <textarea ref={ref} id={fieldId} {...props} />
      </label>
    );
  },
);

TextAreaField.displayName = 'TextAreaField';
