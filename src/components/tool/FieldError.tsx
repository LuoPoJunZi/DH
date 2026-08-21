import { CircleAlert } from 'lucide-react';

export function FieldError({ message }: { message: string }) {
  return (
    <p className="field-error" role="alert">
      <CircleAlert size={16} aria-hidden="true" />
      {message}
    </p>
  );
}
