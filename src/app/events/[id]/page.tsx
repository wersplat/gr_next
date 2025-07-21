import dynamic from 'next/dynamic';

// Dynamically import the GlobalEventDetail component
const GlobalEventDetail = dynamic(
  () => import('./global-event-detail'),
  { 
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading event details...</div>
      </div>
    )
  }
);

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

export default function EventDetailPage() {
  return <GlobalEventDetail />;
}
