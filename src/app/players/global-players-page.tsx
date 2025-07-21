'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  SportsBasketball as BasketballIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { Player, Team } from '@/utils/supabase';

// Extend the Player type with additional properties
interface PlayerWithTeam extends Player {
  teams?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  stats?: {
    games_played: number;
    points_per_game: number;
    assists_per_game: number;
    rebounds_per_game: number;
    steals_per_game: number;
    blocks_per_game: number;
    field_goal_percentage: number;
    three_point_percentage: number;
    free_throw_percentage: number;
  } | null;
}

type SortField = 'gamertag' | 'player_rank_score' | 'performance_score' | 'player_rp' | 'monthly_value';
type SortDirection = 'asc' | 'desc';

const GlobalPlayersPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('player_rank_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Mock data - replace with actual data fetching
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  // Fetch players and teams data on component mount
  // TODO: Replace with actual data fetching
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const [playersData, teamsData] = await Promise.all([
  //         supabase.from('players').select('*, teams(*)')
  //           .order(sortField, { ascending: sortDirection === 'asc' }),
  //         supabase.from('teams').select('*')
  //       ]);
  //       setPlayers(playersData.data || []);
  //       setTeams(teamsData.data || []);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortField(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle position filter change
  const handlePositionFilterChange = (event: SelectChangeEvent<string>) => {
    setPositionFilter(event.target.value);
    setPage(0);
  };

  // Handle team filter change
  const handleTeamFilterChange = (event: SelectChangeEvent<string>) => {
    setTeamFilter(event.target.value);
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.gamertag.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
      const matchesTeam = teamFilter === 'all' || player.teams?.id === teamFilter;
      return matchesSearch && matchesPosition && matchesTeam;
    }).sort((a, b) => {
      if (sortField === 'gamertag') {
        return sortDirection === 'asc'
          ? a.gamertag.localeCompare(b.gamertag)
          : b.gamertag.localeCompare(a.gamertag);
      }
      // Handle numeric fields
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [players, searchTerm, positionFilter, teamFilter, sortField, sortDirection]);

  // Get paginated players
  const paginatedPlayers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredPlayers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPlayers, page, rowsPerPage]);

  // Position options
  const positionOptions = [
    { value: 'all', label: 'All Positions' },
    { value: 'PG', label: 'Point Guard' },
    { value: 'SG', label: 'Shooting Guard' },
    { value: 'SF', label: 'Small Forward' },
    { value: 'PF', label: 'Power Forward' },
    { value: 'C', label: 'Center' },
  ];

  // Team options
  const teamOptions = useMemo(() => [
    { value: 'all', label: 'All Teams' },
    ...teams.map(team => ({
      value: team.id,
      label: team.name
    }))
  ], [teams]);

  // Get position color
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'PG': '#4caf50', // Green
      'SG': '#2196f3', // Blue
      'SF': '#ff9800', // Orange
      'PF': '#f44336', // Red
      'C': '#9c27b0', // Purple
    };
    return colors[position] || '#757575'; // Default grey
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Player Rankings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonIcon />}
          onClick={() => router.push('/players/add')}
        >
          Add Player
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search players..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Position</InputLabel>
            <Select
              value={positionFilter}
              label="Position"
              onChange={handlePositionFilterChange}
            >
              {positionOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={teamFilter}
              label="Team"
              onChange={handleTeamFilterChange}
            >
              {teamOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Players Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'gamertag'}
                    direction={sortField === 'gamertag' ? sortDirection : 'asc'}
                    onClick={() => handleSort('gamertag')}
                  >
                    Player
                  </TableSortLabel>
                </TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Position</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'player_rank_score'}
                    direction={sortField === 'player_rank_score' ? sortDirection : 'desc'}
                    onClick={() => handleSort('player_rank_score')}
                  >
                    Rank Score
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'performance_score'}
                    direction={sortField === 'performance_score' ? sortDirection : 'desc'}
                    onClick={() => handleSort('performance_score')}
                  >
                    Performance
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'player_rp'}
                    direction={sortField === 'player_rp' ? sortDirection : 'desc'}
                    onClick={() => handleSort('player_rp')}
                  >
                    RP
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton variant="text" width={20} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="text" width={120} />
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={40} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedPlayers.length > 0 ? (
                paginatedPlayers.map((player, index) => (
                  <TableRow 
                    key={player.id} 
                    hover 
                    sx={{ '&:hover': { cursor: 'pointer' } }}
                    onClick={() => router.push(`/players/${player.id}`)}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={player.avatar_url || undefined} 
                          alt={player.gamertag}
                          sx={{ width: 32, height: 32 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="body2">
                          {player.gamertag}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {player.teams ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {player.teams.logo_url && (
                            <Avatar 
                              src={player.teams.logo_url} 
                              alt={player.teams.name}
                              sx={{ width: 24, height: 24 }}
                            />
                          )}
                          <Typography variant="body2">
                            {player.teams.name}
                          </Typography>
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
                          size="small"
                          sx={{
                            backgroundColor: `${getPositionColor(player.position)}20`,
                            color: getPositionColor(player.position),
                            fontWeight: 'bold',
                            minWidth: 50,
                            justifyContent: 'center'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {player.player_rank_score?.toFixed(1) || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {player.performance_score?.toFixed(1) || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {player.player_rp || '0'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <BasketballIcon color="disabled" sx={{ fontSize: 40 }} />
                      <Typography variant="body1" color="text.secondary">
                        No players found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredPlayers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default GlobalPlayersPage;
