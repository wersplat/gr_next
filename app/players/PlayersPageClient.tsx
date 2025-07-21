'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define basic player stats type
interface PlayerStats {
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
  [key: string]: number;
}

// Define the team interface
type TeamInfo = {
  id: string;
  name: string;
  logo_url: string | null;
};

// Define the player interface
interface Player {
  id: string;
  gamertag: string;
  performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  created_at: string;
  teams?: TeamInfo[];
  stats?: PlayerStats;
  position?: string;
  height?: string;
  weight?: string;
  age?: number;
  avatar_url?: string | null;
  [key: string]: any;
}

type PlayerWithTeam = Player;

type PlayersPageClientProps = {
  players: PlayerWithTeam[];
  showFallbackMessage?: boolean;
};

type SortField = 'gamertag' | 'performance_score' | 'position' | 'games_played' | 'team';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function PlayersPageClient({ players, showFallbackMessage = false }: PlayersPageClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'performance_score', direction: 'desc' });
  const [positionFilter, setPositionFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = players
      .map(player => player.position)
      .filter((position): position is string => Boolean(position))
      .filter((position, index, array) => array.indexOf(position) === index)
      .sort();
    return positions;
  }, [players]);

  // Get unique teams for filter
  const uniqueTeams = useMemo(() => {
    const teams = players
      .flatMap(player => player.teams || [])
      .filter((team, index, array) => array.findIndex(t => t.id === team.id) === index)
      .sort((a, b) => a.name.localeCompare(b.name));
    return teams;
  }, [players]);

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(player => 
        player.gamertag?.toLowerCase().includes(searchLower) ||
        player.teams?.some(team => team.name.toLowerCase().includes(searchLower)) ||
        player.position?.toLowerCase().includes(searchLower)
      );
    }

    // Apply position filter
    if (positionFilter) {
      filtered = filtered.filter(player => player.position === positionFilter);
    }

    // Apply team filter
    if (teamFilter) {
      filtered = filtered.filter(player => 
        player.teams?.some(team => team.id === teamFilter)
      );
    }

    // Apply sort based on sortBy value
    const [sortField, sortDirection] = sortBy.split('-') as [string, 'asc' | 'desc'];
    
    filtered = [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'rating':
          aVal = a.performance_score || 0;
          bVal = b.performance_score || 0;
          break;
        case 'name':
          aVal = a.gamertag?.toLowerCase() || '';
          bVal = b.gamertag?.toLowerCase() || '';
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'team':
          aVal = a.teams?.[0]?.name?.toLowerCase() || 'zzz';
          bVal = b.teams?.[0]?.name?.toLowerCase() || 'zzz';
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        default:
          aVal = 0;
          bVal = 0;
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [players, searchTerm, positionFilter, teamFilter, sortBy]);

  // Get paginated players
  const totalPages = Math.ceil(filteredAndSortedPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const paginatedPlayers = filteredAndSortedPlayers.slice(startIndex, startIndex + playersPerPage);

  // Get position abbreviation
  const getPositionAbbr = (position: string | undefined) => {
    if (!position) return '';
    const positionMap: { [key: string]: string } = {
      'Point Guard': 'PG',
      'Shooting Guard': 'SG',
      'Lock': 'LK',
      'Power Forward': 'PF',
      'Center': 'C'
    };
    return positionMap[position] || position;
  };

  if (showFallbackMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Players Database</h1>
        <p className="text-gray-600 mb-6 text-center max-w-2xl">
          Welcome to the NBA 2K Pro Am Global Rankings players database. Here you can explore detailed statistics and information about all registered players.
        </p>
        <button 
          onClick={() => router.refresh()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Players
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Table Container with UPA Styling */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Players</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredAndSortedPlayers.length} {filteredAndSortedPlayers.length === 1 ? 'player' : 'players'} found
              </p>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search players..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="w-full sm:w-auto">
              <label htmlFor="position-filter" className="block text-xs font-medium text-gray-700 mb-1">Position</label>
              <select 
                id="position-filter" 
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full sm:w-32 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Positions</option>
                <option value="Point Guard">PG</option>
                <option value="Shooting Guard">SG</option>
                <option value="Lock">LK</option>
                <option value="Power Forward">PF</option>
                <option value="Center">C</option>
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <label htmlFor="team-filter" className="block text-xs font-medium text-gray-700 mb-1">Team</label>
              <select 
                id="team-filter" 
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-by" className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
              <select 
                id="sort-by" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="team-asc">Team (A-Z)</option>
                <option value="team-desc">Team (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {players.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Table with Custom Scrollbar */}
        <div className="w-full overflow-x-auto" style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent'
        }}>
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(0,0,0,0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background-color: transparent;
            }
          `}</style>
          
          {filteredAndSortedPlayers.length > 0 ? (
            <table className="min-w-full custom-scrollbar" style={{ minWidth: '650px' }}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                    Player
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                    Team
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                    Position
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                    Rating
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                    Games
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedPlayers.map((player, index) => (
                  <tr 
                    key={player.id} 
                    className={`
                      transition-colors duration-150 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-200 last:border-b-0
                      ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                    `}
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          {player.avatar_url ? (
                            <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" src={player.avatar_url} alt="" />
                          ) : (
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                              {player.gamertag.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            <Link href={`/players/${player.id}`} className="hover:underline">
                              {player.gamertag}
                            </Link>
                          </div>
                          {player.height && player.weight && (
                            <div className="text-xs text-gray-500 leading-tight">
                              {player.height} • {player.weight} lbs
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                      {player.teams && player.teams.length > 0 ? (
                        <div className="flex items-center">
                          {player.teams[0].logo_url && (
                            <img className="h-6 w-6 rounded-full mr-2" src={player.teams[0].logo_url} alt="" />
                          )}
                          <span className="text-sm text-gray-900">{player.teams[0].name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Free Agent</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                      {player.position && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white border border-blue-600 shadow-sm">
                          {getPositionAbbr(player.position)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-5 whitespace-nowrap text-sm text-gray-900">
                      {player.performance_score?.toFixed(0) || '0'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-5 whitespace-nowrap text-sm text-gray-900">
                      {player.stats?.games_played || '0'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-5 whitespace-nowrap text-sm font-medium">
                      <Link href={`/players/${player.id}`} className="text-blue-600 hover:text-blue-900 hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : searchTerm || positionFilter || teamFilter ? (
            /* Empty State */
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No players found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          ) : null}
        </div>
        
        {/* Pagination */}
        {filteredAndSortedPlayers.length > playersPerPage && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + playersPerPage, filteredAndSortedPlayers.length)}</span> of <span className="font-medium">{filteredAndSortedPlayers.length}</span> players
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
