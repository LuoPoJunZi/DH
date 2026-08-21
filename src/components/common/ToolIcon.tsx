import {
  ArrowLeftRight,
  Binary,
  Braces,
  Clock3,
  Fingerprint,
  Link2,
  ListFilter,
  TextCursorInput,
  type LucideProps,
} from 'lucide-react';
import type { ToolIconName } from '../../types/tool';

const iconMap = {
  braces: Braces,
  binary: Binary,
  link: Link2,
  clock: Clock3,
  fingerprint: Fingerprint,
  'text-cursor': TextCursorInput,
  'list-filter': ListFilter,
  'arrow-left-right': ArrowLeftRight,
} satisfies Record<ToolIconName, React.ComponentType<LucideProps>>;

interface ToolIconProps extends LucideProps {
  name: ToolIconName;
}

export function ToolIcon({ name, ...props }: ToolIconProps) {
  const Icon = iconMap[name];
  return <Icon aria-hidden="true" {...props} />;
}
