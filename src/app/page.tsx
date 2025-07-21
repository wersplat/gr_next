import dynamic from 'next/dynamic';

// Dynamically import the NBA 2K Global Rankings home component
const NBA2KGlobalHome = dynamic(() => import('./nba2k-global-home'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function Home() {
  return <NBA2KGlobalHome />;
}
