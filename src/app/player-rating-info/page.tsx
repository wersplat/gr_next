import { Metadata } from 'next';
import PlayerRatingInfoPage from './player-rating-info-client';

export const metadata: Metadata = {
  title: 'Player Rating Info - NBA 2K Pro Am Global Rankings',
  description: 'Learn about the NBA 2K Pro Am Global Rankings player rating system, including the global rating formula, tier classification, and salary calculation.',
};

export default function Page() {
  return <PlayerRatingInfoPage />;
}
