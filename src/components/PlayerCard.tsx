'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Avatar, 
  Box, 
  Chip, 
  Typography,
  SxProps,
  Theme,
  useTheme
} from '@mui/material';
import { SPACING, MIXINS } from '@/theme/constants';
import { getPositionColor } from '@/theme/colors';
import { getPlayerAriaLabel } from '@/utils/accessibility';

export interface PlayerCardProps {
  /** Player ID for linking to player profile */
  id: string;
  /** Player's gamertag/username */
  gamertag: string;
  /** Player's position */
  position?: string | null;
  /** Player's team name */
  teamName?: string | null;
  /** Player's rating value */
  rating?: number | null;
  /** Label for the rating chip (defaults to the rating value) */
  ratingLabel?: string;
  /** Color theme for the rating chip */
  ratingColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  /** Background color for the avatar */
  avatarColor?: string;
  /** Whether this card should be highlighted (e.g., top player) */
  isHighlighted?: boolean;
  /** Optional rank to display (1, 2, 3, etc.) */
  rank?: number;
  /** Optional click handler */
  onClick?: () => void;
  /** Custom styles */
  sx?: SxProps<Theme>;
  /** Show team name under player name */
  showTeamName?: boolean;
  /** Show position chip */
  showPosition?: boolean;
  /** Show rating chip */
  showRating?: boolean;
  /** Custom avatar size */
  avatarSize?: number;
  /** Custom card elevation */
  elevation?: number;
  /** Custom card border radius */
  borderRadius?: number | string;
  /** Custom card padding */
  padding?: number | string;
}

/**
 * PlayerCard - A reusable player card component that displays player information in a compact format.
 * Supports highlighting, ranking, and various display options.
 */
const PlayerCard = React.forwardRef<HTMLDivElement, PlayerCardProps>(({
  id,
  gamertag,
  position,
  teamName,
  rating,
  ratingLabel,
  ratingColor = 'default',
  avatarColor,
  isHighlighted = false,
  rank,
  onClick,
  sx = {},
  showTeamName = true,
  showPosition = true,
  showRating = true,
  avatarSize = 40,
  elevation = 0,
  borderRadius = 1,
  padding = SPACING.ELEMENT,
}, ref) => {
  const theme = useTheme();

  // Medal emojis for top 3 ranks
  const getRankDisplay = () => {
    if (!rank) return null;
    
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  // Get the first letter of the gamertag for the avatar
  const avatarLetter = gamertag.charAt(0).toUpperCase();
  
  // Determine avatar background color if not provided
  const avatarBgColor = avatarColor || getPositionColor(position);
  
  // Card content component that can be wrapped in different containers
  const cardContent = (
    <Box 
      ref={ref}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: padding,
        borderRadius,
        bgcolor: isHighlighted ? 'action.selected' : 'background.paper',
        boxShadow: theme.shadows[elevation],
        transition: 'all 0.2s ease-in-out',
        '&:hover': !onClick ? undefined : {
          bgcolor: 'action.hover',
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[elevation + 2],
        },
        ...sx,
      }}
    >
      {/* Rank display (medal or number) */}
      {rank !== undefined && (
        <Box 
          sx={{ 
            mr: SPACING.ITEM, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: 24,
            fontSize: rank <= 3 ? '1.2rem' : '0.875rem',
            fontWeight: 'bold',
          }}
        >
          {getRankDisplay()}
        </Box>
      )}
      
      {/* Player avatar */}
      <Avatar 
        sx={{ 
          mr: SPACING.ELEMENT,
          width: avatarSize,
          height: avatarSize,
          bgcolor: avatarBgColor,
          color: 'white',
          fontSize: avatarSize * 0.5,
          fontWeight: 'bold',
        }}
        alt={gamertag}
      >
        {avatarLetter}
      </Avatar>
      
      {/* Player info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              ...MIXINS.TRUNCATE_TEXT,
              lineHeight: 1.2,
            }}
            title={gamertag}
          >
            {gamertag}
          </Typography>
          
          {showRating && rating !== undefined && rating !== null && (
            <Chip 
              label={ratingLabel || rating.toFixed(1)} 
              size="small" 
              color={isHighlighted ? ratingColor : 'default'}
              sx={{ 
                ml: SPACING.ITEM, 
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
        </Box>
        
        {/* Position and team info */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {showPosition && position && (
            <Chip
              label={position}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: `${getPositionColor(position)}22`,
                color: 'text.primary',
                border: '1px solid',
                borderColor: getPositionColor(position),
              }}
            />
          )}
          
          {showTeamName && teamName && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                ...MIXINS.TRUNCATE_TEXT,
                maxWidth: '100%',
                lineHeight: 1.4,
              }}
              title={teamName}
            >
              {teamName}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  // Return clickable card if onClick is provided
  if (onClick) {
    return (
      <Box 
        onClick={onClick} 
        sx={{ 
          cursor: 'pointer',
          '&:active': {
            transform: 'translateY(1px)',
          },
        }}
      >
        {cardContent}
      </Box>
    );
  }

  // Return link to player profile if no onClick handler
  return (
    <Link 
      href={`/players/${id}`} 
      style={{ 
        textDecoration: 'none', 
        color: 'inherit', 
        display: 'block',
      }}
      aria-label={getPlayerAriaLabel(gamertag, teamName, position)}
    >
      {cardContent}
    </Link>
  );
});

// Set display name for better dev tools
PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;
