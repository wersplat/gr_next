import { createClient } from '@supabase/supabase-js';

export interface PlayerAwardStats {
  id: string;
  gamertag: string;
  position: string;
  team_id: string;
  team_name: string;
  team_logo_url: string | null;
  points_per_game: number;
  assists_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  steals_per_game: number;
  blocks_per_game: number;
  rebounds_per_game: number;
  games_played: number;
  minutes_per_game: number;
  is_rookie: boolean;
  overall_rating: number;
  offensive_rating?: number;
  defensive_rating?: number;
  rookie_rating?: number;
}

export async function getAwardsData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // Get all players with their team info - simplified query to avoid missing columns
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
      .order('gamertag');

    if (error) throw error;
    if (!players || players.length === 0) return { omvpCandidates: [], dmvpCandidates: [], rookieCandidates: [] };

    // Define a type for the raw player data from the database
    interface RawPlayer {
      id: string;
      gamertag: string;
      position: string | null;
      team_rosters: Array<{
        team_id: string;
        teams: Array<{
          id: string;
          name: string;
          logo_url: string | null;
        }>;
      }>;
    }

    // Process and transform the data - simplified without player_stats
    const processedPlayers = (players as RawPlayer[])
      .map((player) => {
        const teamRoster = player.team_rosters?.[0];
        const team = teamRoster?.teams?.[0]; // Access first team in the array
        
        // Since we don't have games_played or detailed stats, just include all players
        return {
          id: player.id,
          gamertag: player.gamertag,
          position: player.position || 'Unknown',
          team_id: team?.id || '',
          team_name: team?.name || 'Free Agent',
          team_logo_url: team?.logo_url || null,
          points_per_game: 0, // Default values since we don't have detailed stats
          assists_per_game: 0,
          field_goal_percentage: 0,
          three_point_percentage: 0,
          steals_per_game: 0,
          blocks_per_game: 0,
          rebounds_per_game: 0,
          games_played: 1, // Default to 1 to avoid division by zero
          minutes_per_game: 0,
          is_rookie: false, // Default to false
          overall_rating: 75 // Default rating
        };
      })
      .filter((player): player is PlayerAwardStats => player !== null);

    // Calculate OMVP candidates (top 5 by offensive rating)
    const omvpCandidates = processedPlayers
      .map((player) => ({
        ...player,
        offensive_rating: (player.points_per_game * 0.4) + 
                        (player.assists_per_game * 0.3) + 
                        (player.field_goal_percentage * 0.2) + 
                        (player.three_point_percentage * 0.1)
      }))
      .sort((a, b) => (b.offensive_rating || 0) - (a.offensive_rating || 0))
      .slice(0, 5);

    // Calculate DMVP candidates (top 5 by defensive rating)
    const dmvpCandidates = processedPlayers
      .map((player) => ({
        ...player,
        defensive_rating: (player.steals_per_game * 0.4) + 
                         (player.blocks_per_game * 0.3) + 
                         (player.rebounds_per_game * 0.3)
      }))
      .sort((a, b) => (b.defensive_rating || 0) - (a.defensive_rating || 0))
      .slice(0, 5);

    // Calculate Rookie candidates (top 5 rookies by overall performance)
    const rookieCandidates = processedPlayers
      .filter((player) => player.is_rookie)
      .map((player) => ({
        ...player,
        rookie_rating: (player.points_per_game * 0.3) + 
                      (player.assists_per_game * 0.2) + 
                      (player.steals_per_game * 0.2) + 
                      (player.field_goal_percentage * 0.15) + 
                      (player.overall_rating * 0.15)
      }))
      .sort((a, b) => (b.rookie_rating || 0) - (a.rookie_rating || 0))
      .slice(0, 5);

    return { omvpCandidates, dmvpCandidates, rookieCandidates };
  } catch (error) {
    console.error('Error in getAwardsData:', error);
    return { omvpCandidates: [], dmvpCandidates: [], rookieCandidates: [] };
  }
}
