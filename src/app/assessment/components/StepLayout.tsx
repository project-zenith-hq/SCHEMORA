import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

interface StepLayoutProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StepLayout({ step, title, description, children, footer }: StepLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      
      {/* Progress Indicator */}
      <div className="mb-8 flex gap-2 w-full">
        {[1, 2, 3, 4].map(idx => (
          <div 
            key={idx}
            style={{ 
              flex: 1, 
              height: '4px', 
              backgroundColor: idx <= step ? 'var(--accent)' : 'var(--border-subtle)',
              borderRadius: '2px'
            }}
          />
        ))}
      </div>
      
      <Card>
        <CardHeader 
          title={`Step ${step < 5 ? `0${step}` : ''} — ${title}`} 
          description={description} 
        />
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {children}
          </div>
        </CardContent>
        {footer && (
          <CardFooter>
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
