import React from 'react';

export const Badge: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}> = ({ children, className, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background',
  };
  
  return <span className={`${variantClasses[variant]} ${className || ''}`}>{children}</span>;
};