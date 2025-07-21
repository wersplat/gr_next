'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  CircularProgress, 
  Container, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Avatar,
  ChipPropsColorOverrides
} from '@mui/material';
import { 
  EmojiEvents, 
  Person, 
  Event as EventIcon, 
  TrendingUp, 
  Sports
} from '@mui/icons-material';
import { OverridableStringUnion } from '@mui/types';
import { PostgrestError } from '@supabase/supabase-js';

// Define types for Supabase responses
interface TeamRoster {
  team_id: string;
  player_id: string;
}

// Define the shape of the joined team data from Supabase
type TeamWithRegion = {
  id: string;
  name: string;
  logo_url: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  leaderboard_tier: string | null;
  region: {
    id: string;
    name: string;
  } | null;
};

// Type for the Supabase response
type SupabaseResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};
import { supabase } from '@/utils/supabase';

// Types for NBA 2K Pro Am data
interface Region {
  id: string;
  name: string;
}

interface TeamFromDB {
  id: string;
  name: string;
  region: Region | null;
  logo_url?: string | null;
  current_rp?: number | null;
  elo_rating?: number | null;
  leaderboard_tier?: string | null;
}



interface Team {
  id: string;
  name: string;
  region: string | { id: string; name: string } | null;
  rp: number;
  elo: number;
  tier: string;
  members: number;
  logo_url: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  rp: number;
  score: number;
  team: string;
  salary_tier: string;
}

interface RecentEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  participants: number;
  description: string;
  banner_url: string;
}

const NBA2KGlobalHome = () => {
  const [topTeams, setTopTeams] = useState<Team[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teams with region data
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            logo_url,
            current_rp,
            elo_rating,
            leaderboard_tier,
            region:region_id (id, name)
          `)
          .order('current_rp', { ascending: false })
          .limit(10) as unknown as SupabaseResponse<TeamWithRegion[]>;

        if (teamsError) throw teamsError;

        // Fetch team member counts
        const teamIds = teamsData?.map(team => team.id) || [];
        let memberCounts: Record<string, number> = {};
        
        if (teamIds.length > 0) {
          const { data: rosterData, error: rosterError } = await supabase
            .from('team_rosters')
            .select('team_id, player_id')
            .in('team_id', teamIds) as unknown as SupabaseResponse<TeamRoster[]>;
            
          if (!rosterError && rosterData) {
            memberCounts = rosterData.reduce<Record<string, number>>((acc, roster) => {
              const teamId = roster.team_id;
              acc[teamId] = (acc[teamId] || 0) + 1;
              return acc;
            }, {});
          }
        }

        // Format teams data for the component
        const formattedTeams = (teamsData || [] as TeamFromDB[]).map(team => ({
          id: team.id,
          name: team.name,
          region: team.region?.name || 'Unknown',
          rp: team.current_rp || 0,
          elo: team.elo_rating || 0,
          tier: team.leaderboard_tier || 'Unranked',
          members: memberCounts[team.id] || 0,
          logo_url: team.logo_url || ''
        }));

        // Fetch top players with their team data
        // Define the shape of the player data with team from Supabase
        type PlayerWithTeam = {
          id: string;
          gamertag: string;
          position: string | null;
          player_rp: number | null;
          performance_score: number | null;
          team: { id: string; name: string } | null;
        };

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select(`
            id,
            gamertag,
            position,
            player_rp,
            performance_score,
            team:current_team_id (id, name)
          `)
          .order('player_rp', { ascending: false })
          .limit(10) as unknown as SupabaseResponse<PlayerWithTeam[]>;

        if (playersError) throw playersError;

        // Format players data for the component
        const formattedPlayers = (playersData || []).map(player => ({
          id: player.id,
          name: player.gamertag,
          position: player.position || 'N/A',
          rp: player.player_rp || 0,
          score: player.performance_score || 0,
          team: player.team?.name || 'Free Agent',
          salary_tier: 'N/A' // This would come from a different table in a real implementation
        }));

        // Fetch recent events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: false })
          .limit(3);

        if (eventsError) throw eventsError;

        // Format events data for the component
        const formattedEvents = (eventsData || []).map(event => ({
          id: event.id,
          name: event.name,
          date: event.start_date || event.created_at,
          type: event.type || 'Event',
          participants: 0, // This would come from a join with event_participants in a real implementation
          description: event.description,
          banner_url: event.banner_url
        }));

        setTopTeams(formattedTeams);
        setTopPlayers(formattedPlayers);
        setRecentEvents(formattedEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'elite': return 'error';
      case 'pro': return 'warning';
      case 'amateur': return 'info';
      default: return 'default';
    }
  };

  type ChipColor = OverridableStringUnion<
    'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
    ChipPropsColorOverrides
  >;

  const getSalaryTierColor = (tier: string): ChipColor => {
    switch (tier.toLowerCase()) {
      case 'superstar': return 'error';
      case 'star': return 'warning';
      case 'starter': return 'info';
      case 'bench':
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          NBA 2K Pro Am Global Rankings
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Track the best NBA 2K Pro Am teams and players from around the world
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {topTeams.length}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Ranked Teams
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Person sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {topPlayers.length * 5}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Active Players
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {recentEvents.length}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Recent Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Global Leaderboard */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Global Leaderboard
          </Typography>
          <Button 
            component={Link} 
            href="/teams" 
            variant="outlined"
            endIcon={<TrendingUp />}
          >
            View All Teams
          </Button>
        </Box>
        
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Region</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>RP</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ELO</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tier</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Members</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topTeams.map((team, index) => (
                <TableRow 
                  key={team.id} 
                  hover 
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {index + 1 <= 3 && (
                        <Box sx={{ mr: 1, fontSize: '1.2rem' }}>
                          {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}
                        </Box>
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        #{index + 1}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Sports />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {team.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {team.region && typeof team.region === 'object' ? team.region.name : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {team.rp.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{team.elo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={team.tier} 
                      color={getTierColor(team.tier) as 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning' | undefined}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>{team.members}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Top Players */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Top Players
          </Typography>
          <Button 
            component={Link} 
            href="/players" 
            variant="outlined"
            endIcon={<Person />}
          >
            View All Players
          </Button>
        </Box>
        
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Player</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>RP</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Salary Tier</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topPlayers.map((player, index) => (
                <TableRow 
                  key={player.id} 
                  hover 
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {index + 1 <= 3 && (
                        <Box sx={{ mr: 1, fontSize: '1.2rem' }}>
                          {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}
                        </Box>
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        #{index + 1}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                        {player.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {player.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {player.rp}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {player.score}
                    </Typography>
                  </TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>
                    <Chip 
                      label={player.salary_tier} 
                      color={getSalaryTierColor(player.salary_tier)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Recent Events */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Recent Events
          </Typography>
          <Button 
            component={Link} 
            href="/events" 
            variant="outlined"
            endIcon={<EventIcon />}
          >
            View All Events
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {recentEvents.map((event) => (
            <Grid item xs={12} md={4} key={event.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Chip 
                      label={event.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="body2">
                    {event.participants} participants
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default NBA2KGlobalHome;
