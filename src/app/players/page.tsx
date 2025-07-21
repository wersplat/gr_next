import dynamic from 'next/dynamic';
import { supabase } from '../../utils/supabase';
import { Metadata } from 'next';
import { Player } from './enhanced-players-client';

export const metadata: Metadata = {
  title: 'Players - NBA 2K Pro Am Global Rankings',
  description: 'Browse and search all players in the NBA 2K Pro Am Global Rankings system.',
};

// Dynamically import the Enhanced Players component
const EnhancedPlayersClient = dynamic(() => import('./enhanced-players-client'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

async function getPlayers() {
  try {
    // Use the correct table structure based on existing queries
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        id,
        gamertag,
        position,
        team_rosters (
          team_id,
          teams (
            id,
            name,
            logo_url
          )
        )
      `)
      .order('gamertag', { ascending: true });

    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }

    // Transform the data to match our interface
    const transformedPlayers = players?.map(player => ({
      ...player,
      team_id: player.team_rosters?.[0]?.team_id || null,
      teams: player.team_rosters?.[0]?.teams || null,
      created_at: new Date().toISOString() // Add default created_at
    })) || [];

    return transformedPlayers;
  } catch (error) {
    console.error('Error in getPlayers:', error);
    return [];
  }
}

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

export default async function PlayersPage() {
  const players = await getPlayers();

  return <EnhancedPlayersClient players={players} />;
}
