import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <h3 className={className}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <p className={className}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};