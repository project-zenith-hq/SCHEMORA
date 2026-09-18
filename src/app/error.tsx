'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App-level Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-lg border border-[#F0F0F0] shadow-sm m-4">
      <h2 className="text-xl font-semibold mb-4 text-[#111111]">Something went wrong!</h2>
      <p className="text-[#6B6B6B] mb-6 max-w-md">
        An unexpected error occurred in this section of the application. 
        Don't worry, your data is safe.
      </p>
      <Button variant="primary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
