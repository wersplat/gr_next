import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import type { Player, Team, PlayerStats } from '@/types/player';
import dynamic from 'next/dynamic';

// Dynamically import the GlobalPlayerDetail component
const GlobalPlayerDetail = dynamic(
  () => import('./global-player-detail'),
  { 
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading player details...</div>
      </div>
    )
  }
);

// Revalidate this page every 30 seconds
export const revalidate = 30;

interface PlayerWithTeam extends Player {
  teams?: Team[];
  stats?: PlayerStats;
}

async function getPlayerData(id: string): Promise<PlayerWithTeam | null> {
  try {
    // Get player basic info
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !player) {
      console.error('Error fetching player:', error);
      return null;
    }

    // Get team info using current_team_id
    let teams: Team[] = [];
    if (player.current_team_id) {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('id', player.current_team_id)
        .single();
      
      if (!teamError && teamData) {
        teams = [teamData];
      } else {
        console.error('Error fetching team:', teamError);
      }
    }

    // Get player stats
    const { data: stats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', id)
      .single();

    return {
      ...player,
      teams: teams,
      stats: stats ? {
        games_played: stats.games_played || 0,
        points_per_game: stats.points_per_game || 0,
        assists_per_game: stats.assists_per_game || 0,
        rebounds_per_game: stats.rebounds_per_game || 0,
        steals_per_game: stats.steals_per_game || 0,
        blocks_per_game: stats.blocks_per_game || 0,
        field_goal_percentage: stats.field_goal_percentage || 0,
        three_point_percentage: stats.three_point_percentage || 0,
        free_throw_percentage: stats.free_throw_percentage || 0,
        minutes_per_game: stats.minutes_per_game || 0,
        turnovers_per_game: stats.turnovers_per_game || 0,
        fouls_per_game: stats.fouls_per_game || 0,
        plus_minus: stats.plus_minus || 0,
      } : undefined,
    };
  } catch (error) {
    console.error('Error in getPlayerData:', error);
    return null;
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  // Ensure params is properly awaited as in the reference project
  const { id } = await Promise.resolve(params);
  const player = await getPlayerData(id);

  if (!player) {
    notFound();
  }

  return <GlobalPlayerDetail />;
}
