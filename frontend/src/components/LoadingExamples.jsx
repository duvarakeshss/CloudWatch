// Loading Component Usage Examples
//
// This file demonstrates how to use the different loading components
// available in the CloudWatch application.

import React, { useState, useEffect } from 'react';
import { Loading, PageLoading, CardLoading, InlineLoading } from '../components';

// Example 1: Basic Loading Spinner
const BasicExample = () => {
  return <Loading size="md" text="Loading..." />;
};

// Example 2: Different Sizes
const SizeExample = () => {
  return (
    <div className="space-y-4">
      <Loading size="sm" text="Small loader" />
      <Loading size="md" text="Medium loader" />
      <Loading size="lg" text="Large loader" />
      <Loading size="xl" text="Extra large loader" />
    </div>
  );
};

// Example 3: Different Variants
const VariantExample = () => {
  return (
    <div className="space-y-4">
      <Loading variant="spinner" text="Spinner" />
      <Loading variant="dots" text="Dots" />
      <Loading variant="pulse" text="Pulse" />
    </div>
  );
};

// Example 4: Full Screen Loading
const FullScreenExample = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  return (
    <div>
      {isLoading && <Loading fullScreen text="Loading page..." />}
      <div className="p-4">
        <h1>Page Content</h1>
        <p>This content shows after loading completes.</p>
      </div>
    </div>
  );
};

// Example 5: Page Loading (Full page component)
const PageExample = () => {
  return <PageLoading text="Loading dashboard..." />;
};

// Example 6: Card Loading (For card content)
const CardExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardLoading text="Loading statistics..." />
      <CardLoading text="Loading chart..." />
    </div>
  );
};

// Example 7: Inline Loading (For buttons, forms, etc.)
const InlineExample = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isSubmitting ? (
          <InlineLoading text="Saving..." />
        ) : (
          <>
            <span>Save Changes</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-2">
        <InlineLoading size="sm" />
        <span>Uploading file...</span>
      </div>
    </div>
  );
};

// Example 8: Loading without text
const NoTextExample = () => {
  return <Loading showText={false} />;
};

export {
  BasicExample,
  SizeExample,
  VariantExample,
  FullScreenExample,
  PageExample,
  CardExample,
  InlineExample,
  NoTextExample
};