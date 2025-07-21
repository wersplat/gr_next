'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// format is not currently used
// import { format } from 'date-fns';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface TeamData {
  name: string;
  score: string;
  players: string[];
  [key: string]: string | string[]; // This allows any string key with string or string[] values
}

interface FormData {
  eventName: string;
  eventType: string;
  eventDate: Date | null;
  homeTeam: TeamData;
  awayTeam: TeamData;
  additionalNotes: string;
  submitterName: string;
  submitterEmail: string;
  submitterPassword: string;
  agreeToTerms: boolean;
}

function SubmitResultsForm() {
  // Remove unused router
  // const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    eventName: '',
    eventType: 'franchise',
    eventDate: new Date(),
    homeTeam: { name: '', score: '', players: ['', '', ''] },
    awayTeam: { name: '', score: '', players: ['', '', ''] },
    additionalNotes: '',
    submitterName: '',
    submitterEmail: '',
    submitterPassword: '',
    agreeToTerms: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const eventTypes = [
    { value: 'franchise', label: 'Franchise League' },
    { value: 'tournament', label: 'Tournament' },
    { value: 'showmatch', label: 'Showmatch' },
    { value: 'scrimmage', label: 'Scrimmage' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newValue: Date | null) => {
    setFormData({
      ...formData,
      eventDate: newValue,
    });
  };

  const handleTeamChange = (
    team: 'homeTeam' | 'awayTeam',
    field: keyof TeamData,
    value: string,
    index?: number
  ) => {
    setFormData(prev => {
      const updatedTeam = { ...prev[team] };
      if (field === 'players' && index !== undefined) {
        const players = [...updatedTeam.players];
        players[index] = value;
        updatedTeam.players = players;
      } else if (field === 'name' || field === 'score') {
        updatedTeam[field] = value;
      }
      return {
        ...prev,
        [team]: updatedTeam,
      };
    });
  };

  const handleAddPlayer = (team: 'homeTeam' | 'awayTeam') => {
    setFormData(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        players: [...prev[team].players, '']
      }
    }));
  };

  const handleRemovePlayer = (team: 'homeTeam' | 'awayTeam', index: number) => {
    if (formData[team].players.length <= 3) return; // Keep at least 3 players
    
    setFormData(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        players: prev[team].players.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.agreeToTerms) {
        throw new Error('You must agree to the terms and conditions');
      }

      if (formData.homeTeam.score === '' || formData.awayTeam.score === '') {
        throw new Error('Please enter scores for both teams');
      }

      if (formData.homeTeam.players.some(p => !p.trim()) || formData.awayTeam.players.some(p => !p.trim())) {
        throw new Error('All player names must be filled out');
      }

      // Here you would typically send the data to your API
      console.log('Form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          eventName: '',
          eventType: 'franchise',
          eventDate: new Date(),
          homeTeam: { name: '', score: '', players: ['', '', ''] },
          awayTeam: { name: '', score: '', players: ['', '', ''] },
          additionalNotes: '',
          submitterName: '',
          submitterEmail: '',
          submitterPassword: '',
          agreeToTerms: false,
        });
        setStep(1);
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the results';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <Typography variant="h6" gutterBottom>Event Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Event Name"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    name="eventType"
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    label="Event Type"
                  >
                    {eventTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Event Date"
                    value={formData.eventDate}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button type="submit" variant="contained" color="primary">
                Next
              </Button>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <Typography variant="h6" gutterBottom>Team Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Home Team</Typography>
                  <TextField
                    required
                    fullWidth
                    label="Team Name"
                    value={formData.homeTeam.name}
                    onChange={(e) => handleTeamChange('homeTeam', 'name', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Score"
                    value={formData.homeTeam.score}
                    onChange={(e) => handleTeamChange('homeTeam', 'score', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 0 }}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Players (min 3)</Typography>
                  {formData.homeTeam.players.map((player, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        required
                        fullWidth
                        label={`Player ${index + 1}`}
                        value={player}
                        onChange={(e) => handleTeamChange('homeTeam', 'players', e.target.value, index)}
                        size="small"
                      />
                      {index >= 3 && (
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleRemovePlayer('homeTeam', index)}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  ))}
                  <Button 
                    variant="outlined" 
                    onClick={() => handleAddPlayer('homeTeam')}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Player
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Away Team</Typography>
                  <TextField
                    required
                    fullWidth
                    label="Team Name"
                    value={formData.awayTeam.name}
                    onChange={(e) => handleTeamChange('awayTeam', 'name', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Score"
                    value={formData.awayTeam.score}
                    onChange={(e) => handleTeamChange('awayTeam', 'score', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 0 }}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Players (min 3)</Typography>
                  {formData.awayTeam.players.map((player, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        required
                        fullWidth
                        label={`Player ${index + 1}`}
                        value={player}
                        onChange={(e) => handleTeamChange('awayTeam', 'players', e.target.value, index)}
                        size="small"
                      />
                      {index >= 3 && (
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleRemovePlayer('awayTeam', index)}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  ))}
                  <Button 
                    variant="outlined" 
                    onClick={() => handleAddPlayer('awayTeam')}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Player
                  </Button>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={prevStep}>
                Back
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Next
              </Button>
            </Box>
          </Box>
        );
      
      case 3:
        return (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>Submitter Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Your Name"
                  name="submitterName"
                  value={formData.submitterName}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="email"
                  label="Email Address"
                  name="submitterEmail"
                  value={formData.submitterEmail}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Verification Password"
                  name="submitterPassword"
                  value={formData.submitterPassword}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>
                  This is the password provided by your league administrator
                </FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Additional Notes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Any additional information about the match (optional)"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                      color="primary"
                      required
                    />
                  }
                  label="I certify that the information provided is accurate and I have permission to submit these results."
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={prevStep}>
                Back
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Submitting...' : 'Submit Results'}
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Submit Game Results
        </Typography>
        
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <Divider sx={{ position: 'absolute', top: '50%', left: 0, right: 0, zIndex: 1 }} />
            {[1, 2, 3].map((stepNumber) => (
              <Box 
                key={stepNumber} 
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: step >= stepNumber ? 'primary.main' : 'grey.300',
                  color: step >= stepNumber ? 'common.white' : 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  fontWeight: 'bold',
                }}
              >
                {stepNumber}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 2 }}>
            <Typography variant="caption" align="center" sx={{ width: 80 }}>Event Info</Typography>
            <Typography variant="caption" align="center" sx={{ width: 80 }}>Team Details</Typography>
            <Typography variant="caption" align="center" sx={{ width: 80 }}>Submit</Typography>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Results submitted successfully! You will receive a confirmation email shortly.
          </Alert>
        ) : (
          renderStep()
        )}
      </Paper>
    </Container>
  );
}

export default SubmitResultsForm;
