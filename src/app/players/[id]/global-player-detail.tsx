'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { supabase } from '@/utils/supabase';
import type { Player, PlayerStats, Team } from '@/types/player';

// All types are now imported from @/types/player

interface PlayerWithTeam extends Omit<Player, 'teams' | 'stats'> {
  teams?: Team | null;
  stats?: PlayerStats | null;
}

const GlobalPlayerDetail = () => {
  const router = useRouter();
  const params = useParams();
  const playerId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [player, setPlayer] = useState<PlayerWithTeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch player data with team and stats
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select(`
            *,
            team_rosters!inner(
              team_id,
              teams!inner(
                id,
                name,
                logo_url
              )
            ),
            player_stats!inner(
              games_played,
              points_per_game,
              assists_per_game,
              rebounds_per_game,
              steals_per_game,
              blocks_per_game,
              field_goal_percentage,
              three_point_percentage,
              free_throw_percentage,
              minutes_per_game,
              turnovers_per_game,
              fouls_per_game,
              plus_minus
            )
          `)
          .eq('id', playerId)
          .single();
          
        if (playerError) throw playerError;
        
        // Transform the data to match the expected structure
        // Handle the case where teams might be an array or a single object
        const teamsData = playerData.team_rosters?.teams || playerData.team_rosters?.[0]?.teams;
        const transformedPlayer: PlayerWithTeam = {
          ...playerData,
          // Handle both array and single team cases
          teams: Array.isArray(teamsData) ? teamsData[0] || null : teamsData || null,
          stats: playerData.player_stats?.[0] || null
        };
        
        setPlayer(transformedPlayer);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError('Failed to load player data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [playerId]);
  
  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => router.push('/players')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Players
        </Button>
      </Box>
    );
  }
  
  if (!player) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Player not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => router.push('/players')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Players
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="outlined" 
        onClick={() => router.push('/players')}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Players
      </Button>
      
      <Typography variant="h4" gutterBottom>
        {player.gamertag}
      </Typography>
      
      {player.teams && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Team: {player.teams.name || 'No team'}
          </Typography>
          {player.teams.logo_url && (
            <Box 
              component="img" 
              src={player.teams.logo_url} 
              alt={player.teams.name || 'Team logo'} 
              sx={{ maxWidth: 100, height: 'auto', mb: 2 }}
            />
          )}
        </Box>
      )}
      
      {player.stats && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Season Stats
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            <StatCard label="Games Played" value={player.stats.games_played} />
            <StatCard label="Points Per Game" value={player.stats.points_per_game?.toFixed(1)} />
            <StatCard label="Assists Per Game" value={player.stats.assists_per_game?.toFixed(1)} />
            <StatCard label="Rebounds Per Game" value={player.stats.rebounds_per_game?.toFixed(1)} />
            <StatCard label="Steals Per Game" value={player.stats.steals_per_game?.toFixed(1)} />
            <StatCard label="Blocks Per Game" value={player.stats.blocks_per_game?.toFixed(1)} />
            <StatCard label="FG%" value={`${(player.stats.field_goal_percentage * 100)?.toFixed(1)}%`} />
            <StatCard label="3P%" value={`${(player.stats.three_point_percentage * 100)?.toFixed(1)}%`} />
            <StatCard label="FT%" value={`${(player.stats.free_throw_percentage * 100)?.toFixed(1)}%`} />
            <StatCard label="Minutes Per Game" value={player.stats.minutes_per_game?.toFixed(1)} />
            <StatCard label="Turnovers Per Game" value={player.stats.turnovers_per_game?.toFixed(1)} />
            <StatCard label="Fouls Per Game" value={player.stats.fouls_per_game?.toFixed(1)} />
            <StatCard label="+/-" value={player.stats.plus_minus?.toFixed(1)} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Helper component for displaying stats
const StatCard = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <Box sx={{ 
    p: 2, 
    border: '1px solid', 
    borderColor: 'divider', 
    borderRadius: 1,
    textAlign: 'center'
  }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="h6">
      {value || 'N/A'}
    </Typography>
  </Box>
);

export default GlobalPlayerDetail;
