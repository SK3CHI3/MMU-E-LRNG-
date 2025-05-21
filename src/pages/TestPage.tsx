import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 border rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Test Page Works!</h1>
        <p className="mb-4">If you can see this, routing is working correctly.</p>
        <p className="text-muted-foreground">This is a simple test page to verify that routing is working.</p>
      </div>
    </div>
  );
};

export default TestPage;
