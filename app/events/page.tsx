import { supabase } from '@/utils/supabase';
import { format } from 'date-fns';
import { Event as EventIcon } from '@mui/icons-material';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Paper,
} from '@mui/material';

export const revalidate = 30;

interface EventWithCount {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  _count?: {
    team_rosters: number;
  };
}

async function getEvents(): Promise<EventWithCount[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select(`id, name, description, start_date, end_date, status`)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event) => {
      const { count } = await supabase
        .from('team_rosters')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);

      return {
        ...event,
        _count: { team_rosters: count || 0 },
      };
    })
  );

  return eventsWithCounts;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Events
      </Typography>
      <Grid container spacing={3}>
        {events.length > 0 ? (
          events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EventIcon color="primary" />
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
                  {event.start_date && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Start: {format(new Date(event.start_date), 'MMM dd, yyyy')}
                    </Typography>
                  )}
                  {event.end_date && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      End: {format(new Date(event.end_date), 'MMM dd, yyyy')}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {event._count?.team_rosters || 0} teams
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no events at this time.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
