import dynamic from 'next/dynamic';

// Dynamically import the GlobalEventsPage component
const GlobalEventsPage = dynamic(
  () => import('./global-events-page'),
  { 
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading events...</div>
      </div>
    )
  }
);

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

export default function EventsPage() {
  return <GlobalEventsPage />;
}
