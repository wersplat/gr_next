'use client';

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  styled,
} from '@mui/material';
import { EmojiEvents, TrendingUp, Group } from '@mui/icons-material';

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    backgroundColor: theme.palette.grey[100],
  },
}));

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
    <Typography variant="h4" component="h2" gutterBottom sx={{ 
      fontWeight: 'semibold', 
      borderBottom: 1, 
      borderColor: 'divider', 
      pb: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

export default function PlayerRatingInfoPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Player Rating Information
      </Typography>

      <Section title="1. Global Rating Formula">
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Each player receives a <strong>Global Rating</strong> (0–100+) derived from verified game stats and context.
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'grey.100', 
          p: 3, 
          mb: 3, 
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          overflowX: 'auto'
        }}>
          Global Rating = Base + (Game Impact × Weight) + Event Bonus − Decay
        </Box>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell>Factor</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">Game Impact</TableCell>
                <TableCell>Weighted stat model (PPG, APG, SPG, TO, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Event Bonus</TableCell>
                <TableCell>Multiplier for Majors, Finals, LANs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Decay</TableCell>
                <TableCell>-2% monthly if inactive (prevents ghost ratings)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Caps</TableCell>
                <TableCell>Rating inflation controlled with season soft caps</TableCell>
              </TableRow>
            </TableBody>
          </StyledTable>
        </TableContainer>
      </Section>

      <Section title="2. Global Tier Classification">
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell>Tier</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Rating Range</TableCell>
                <TableCell>Emoji</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">Tier S</TableCell>
                <td>95+</td>
                <td>Elite</td>
                <td>🏆</td>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Tier A</TableCell>
                <td>85-94</td>
                <td>All-Star</td>
                <td>⭐</td>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Tier B</TableCell>
                <td>75-84</td>
                <td>Starter</td>
                <td>🏀</td>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Tier C</TableCell>
                <td>65-74</td>
                <td>Role Player</td>
                <td>⛹️</td>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Tier D</TableCell>
                <td>0-64</td>
                <td>Development</td>
                <td>📊</td>
              </TableRow>
            </TableBody>
          </StyledTable>
        </TableContainer>
      </Section>

      <Section title="3. Salary Calculation Formula">
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Used in Franchise Leagues to assign player costs.
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'grey.100', 
          p: 3, 
          mb: 3, 
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          overflowX: 'auto'
        }}>
          Raw Salary = (PPG × 2.5) + (APG × 1.8) + (SPG × 3.0) − (TO × 2.0)
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Salary Modifiers:
        </Typography>
        
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li><strong>+10%</strong> for each All-Star selection</li>
          <li><strong>+15%</strong> for MVP/DPOY awards</li>
          <li><strong>+5%</strong> for All-Defensive Team</li>
          <li><strong>-5% to +5%</strong> for team success (playoffs, championships)</li>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          * Minimum salary: $500K | Maximum salary: $40M
        </Typography>
      </Section>
      
      <Section title="4. Rating Updates">
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          Player ratings are updated on a regular basis based on performance in official games and events.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Section>
    </Container>
  );
}
