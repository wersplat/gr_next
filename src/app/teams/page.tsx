import dynamic from 'next/dynamic';
import { supabase } from '../../utils/supabase';
import { Metadata } from 'next';
import type { TeamWithRegion } from './enhanced-teams-client';

export const metadata: Metadata = {
  title: 'Teams - NBA 2K Pro Am Global Rankings',
  description: 'Browse and search all teams in the NBA 2K Pro Am Global Rankings system.',
};

// Dynamically import the Enhanced Teams component
const EnhancedTeamsClient = dynamic(() => import('./enhanced-teams-client'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

async function getTeams() {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        region_id,
        current_rp,
        elo_rating,
        global_rank,
        leaderboard_tier,
        created_at,
        regions (
          id,
          name
        ),
        captain:team_rosters!captain_id (
          id,
          players (
            id,
            gamertag
          )
        )
      `)
      .order('current_rp', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return teams || [];
  } catch (error) {
    console.error('Error in getTeams:', error);
    return [];
  }
}

interface TeamWithCaptain extends Omit<TeamWithRegion, 'captain'> {
  captain: {
    id: string;
    players: {
      id: string;
      gamertag: string;
    } | null;
  } | null;
  regions: Array<{
    id: string;
    name: string;
  }>;
}

export default async function TeamsPage() {
  const teams = (await getTeams()) as unknown as TeamWithCaptain[];
  
  // Transform the data to match the expected type
  const transformedTeams: TeamWithRegion[] = teams.map(team => ({
    ...team,
    captain: team.captain?.players ? {
      id: team.captain.players.id,
      gamertag: team.captain.players.gamertag
    } : null,
    // Ensure regions is always an array
    regions: team.regions || []
  }));

  return <EnhancedTeamsClient teams={transformedTeams} />;
}
