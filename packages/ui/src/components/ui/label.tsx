import React from 'react';

export const Label: React.FC<{ children: React.ReactNode; className?: string; htmlFor?: string }> = ({ children, className, htmlFor }) => {
  return <label htmlFor={htmlFor} className={className}>{children}</label>;
};