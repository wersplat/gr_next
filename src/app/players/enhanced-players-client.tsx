'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Avatar,
} from '@mui/material';
import { Search, Person, Error as ErrorIcon } from '@mui/icons-material';

type PositionColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

interface TeamRoster {
  team_id: string;
  teams: Team | null;
}

export interface Player {
  id: string;
  gamertag: string;
  position: string | null;
  overall_rating?: number | null;
  games_played?: number | null;
  team_id: string | null;
  created_at: string;
  teams: Team | null;
  team_rosters: TeamRoster[] | null;
}

interface Position {
  value: string;
  label: string;
}

const POSITIONS: Position[] = [
  { value: 'PG', label: 'Point Guard' },
  { value: 'SG', label: 'Shooting Guard' },
  { value: 'SF', label: 'Small Forward' },
  { value: 'PF', label: 'Power Forward' },
  { value: 'C', label: 'Center' },
];

const ROWS_PER_PAGE = 25;

type Order = 'asc' | 'desc';
type OrderBy = 'gamertag' | 'team' | 'position' | 'overall_rating' | 'games_played';

export default function EnhancedPlayersClient({ players: initialPlayers }: { players: Player[] }) {
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const rowsPerPage = 10;
  const [players] = useState<Player[]>(initialPlayers);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('overall_rating');

  // Extract unique teams from players
  const teams = useMemo(() => {
    const uniqueTeams = players
      .filter((player: Player) => player.teams)
      .map((player: Player) => player.teams!)
      .filter((team: { id: string }, index: number, self: { id: string }[]) => 
        index === self.findIndex((t: { id: string }) => t.id === team.id)
      );
    return uniqueTeams;
  }, [players]);

  // Get position color
  const getPositionColor = (position: string | null): PositionColor => {
    if (!position) return 'default';
    switch (position) {
      case 'PG': return 'primary';
      case 'SG': return 'secondary';
      case 'SF': return 'success';
      case 'PF': return 'warning';
      case 'C': return 'error';
      default: return 'default';
    }
  };

  // Handle sort
  const handleSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter and sort players
  const filtered = useMemo(() => {
    if (!initialPlayers) return [];
    let result = [...initialPlayers];

    if (positionFilter) {
      result = result.filter(player => player.position === positionFilter);
    }

    if (teamFilter) {
      result = result.filter(player => 
        player.teams?.name?.toLowerCase().includes(teamFilter.toLowerCase())
      );
    }

    return result;
  }, [initialPlayers, positionFilter, teamFilter]);

  const sortedPlayers = useMemo(() => {
    const sorted = filtered.sort((a: Player, b: Player) => {
      let aValue: string | number;
      let bValue: string | number;
      let isNumeric = false;

      switch (orderBy) {
        case 'gamertag':
          aValue = a.gamertag;
          bValue = b.gamertag;
          break;
        case 'team':
          aValue = a.teams?.name || '';
          bValue = b.teams?.name || '';
          break;
        case 'position':
          aValue = a.position || '';
          bValue = b.position || '';
          break;
        case 'overall_rating':
          aValue = a.overall_rating ?? 0;
          bValue = b.overall_rating ?? 0;
          isNumeric = true;
          break;
        case 'games_played':
          aValue = a.games_played || 0;
          bValue = b.games_played || 0;
          break;
        default:
          return 0;
      }

      if (isNumeric) {
        // Numeric comparison
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        // String comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        return order === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });

    return sorted;
  }, [filtered, order, orderBy]);

  // Paginate players
  const paginatedPlayers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return sortedPlayers.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedPlayers, page, rowsPerPage]);

  const totalPages = Math.ceil(sortedPlayers.length / rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: { xs: 2, md: 0 } }}>
          Players
        </Typography>
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <TextField
            fullWidth
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={positionFilter}
                label="Position"
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <MenuItem value="">All Positions</MenuItem>
                {POSITIONS.map((position) => (
                  <MenuItem key={position.value} value={position.value}>
                    {position.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Team</InputLabel>
              <Select
                value={teamFilter}
                label="Team"
                onChange={(e) => setTeamFilter(e.target.value)}
              >
                <MenuItem value="">All Teams</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 4 }}
        >
          {error}
        </Alert>
      )}

      {/* Players Table */}
      {!loading && !error && (
        <>
          {sortedPlayers.length > 0 ? (
            <>
              <Paper elevation={1} sx={{ mb: 4 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'grey.50' }}>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'gamertag'}
                            direction={orderBy === 'gamertag' ? order : 'asc'}
                            onClick={() => handleSort('gamertag')}
                          >
                            Player
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'team'}
                            direction={orderBy === 'team' ? order : 'asc'}
                            onClick={() => handleSort('team')}
                          >
                            Team
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'position'}
                            direction={orderBy === 'position' ? order : 'asc'}
                            onClick={() => handleSort('position')}
                          >
                            Position
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'overall_rating'}
                            direction={orderBy === 'overall_rating' ? order : 'asc'}
                            onClick={() => handleSort('overall_rating')}
                          >
                            Rating
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'games_played'}
                            direction={orderBy === 'games_played' ? order : 'asc'}
                            onClick={() => handleSort('games_played')}
                          >
                            Games
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedPlayers.map((player, index) => (
                        <TableRow 
                          key={player.id}
                          sx={{ 
                            '&:hover': { backgroundColor: 'grey.50' },
                            backgroundColor: index % 2 === 1 ? 'grey.25' : 'white'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                                <Person />
                              </Avatar>
                              <Link href={`/players/${player.id}`} style={{ textDecoration: 'none' }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 'medium',
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                >
                                  {player.gamertag}
                                </Typography>
                              </Link>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {player.teams ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {player.teams.logo_url && (
                                  <Avatar 
                                    src={player.teams.logo_url} 
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                  />
                                )}
                                <Link href={`/teams/${player.teams.id}`} style={{ textDecoration: 'none' }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'primary.main',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                  >
                                    {player.teams.name}
                                  </Typography>
                                </Link>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Free Agent
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {player.position ? (
                              <Chip
                                label={player.position}
                                color={getPositionColor(player.position)}
                                size="small"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {player.overall_rating || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {player.games_played || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Link href={`/players/${player.id}`} style={{ textDecoration: 'none' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                View Profile
                              </Typography>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((page - 1) * ROWS_PER_PAGE) + 1} to {Math.min(page * ROWS_PER_PAGE, sortedPlayers.length)} of {sortedPlayers.length} players
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            </>
          ) : (
            <Paper elevation={1} sx={{ p: 8, textAlign: 'center' }}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'medium' }}>
                No players found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}
