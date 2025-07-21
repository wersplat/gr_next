'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
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
  Card,
  CardContent,
  CardActionArea,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format, parseISO, isFuture, isToday } from 'date-fns';

// Define the Event type
interface EventType {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url: string | null;
  banner_url: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  registration_open: boolean;
  max_teams: number;
  registered_teams: number;
  region_id: string;
  region?: {
    id: string;
    name: string;
  } | null;
}

type SortField = 'name' | 'start_date' | 'end_date' | 'status';
type SortDirection = 'asc' | 'desc';

const GlobalEventsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Mock data - replace with actual data fetching
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch events and regions data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch events with region data
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            region:region_id (id, name)
          `)
          .order('start_date', { ascending: true });

        if (eventsError) throw eventsError;

        // Process events to determine status
        const processedEvents = (eventsData || []).map(event => {
          const startDate = new Date(event.start_date);
          const endDate = event.end_date ? new Date(event.end_date) : null;
          const now = new Date();
          
          let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
          
          if (endDate && endDate < now) {
            status = 'completed';
          } else if (startDate <= now && (!endDate || endDate >= now)) {
            status = 'ongoing';
          }
          
          return {
            ...event,
            status,
            region: event.region || null
          };
        });
        
        // Fetch regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('id, name');
          
        if (regionsError) throw regionsError;

        setEvents(processedEvents);
        setRegions(regionsData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Handle region filter change
  const handleRegionFilterChange = (event: SelectChangeEvent<string>) => {
    setRegionFilter(event.target.value);
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

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesRegion = regionFilter === 'all' || event.region_id === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    }).sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'start_date' || sortField === 'end_date') {
        const aDate = new Date(a[sortField]);
        const bDate = new Date(b[sortField]);
        return sortDirection === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        // For status
        return sortDirection === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });
  }, [events, searchTerm, statusFilter, regionFilter, sortField, sortDirection]);

  // Get paginated events
  const paginatedEvents = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredEvents.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredEvents, page, rowsPerPage]);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
  ];

  // Region options
  const regionOptions = useMemo(() => [
    { value: 'all', label: 'All Regions' },
    ...regions.map(region => ({
      value: region.id,
      label: region.name
    }))
  ], [regions]);

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'upcoming': '#2196f3', // Blue
      'ongoing': '#4caf50',  // Green
      'completed': '#9e9e9e' // Grey
    };
    return colors[status] || '#757575'; // Default grey
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (isToday(start) && isToday(end)) {
      return 'Today';
    }
    
    if (start.getTime() === end.getTime()) {
      return format(start, 'MMM d, yyyy');
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  // Check if event is upcoming
  const isEventUpcoming = (event: EventType) => {
    const startDate = new Date(event.start_date);
    return isFuture(startDate) || isToday(startDate);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Events
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EventIcon />}
          onClick={() => router.push('/events/create')}
        >
          Create Event
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search events..."
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
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
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
        </Box>
      </Paper>

      {/* Events Grid View */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : filteredEvents.length > 0 ? (
          // Events grid
          filteredEvents.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardActionArea 
                  component="div"
                  onClick={() => router.push(`/events/${event.id}`)}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    p: 2
                  }}
                >
                  <Box sx={{ 
                    width: '100%',
                    height: 140,
                    mb: 2,
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {event.banner_url ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Image 
                          src={event.banner_url} 
                          alt={event.name}
                          fill
                          style={{ 
                            objectFit: 'cover'
                          }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <EventIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    )}
                    <Chip 
                      label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: `${getStatusColor(event.status)}20`,
                        color: getStatusColor(event.status),
                        fontWeight: 'bold',
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${getStatusColor(event.status)}`
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {event.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDateRange(event.start_date, event.end_date)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.location || 'Location TBD'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.registered_teams || 0}/{event.max_teams || '∞'} Teams
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
                      <Chip 
                        label={event.region?.name || 'Global'}
                        size="small"
                        variant="outlined"
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                          {isEventUpcoming(event) ? 'View Details' : 'View Results'}
                        </Typography>
                        <ArrowForwardIcon fontSize="small" color="primary" sx={{ ml: 0.5 }} />
                      </Box>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EventIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                There are no events matching your criteria.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRegionFilter('all');
                }}
              >
                Clear filters
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Table View (Hidden on mobile) */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 4 }}>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'start_date'}
                      direction={sortField === 'start_date' ? sortDirection : 'asc'}
                      onClick={() => handleSort('start_date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'status'}
                      direction={sortField === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Teams</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton for table
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-table-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton variant="text" width={150} />
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" width={40} /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedEvents.length > 0 ? (
                  paginatedEvents.map((event) => (
                    <TableRow 
                      key={event.id}
                      hover 
                      sx={{ '&:hover': { cursor: 'pointer' } }}
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={event.logo_url || undefined} 
                            alt={event.name}
                            sx={{ width: 32, height: 32 }}
                          >
                            <EventIcon />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {event.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateRange(event.start_date, event.end_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.location || 'TBD'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.region?.name || 'Global'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(event.status)}20`,
                            color: getStatusColor(event.status),
                            fontWeight: 'bold',
                            minWidth: 90,
                            justifyContent: 'center'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {event.registered_teams || 0}/{event.max_teams || '∞'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <EventIcon color="disabled" sx={{ fontSize: 40 }} />
                        <Typography variant="body1" color="text.secondary">
                          No events found
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
            count={filteredEvents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default GlobalEventsPage;
