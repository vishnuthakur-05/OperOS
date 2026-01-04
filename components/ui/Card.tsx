import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', ...props }) => {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>;
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', ...props }) => {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
};