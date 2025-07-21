'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component
const SubmitResultsForm = dynamic(
  () => import('./submit-results-client'),
  { ssr: false }
);

export default function SubmitResultsPage() {
  return <SubmitResultsForm />;
}
