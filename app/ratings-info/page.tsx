'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  EmojiEvents,
  TrendingUp,
  Assessment,
  Schedule,
} from '@mui/icons-material';

// Types for our data structures
interface RPCategory {
  title: string;
  description: string;
  maxRP: string;
  color: string;
  icon: React.ReactNode;
}

interface EventTier {
  tier: string;
  description: string;
  maxRP: number;
}

interface LeaderboardTier {
  tier: string;
  label: string;
  range: string;
  color: string;
  description: string;
}

interface PlayerTier {
  tier: string;
  label: string;
  range: string;
  emoji: string;
}

interface DecayRule {
  source: string;
  decayStarts: string;
  fullDecay: string;
}

interface SalaryMultiplier {
  range: string;
  multiplier: string;
}

export default function RatingsInfoPage() {
  const [expandedSection, setExpandedSection] = useState<string | false>('team-ranking');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  // Data for RP Categories
  const rpCategories: RPCategory[] = [
    {
      title: 'Event RP',
      description: 'Earned through placements in LANs, tournaments, and qualifiers.',
      maxRP: 'Max: 1000 RP per event',
      color: 'primary',
      icon: <EmojiEvents />,
    },
    {
      title: 'Franchise RP',
      description: 'Accumulated through weekly matches and season achievements.',
      maxRP: 'Includes wins, top 10 victories, and clean sweeps',
      color: 'success',
      icon: <TrendingUp />,
    },
    {
      title: 'Bonus RP',
      description: 'Awarded for special achievements and performances.',
      maxRP: 'Includes MVPs, undefeated runs, and clutch plays',
      color: 'warning',
      icon: <Assessment />,
    },
    {
      title: 'Verified League RP',
      description: 'Points from UPA College and other verified leagues.',
      maxRP: 'Subject to seasonal caps',
      color: 'secondary',
      icon: <Schedule />,
    },
  ];

  // Data for Event Tiers
  const eventTiers: EventTier[] = [
    { tier: 'T1', description: 'Major LANs (Worlds, UPA Live Events)', maxRP: 1000 },
    { tier: 'T2', description: 'Monthly Franchise Events, UPA College Finals', maxRP: 600 },
    { tier: 'T3', description: 'Franchise Qualifiers, Redraft, UPA College Regular', maxRP: 300 },
    { tier: 'T4', description: 'Invitationals, Showmatches, Non-UPA Verified Leagues', maxRP: 150 },
    { tier: 'T5', description: 'Local/Community Events, Unverified', maxRP: 50 },
  ];

  // Data for Leaderboard Tiers
  const leaderboardTiers: LeaderboardTier[] = [
    { tier: 'S-Tier', label: 'Elite Competitors', range: 'Top 4 Teams', color: 'secondary', description: 'The absolute best teams in the world' },
    { tier: 'A-Tier', label: 'Championship Contenders', range: 'Rank 5-12', color: 'primary', description: 'Teams capable of winning major events' },
    { tier: 'B-Tier', label: 'Playoff Hopefuls', range: 'Rank 13-30', color: 'success', description: 'Competitive teams with playoff potential' },
    { tier: 'C-Tier', label: 'Developing Teams', range: 'Rank 31-100', color: 'warning', description: 'Teams building their competitive foundation' },
    { tier: 'Unranked', label: 'New/Inactive', range: '100+', color: 'default', description: 'New teams or inactive squads' },
  ];

  // Data for Player Tiers
  const playerTiers: PlayerTier[] = [
    { tier: 'Tier S', label: 'Hall of Fame', range: '100+', emoji: '🐐' },
    { tier: 'Tier A', label: 'Elite', range: '90–99', emoji: '🥇' },
    { tier: 'Tier B', label: 'Pro', range: '80–89', emoji: '🥈' },
    { tier: 'Tier C', label: 'Rising Star', range: '70–79', emoji: '🥉' },
    { tier: 'Tier D', label: 'Unranked', range: '<70', emoji: '🛠️' },
  ];

  // Data for Decay Rules
  const decayRules: DecayRule[] = [
    { source: 'Event RP (LAN, Opens)', decayStarts: '30 Days', fullDecay: '90 Days' },
    { source: 'Franchise Weekly RP', decayStarts: '60 Days', fullDecay: '120 Days' },
    { source: 'Franchise Placement RP', decayStarts: '90 Days', fullDecay: '150 Days' },
    { source: 'UPA College RP', decayStarts: '60 Days', fullDecay: '120 Days' },
    { source: 'Verified League RP', decayStarts: '30 Days', fullDecay: '60 Days' },
  ];

  // Data for Salary Multipliers
  const salaryMultipliers: SalaryMultiplier[] = [
    { range: '90+', multiplier: '1.3×' },
    { range: '80–89', multiplier: '1.2×' },
    { range: '70–79', multiplier: '1.1×' },
    { range: '<70', multiplier: '1.0×' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Ratings & Ranking Information
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
          Comprehensive guide to our team ranking system and player rating methodology. 
          Learn how teams earn Ranking Points (RP) and how individual player ratings are calculated.
        </Typography>
        
        {/* Quick Navigation */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setExpandedSection('team-ranking')}>
            Team Rankings
          </Button>
          <Button variant="outlined" onClick={() => setExpandedSection('player-ratings')}>
            Player Ratings
          </Button>
          <Button variant="outlined" onClick={() => setExpandedSection('decay-system')}>
            Decay System
          </Button>
        </Box>
      </Box>

      {/* Team Ranking System Section */}
      <Accordion 
        expanded={expandedSection === 'team-ranking'} 
        onChange={handleAccordionChange('team-ranking')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Team Ranking System
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph>
              The <strong>UPA Summer Championships Global Rankings</strong> tracks and compares competitive team performance 
              across Franchise League, UPA College, UPA-sanctioned events, and verified external circuits. Our system provides 
              a unified RP (Ranking Points) structure to evaluate teams fairly across different regions and formats.
            </Typography>
          </Box>

          {/* RP Categories */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            RP Categories
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {rpCategories.map((category) => (
              <Grid item xs={12} md={6} key={category.title}>
                <Card sx={{ height: '100%', border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, color: `${category.color}.main` }}>
                        {category.icon}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {category.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      {category.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.maxRP}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Event Tiers Table */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Event Tiers
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Max RP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventTiers.map((tier, index) => (
                  <TableRow key={tier.tier} sx={{ backgroundColor: index % 2 === 0 ? 'action.hover' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{tier.tier}</TableCell>
                    <TableCell>{tier.description}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{tier.maxRP} RP</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Leaderboard Tiers */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Leaderboard Tiers
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Teams are grouped into five performance tiers based on their total RP. These tiers range from S-Tier 
            for the top four teams to Unranked for new or inactive squads.
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {leaderboardTiers.map((tier) => (
              <Grid item xs={12} sm={6} md={2.4} key={tier.tier}>
                <Card sx={{ textAlign: 'center', height: '100%', border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Chip 
                      label={tier.tier} 
                      color={tier.color as any} 
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {tier.range}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {tier.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tier.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Player Rating System Section */}
      <Accordion 
        expanded={expandedSection === 'player-ratings'} 
        onChange={handleAccordionChange('player-ratings')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Player Rating System
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Global Rating Formula */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Global Rating Formula
          </Typography>
          <Typography variant="body1" paragraph>
            Each player receives a <strong>Global Rating</strong> (0–100+) derived from verified game stats and context.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              Global Rating = Base + (Game Impact × Weight) + Event Bonus − Decay
            </Typography>
          </Alert>

          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Factor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Game Impact</TableCell>
                  <TableCell>Weighted stat model (PPG, APG, SPG, TO, etc.)</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Event Bonus</TableCell>
                  <TableCell>Multiplier for Majors, Finals, LANs</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Decay</TableCell>
                  <TableCell>-2% monthly if inactive (prevents ghost ratings)</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Caps</TableCell>
                  <TableCell>Rating inflation controlled with season soft caps</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Player Tier Classification */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Player Tier Classification
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Label</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating Range</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Emoji</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerTiers.map((tier, index) => (
                  <TableRow key={tier.tier} sx={{ backgroundColor: index % 2 === 0 ? 'action.hover' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{tier.tier}</TableCell>
                    <TableCell>{tier.label}</TableCell>
                    <TableCell>{tier.range}</TableCell>
                    <TableCell sx={{ fontSize: '1.5rem' }}>{tier.emoji}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Salary Calculation */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Salary Calculation Formula
          </Typography>
          <Typography variant="body1" paragraph>
            Used in Franchise Leagues to assign player costs.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              Raw Salary = (PPG × 2.5) + (APG × 1.8) + (SPG × 3.0) − (TO × 2.0)
            </Typography>
          </Alert>

          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Multiplier based on Global Rating:
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating Range</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Multiplier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryMultipliers.map((multiplier, index) => (
                  <TableRow key={multiplier.range} sx={{ backgroundColor: index % 2 === 0 ? 'action.hover' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{multiplier.range}</TableCell>
                    <TableCell>{multiplier.multiplier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="success">
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Final Salary = Raw Salary × Multiplier
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Displayed on the Player Value Tracker in <code>$XX.XX</code> format.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* RP Decay System */}
      <Accordion 
        expanded={expandedSection === 'decay-system'} 
        onChange={handleAccordionChange('decay-system')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            RP Decay System
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            To maintain competitive integrity, RP will decay over time to ensure rankings reflect current performance levels.
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>RP Source</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Decay Starts</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Full Decay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {decayRules.map((rule, index) => (
                  <TableRow key={rule.source} sx={{ backgroundColor: index % 2 === 0 ? 'action.hover' : 'inherit' }}>
                    <TableCell>{rule.source}</TableCell>
                    <TableCell>{rule.decayStarts}</TableCell>
                    <TableCell>{rule.fullDecay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Contact Section */}
      <Card sx={{ mt: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Need More Information?
          </Typography>
          <Typography variant="body1" paragraph>
            For questions about the ranking system, event verification, or to report issues, please contact our support team.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            href="mailto:rankings@upachampionships.gg"
            sx={{ mt: 2 }}
          >
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
