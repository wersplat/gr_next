export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface TeamRoster {
  team_id: string;
  teams: Team | null;
}

export interface Player {
  id: string;
  gamertag: string;
  position: string | null;
  overall_rating?: number | null;
  games_played?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  teams?: Team[] | null;
}

export interface PlayerWithTeam extends Omit<Player, 'teams'> {
  teams: Team | null;
  stats: PlayerStats | null;
}

export interface PlayerStats {
  games_played: number;
  points_per_game: number;
  assists_per_game: number;
  rebounds_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  minutes_per_game: number;
  turnovers_per_game: number;
  fouls_per_game: number;
  plus_minus: number;
}
