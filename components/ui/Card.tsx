
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border transition-shadow hover:shadow-primary/10 ${className}`}>
            {children}
        </div>
    );
};
