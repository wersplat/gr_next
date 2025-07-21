import { supabase } from '@/utils/supabase';

import Link from 'next/link';
import { format } from 'date-fns';
import { Whatshot, EmojiEvents, TrendingUp, Sports, Person, Event } from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import StandardCard from '@/components/StandardCard';
import PlayerCard from '@/components/PlayerCard';

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

// Interfaces for our data models
interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  global_rank: number | null;
  elo_rating: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions?: {
    id: string;
    name: string;
  } | null;
}

interface Match {
  id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a: Team | null;
  team_b: Team | null;
  score_a: number | null;
  score_b: number | null;
  played_at: string | null;
  event_id?: string | null;
}

interface Player {
  id: string;
  gamertag: string;
  position?: string | null;
  region_id?: string | null;
  current_team_id?: string | null;
  performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  created_at: string;
  teams?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
}

// Data fetching functions
async function getRecentMatches(): Promise<Match[]> {
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!matches_team_a_id_fkey(
        id,
        name,
        logo_url,
        global_rank,
        elo_rating
      ),
      team_b:teams!matches_team_b_id_fkey(
        id,
        name,
        logo_url,
        global_rank,
        elo_rating
      )
    `)
    .not('score_a', 'is', null)
    .not('score_b', 'is', null)
    .order('played_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent matches', error);
    return [];
  }

  return matches || [];
}

async function getTopTeams(): Promise<Team[]> {
  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      *,
      regions!teams_region_id_fkey(id, name)
    `)
    .order('global_rank', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching top teams', error);
    return [];
  }

  return teams || [];
}

async function getTopPlayers(): Promise<Player[]> {
  const { data: players, error } = await supabase
    .from('players')
    .select(`
      *,
      teams:team_rosters!inner(
        teams!inner(
          id,
          name,
          logo_url
        )
      )
    `)
    .order('player_rank_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching top players', error);
    return [];
  }

  // Flatten the nested team structure
  return players.map(player => ({
    ...player,
    teams: player.teams?.[0]?.teams || null
  })) || [];
}

export default async function GlobalHome() {
  const [recentMatches, topTeams, topPlayers] = await Promise.all([
    getRecentMatches(),
    getTopTeams(),
    getTopPlayers()
  ]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box 
          component="img"
          src="/global-rankings-logo.png"
          alt="Global Rankings"
          sx={{
            height: { xs: 120, sm: 160, md: 200 },
            width: 'auto',
            mb: 2,
            mx: 'auto',
            display: 'block',
          }}
        />
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1,
          }}
        >
          Global Rankings
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'text.secondary',
            mb: 4
          }}
        >
          The definitive ranking system for competitive NBA 2K teams
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StandardCard
            title="Ranked Teams"
            icon={<EmojiEvents />}
          >
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {topTeams.length}
            </Typography>
          </StandardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StandardCard
            title="Active Players"
            icon={<Whatshot />}
          >
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
              {topPlayers.length}
            </Typography>
          </StandardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StandardCard
            title="Matches Tracked"
            icon={<TrendingUp />}
          >
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {recentMatches.length * 25}
            </Typography>
          </StandardCard>
        </Grid>
      </Grid>

      {/* Recent Matches */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Matches" 
              action={
                <Button component={Link} href="/matches" size="small">
                  View All
                </Button>
              }
            />
            <CardContent>
              {recentMatches.length > 0 ? (
                recentMatches.map((match) => (
                  <Box key={match.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={5} sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="subtitle1" noWrap sx={{ mr: 1 }}>
                            {match.team_a?.name || 'TBD'}
                          </Typography>
                          {match.team_a?.logo_url && (
                            <Avatar 
                              src={match.team_a.logo_url} 
                              alt={match.team_a.name}
                              sx={{ width: 32, height: 32 }}
                            />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">
                          {match.score_a !== null && match.score_b !== null 
                            ? `${match.score_a} - ${match.score_b}`
                            : 'VS'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {match.team_b?.logo_url && (
                            <Avatar 
                              src={match.team_b.logo_url} 
                              alt={match.team_b.name}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                          )}
                          <Typography variant="subtitle1" noWrap>
                            {match.team_b?.name || 'TBD'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    {match.played_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        {format(new Date(match.played_at), 'MMM d, yyyy')}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography>No recent matches found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Teams */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Top Ranked Teams" 
              action={
                <Button component={Link} href="/teams" size="small">
                  View All
                </Button>
              }
            />
            <CardContent>
              {topTeams.map((team, index) => (
                <Box key={team.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                  <Typography variant="body2" sx={{ width: 24, textAlign: 'center', fontWeight: 'bold' }}>
                    {index + 1}
                  </Typography>
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {team.logo_url && (
                      <Avatar 
                        src={team.logo_url} 
                        alt={team.name}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography noWrap>{team.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={`#${team.global_rank || 'N/A'}`} 
                          size="small" 
                          sx={{ height: 20, mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {team.regions?.name || 'Global'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={`${team.elo_rating || 0} ELO`} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Players */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardHeader 
            title="Top Players" 
            action={
              <Button component={Link} href="/players" size="small">
                View All
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              {topPlayers.map((player) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                  <PlayerCard 
                    id={player.id}
                    gamertag={player.gamertag}
                    position={player.position || 'N/A'}
                    teamName={player.teams?.name || 'Free Agent'}
                    rating={Math.round(player.performance_score * 10) / 10}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
