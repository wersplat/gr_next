'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Skeleton,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Groups as GroupsIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { Team, Player, Region } from '@/utils/supabase';

// Extend the Team type with additional properties
interface TeamWithStats extends Omit<Team, 'region'> {
  region?: Region | null;
  captain?: {
    id: string;
    gamertag: string;
  } | null;
  wins: number;
  losses: number;
  win_percentage: number;
  points_differential: number;
  streak: number;
}

type SortField = 'name' | 'global_rank' | 'elo_rating' | 'current_rp' | 'win_percentage' | 'points_differential';
type SortDirection = 'asc' | 'desc';

const GlobalTeamsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('global_rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Mock data - replace with actual data fetching
  const [teams, setTeams] = useState<TeamWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch teams and regions data on component mount
  // TODO: Replace with actual data fetching
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const [teamsData, regionsData] = await Promise.all([
  //         supabase.from('teams')
  //           .select(`
  //             *,
  //             regions (id, name),
  //             captain:players (id, gamertag)
  //           `)
  //           .order(sortField, { ascending: sortDirection === 'asc' }),
  //         supabase.from('regions').select('id, name')
  //       ]);
  //       
  //       // Process teams data to include calculated stats
  //       const processedTeams = (teamsData.data || []).map(team => ({
  //         ...team,
  //         win_percentage: team.wins + team.losses > 0 
  //           ? (team.wins / (team.wins + team.losses)) * 100 
  //           : 0,
  //         streak: Math.floor(Math.random() * 10) - 2 // Mock streak for now
  //       }));
  //       
  //       setTeams(processedTeams);
  //       setRegions(regionsData.data || []);
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

  // Handle region filter change
  const handleRegionFilterChange = (event: SelectChangeEvent<string>) => {
    setRegionFilter(event.target.value);
    setPage(0);
  };

  // Handle tier filter change
  const handleTierFilterChange = (event: SelectChangeEvent<string>) => {
    setTierFilter(event.target.value);
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

  // Filter and sort teams
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || team.region_id === regionFilter;
      const matchesTier = tierFilter === 'all' || team.leaderboard_tier === tierFilter;
      return matchesSearch && matchesRegion && matchesTier;
    }).sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // Handle numeric fields
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [teams, searchTerm, regionFilter, tierFilter, sortField, sortDirection]);

  // Get paginated teams
  const paginatedTeams = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredTeams.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTeams, page, rowsPerPage]);

  // Tier options
  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    { value: 'Pro', label: 'Pro' },
    { value: 'Elite', label: 'Elite' },
    { value: 'Challenger', label: 'Challenger' },
    { value: 'Contender', label: 'Contender' },
  ];

  // Region options
  const regionOptions = useMemo(() => [
    { value: 'all', label: 'All Regions' },
    ...regions.map(region => ({
      value: region.id,
      label: region.name
    }))
  ], [regions]);

  // Get tier color
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Pro': '#FFD700', // Gold
      'Elite': '#C0C0C0', // Silver
      'Challenger': '#CD7F32', // Bronze
      'Contender': '#A0522D', // Brown
    };
    return colors[tier] || '#757575'; // Default grey
  };

  // Format win percentage
  const formatWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : '0.0%';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Team Rankings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GroupsIcon />}
          onClick={() => router.push('/teams/add')}
        >
          Add Team
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search teams..."
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
            <InputLabel>Region</InputLabel>
            <Select
              value={regionFilter}
              label="Region"
              onChange={handleRegionFilterChange}
            >
              {regionOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Tier</InputLabel>
            <Select
              value={tierFilter}
              label="Tier"
              onChange={handleTierFilterChange}
            >
              {tierOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Teams Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Team
                  </TableSortLabel>
                </TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'global_rank'}
                    direction={sortField === 'global_rank' ? sortDirection : 'asc'}
                    onClick={() => handleSort('global_rank')}
                  >
                    Rank
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'elo_rating'}
                    direction={sortField === 'elo_rating' ? sortDirection : 'desc'}
                    onClick={() => handleSort('elo_rating')}
                  >
                    ELO
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'current_rp'}
                    direction={sortField === 'current_rp' ? sortDirection : 'desc'}
                    onClick={() => handleSort('current_rp')}
                  >
                    RP
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'win_percentage'}
                    direction={sortField === 'win_percentage' ? sortDirection : 'desc'}
                    onClick={() => handleSort('win_percentage')}
                  >
                    Record (W-L)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'points_differential'}
                    direction={sortField === 'points_differential' ? sortDirection : 'desc'}
                    onClick={() => handleSort('points_differential')}
                  >
                    +/-
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
                        <Skeleton variant="text" width={150} />
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={30} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={40} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={40} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={40} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedTeams.length > 0 ? (
                paginatedTeams.map((team, index) => {
                  const winPercentage = team.wins + team.losses > 0 
                    ? (team.wins / (team.wins + team.losses)) * 100 
                    : 0;
                  
                  return (
                    <TableRow 
                      key={team.id} 
                      hover 
                      sx={{ '&:hover': { cursor: 'pointer' } }}
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={team.logo_url || undefined} 
                            alt={team.name}
                            sx={{ width: 32, height: 32 }}
                          >
                            <GroupsIcon />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {team.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {team.region?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {team.leaderboard_tier ? (
                          <Chip 
                            label={team.leaderboard_tier}
                            size="small"
                            sx={{
                              backgroundColor: `${getTierColor(team.leaderboard_tier)}20`,
                              color: getTierColor(team.leaderboard_tier),
                              fontWeight: 'bold',
                              minWidth: 90,
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
                          {team.global_rank || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {team.elo_rating?.toFixed(0) || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {team.current_rp || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography variant="body2">
                            {team.wins}-{team.losses}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {winPercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          color={team.points_differential > 0 ? 'success.main' : team.points_differential < 0 ? 'error.main' : 'text.primary'}
                          fontWeight={team.points_differential !== 0 ? 'bold' : 'normal'}
                        >
                          {team.points_differential > 0 ? '+' : ''}{team.points_differential || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <GroupsIcon color="disabled" sx={{ fontSize: 40 }} />
                      <Typography variant="body1" color="text.secondary">
                        No teams found
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
          count={filteredTeams.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default GlobalTeamsPage;
