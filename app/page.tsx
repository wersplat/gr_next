import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowForward, EmojiEvents, Person, Event } from '@mui/icons-material';

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Container,
} from '@mui/material';

interface TeamLeaderboard {
  id: string;
  name: string;
  logo_url: string | null;
  global_rank: number | null;
  current_rp: number | null;
  elo_rating: number | null;
  leaderboard_tier: string | null;
  regions: Array<{
    id: string;
    name: string;
  }>;
  captain: {
    id: string;
    gamertag: string;
  } | null;
  _count?: {
    team_rosters: number;
  };
}

interface PlayerLeaderboard {
  id: string;
  gamertag: string;
  position: string | null;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  team_rosters?: Array<{
    teams: {
      id: string;
      name: string;
      logo_url: string | null;
    } | null;
  }>;
}

interface RecentEvent {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  _count?: {
    team_rosters: number;
  };
}

async function getTopTeams(): Promise<TeamLeaderboard[]> {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        global_rank,
        current_rp,
        elo_rating,
        leaderboard_tier,
        regions (
          id,
          name
        ),
        captain:team_rosters!inner (
          players!inner (
            id,
            gamertag
          )
        ),
        _count:team_rosters (count)
      `)
      .eq('team_rosters.is_captain', true)
      .not('global_rank', 'is', null)
      .order('global_rank', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return teams?.map(team => ({
      ...team,
      captain: team.captain?.[0]?.players || null,
    })) || [];
  } catch (error) {
    console.error('Error in getTopTeams:', error);
    return [];
  }
}

async function getTopPlayers(): Promise<PlayerLeaderboard[]> {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        id,
        gamertag,
        position,
        player_rp,
        player_rank_score,
        monthly_value,
        team_rosters (
          teams (
            id,
            name,
            logo_url
          )
        )
      `)
      .not('player_rp', 'is', null)
      .order('player_rp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }

    return players || [];
  } catch (error) {
    console.error('Error in getTopPlayers:', error);
    return [];
  }
}

async function getRecentEvents(): Promise<RecentEvent[]> {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        status
      `)
      .order('start_date', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    // Get team counts separately for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        const { count } = await supabase
          .from('team_rosters')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);
        
        return {
          ...event,
          _count: {
            team_rosters: count || 0
          }
        };
      })
    );

    return eventsWithCounts;
  } catch (error) {
    console.error('Error in getRecentEvents:', error);
    return [];
  }
}

export default async function Home() {
  const [topTeams, topPlayers, recentEvents] = await Promise.all([
    getTopTeams(),
    getTopPlayers(),
    getRecentEvents(),
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Global Leaderboard Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          Global Leaderboard
        </Typography>
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Team
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Region
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    RP
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    ELO
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Tier
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Members
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topTeams.length > 0 ? (
                  topTeams.map((team) => (
                    <TableRow key={team.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>
                        <Chip
                          label={`#${team.global_rank}`}
                          size="small"
                          color={team.global_rank === 1 ? 'warning' : team.global_rank && team.global_rank <= 3 ? 'secondary' : 'primary'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {team.logo_url ? (
                            <Avatar src={team.logo_url} alt={team.name} sx={{ width: 32, height: 32 }} />
                          ) : (
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {team.name.charAt(0)}
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {team.name}
                            </Typography>
                            {team.captain && (
                              <Typography variant="caption" color="text.secondary">
                                © {team.captain.gamertag}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {team.regions?.[0]?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {team.current_rp || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {team.elo_rating || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {team.leaderboard_tier && (
                          <Chip
                            label={team.leaderboard_tier}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {team._count?.team_rosters || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      Loading leaderboard...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Top Players Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          Top Players
        </Typography>
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Player
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Position
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    RP
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Score
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Team
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Salary Tier
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPlayers.length > 0 ? (
                  topPlayers.map((player, index) => (
                    <TableRow key={player.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={index === 0 ? 'warning' : index < 3 ? 'secondary' : 'primary'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {player.gamertag}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {player.position || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.player_rp || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {player.player_rank_score || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {player.team_rosters?.[0]?.teams?.name || 'Free Agent'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`$${player.monthly_value || 0}K`}
                          size="small"
                          variant="outlined"
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      Loading players...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Recent Events Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Recent Events
          </Typography>
          <Button
            component={Link}
            href="/events"
            endIcon={<ArrowForward />}
            sx={{ textTransform: 'none' }}
          >
            View All Events
          </Button>
        </Box>
        <Grid container spacing={3}>
          {recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Event color="primary" />
                      <Chip
                        label={event.status}
                        size="small"
                        color={event.status === 'active' ? 'success' : event.status === 'upcoming' ? 'warning' : 'default'}
                      />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {event.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {event.description || 'No description available'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Start: {format(new Date(event.start_date), 'MMM dd, yyyy')}
                    </Typography>
                    {event.end_date && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        End: {format(new Date(event.end_date), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {event._count?.team_rosters || 0} teams
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Event sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No events found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are no recent events at this time.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
