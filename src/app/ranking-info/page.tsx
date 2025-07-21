import { Metadata } from 'next';
import RankingInfoPage from './ranking-info-client';

export const metadata: Metadata = {
  title: 'Ranking System - NBA 2K Pro Am Global Rankings',
  description: 'Learn about the NBA 2K Pro Am Global Rankings system, RP categories, event tiers, and how teams are ranked.',
};

export default function Page() {
  return <RankingInfoPage />;
}
