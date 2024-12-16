import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../common/Button';

interface TabButtonProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function TabButton({ id, icon: Icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <Button
      variant={isActive ? 'primary' : 'secondary'}
      onClick={onClick}
      className="flex items-center"
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
}
