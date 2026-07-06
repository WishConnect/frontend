import type { ReactNode } from 'react';

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export default function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return <div className={`flex gap-[11px] ${className}`}>{children}</div>;
}
