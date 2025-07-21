'use client';

import React from 'react';

type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import { Email } from '@mui/icons-material';

export default function RankingInfoPage() {
  const rpCategories = [
    {
      title: 'Event RP',
      description: 'Earned through placements in LANs, tournaments, and qualifiers.',
      details: 'Max: 1000 RP per event',
      color: 'primary',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Franchise RP',
      description: 'Accumulated through weekly matches and season achievements.',
      details: 'Includes wins, top 10 victories, and clean sweeps',
      color: 'success',
      bgColor: '#e8f5e8',
    },
    {
      title: 'Bonus RP',
      description: 'Awarded for special achievements and performances.',
      details: 'Includes MVPs, undefeated runs, and clutch plays',
      color: 'warning',
      bgColor: '#fff8e1',
    },
    {
      title: 'Verified League RP',
      description: 'Points from UPA College and other verified leagues.',
      details: 'Subject to seasonal caps',
      color: 'secondary',
      bgColor: '#f3e5f5',
    },
  ];

  const eventTiers = [
    { tier: 'T1', description: 'Major LANs (Worlds, UPA Live Events)', maxRP: '1000 RP' },
    { tier: 'T2', description: 'Monthly Franchise Events, UPA College Finals', maxRP: '600 RP' },
    { tier: 'T3', description: 'Franchise Qualifiers, Redraft, UPA College Regular', maxRP: '300 RP' },
    { tier: 'T4', description: 'Invitationals, Showmatches, Non-UPA Verified Leagues', maxRP: '100-150 RP' },
    { tier: 'T5', description: 'Local/Community Events, Unverified', maxRP: '50 RP' },
  ];

  const leaderboardTiers = [
    { tier: 'S-Tier', rank: 'Top 4 Teams', description: 'Elite Competitors', color: 'secondary' },
    { tier: 'A-Tier', rank: 'Rank 5-12', description: 'Championship Contenders', color: 'primary' },
    { tier: 'B-Tier', rank: 'Rank 13-30', description: 'Playoff Hopefuls', color: 'success' },
    { tier: 'C-Tier', rank: 'Rank 31-100', description: 'Developing Teams', color: 'warning' },
    { tier: 'Unranked', rank: '100+', description: 'New/Inactive', color: 'default' },
  ];

  const rpDecayData = [
    { source: 'Event RP (LAN, Opens)', decayStarts: '30 Days', fullDecay: '90 Days' },
    { source: 'Franchise Weekly RP', decayStarts: '60 Days', fullDecay: '120 Days' },
    { source: 'Franchise Placement RP', decayStarts: '90 Days', fullDecay: '150 Days' },
    { source: 'UPA College RP', decayStarts: '60 Days', fullDecay: '120 Days' },
    { source: 'Verified League RP', decayStarts: '30 Days', fullDecay: '60 Days' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Ranking System Information
        </Typography>

        {/* System Overview */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'semibold', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            System Overview
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            The <strong>NBA 2K Pro Am Global Rankings</strong> tracks and compares competitive team performance across Franchise League, UPA College, UPA-sanctioned events, and verified external circuits. Our system provides a unified RP (Ranking Points) structure to evaluate teams fairly across different regions and formats.
          </Typography>
        </Box>

        {/* RP Categories */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'semibold', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            RP Categories
          </Typography>
          <Grid container spacing={3}>
            {rpCategories.map((category, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: category.bgColor,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'semibold', color: `${category.color}.main` }}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, flexGrow: 1 }}>
                    {category.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                    {category.details}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Event Tiers */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'semibold', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Event Tiers
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Max RP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventTiers.map((tier, index) => (
                  <TableRow key={tier.tier} sx={{ backgroundColor: index % 2 === 1 ? 'grey.50' : 'white' }}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{tier.tier}</TableCell>
                    <TableCell>{tier.description}</TableCell>
                    <TableCell sx={{ fontWeight: 'semibold' }}>{tier.maxRP}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Leaderboard Tiers */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'semibold', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Leaderboard Tiers
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Teams are grouped into five performance tiers based on their total RP. These tiers range from S-Tier for the top four teams to Unranked for new or inactive squads.
          </Typography>
          <Grid container spacing={2}>
            {leaderboardTiers.map((tier, index) => (
              <Grid item xs={12} sm={6} lg={2.4} key={index}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Chip 
                    label={tier.tier} 
                    color={tier.color as ChipColor}
                    sx={{ mb: 2, fontWeight: 'medium' }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                    {tier.rank}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {tier.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* RP Decay */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'semibold', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            RP Decay
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            To maintain competitive integrity, RP will decay over time to ensure rankings reflect current performance levels.
          </Typography>
          <Paper elevation={1} sx={{ backgroundColor: 'grey.50', p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>RP Source</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Decay Starts</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Full Decay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rpDecayData.map((decay, index) => (
                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 1 ? 'white' : 'transparent' }}>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{decay.source}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{decay.decayStarts}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{decay.fullDecay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Contact Section */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            backgroundColor: '#e3f2fd',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'semibold', color: 'primary.main' }}>
            Need More Information?
          </Typography>
          <Typography variant="body1" sx={{ color: 'primary.dark', mb: 3 }}>
            For questions about the ranking system, event verification, or to report issues, please contact our support team.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Email />}
            href="mailto:rankings@2k26.gg"
            sx={{ 
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            Contact Support
          </Button>
        </Paper>
      </Paper>
    </Container>
  );
}
