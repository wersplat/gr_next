'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';

export default function SubmitResultsPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Submit Event Results
      </Typography>
      {submitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Results submitted! We'll review them shortly.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Event ID" name="event" required />
          <TextField label="Team" name="team" required />
          <TextField label="Placement" name="placement" type="number" required />
          <Button type="submit" variant="contained">Submit</Button>
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        For large result submissions, email us at{' '}
        <Link href="mailto:results@upachampionships.gg">results@upachampionships.gg</Link>.
      </Typography>
    </Container>
  );
}
