'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Skeleton,
  Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Link from 'next/link';

const GlobalEventDetail = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
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
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/events')}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography color="inherit">Home</Typography>
        </Link>
        <Link href="/events" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography color="inherit">Events</Typography>
        </Link>
        <Typography color="text.primary">Event {eventId}</Typography>
      </Breadcrumbs>
      
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Event Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Event ID: {eventId}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This is a placeholder for the event detail page. The full implementation will include:
        </Typography>
        <ul>
          <li>Event information and description</li>
          <li>Registered teams</li>
          <li>Tournament bracket</li>
          <li>Match schedule</li>
          <li>Results and statistics</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default GlobalEventDetail;
