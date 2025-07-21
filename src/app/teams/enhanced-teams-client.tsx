'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type TierColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
import {
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Typography,
  Box,
  Container,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Groups, Error as ErrorIcon } from '@mui/icons-material';


interface TeamCaptain {
  id: string;
  gamertag: string;
}

export interface TeamWithRegion {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions: Array<{
    id: string;
    name: string;
  }>;
  captain: TeamCaptain | null;
  wins?: number;
  losses?: number;
  points_differential?: number;
}

interface Region {
  id: string;
  name: string;
}

export default function EnhancedTeamsClient({ teams: initialTeams }: { teams: TeamWithRegion[] }) {
  const [teams] = useState<TeamWithRegion[]>(initialTeams);
  const [loading] = useState(true);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortBy, setSortBy] = useState('rp-desc');
  const [regions, setRegions] = useState<Region[]>([]);

  // Extract unique regions from teams
  useMemo(() => {
    const uniqueRegions = teams
      .filter(team => team.regions && team.regions.length > 0)
      .map(team => team.regions[0])
      .filter((region, index, self) => 
        index === self.findIndex(r => r.id === region.id)
      );
    setRegions(uniqueRegions);
  }, [teams]);

  // Get tier color
  const getTierColor = (tier: string | null): TierColor => {
    if (!tier) return 'default';
    switch (tier.toLowerCase()) {
      case 's-tier': return 'secondary';
      case 'a-tier': return 'primary';
      case 'b-tier': return 'success';
      case 'c-tier': return 'warning';
      default: return 'default';
    }
  };

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    const filtered = [...teams].filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (team.captain?.gamertag || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = !regionFilter || 
                           (team.regions && team.regions.some(r => r.id === regionFilter));
      return matchesSearch && matchesRegion;
    });

    // Sort teams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rp-desc':
          return (b.current_rp || 0) - (a.current_rp || 0);
        case 'rp-asc':
          return (a.current_rp || 0) - (b.current_rp || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [teams, searchTerm, regionFilter, sortBy]);

  const TeamCard = ({ team }: { team: TeamWithRegion }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={team.logo_url || undefined}
            sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}
          >
            <Groups />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Link href={`/teams/${team.id}`} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {team.name}
              </Typography>
            </Link>
            {team.captain && (
              <Typography variant="body2" color="text.secondary">
                Captain: {team.captain.gamertag}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {team.leaderboard_tier && (
            <Chip
              label={team.leaderboard_tier}
              color={getTierColor(team.leaderboard_tier)}
              size="small"
            />
          )}
          {team.regions && team.regions.length > 0 && (
            <Chip
              label={team.regions[0].name}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {team.current_rp || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                RP
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
                #{team.global_rank || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rank
              </Typography>
            </Box>
          </Grid>
          {team.elo_rating && (
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                  {Math.round(team.elo_rating)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ELO
                </Typography>
              </Box>
            </Grid>
          )}
          {(team.wins !== undefined || team.losses !== undefined) && (
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                  {team.wins || 0}-{team.losses || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  W-L
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: { xs: 2, md: 0 } }}>
          Teams
        </Typography>
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <TextField
            fullWidth
            placeholder="Search teams..."
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
              <InputLabel>Region</InputLabel>
              <Select
                value={regionFilter}
                label="Region"
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <MenuItem value="">All Regions</MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="rp-desc">RP (High to Low)</MenuItem>
                <MenuItem value="rp-asc">RP (Low to High)</MenuItem>
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
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

      {/* Teams Grid */}
      {!loading && !error && (
        <>
          {filteredAndSortedTeams.length > 0 ? (
            <Grid container spacing={3}>
              {filteredAndSortedTeams.map((team) => (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={team.id}>
                  <TeamCard team={team} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={1} sx={{ p: 8, textAlign: 'center' }}>
              <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'medium' }}>
                No teams found
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
