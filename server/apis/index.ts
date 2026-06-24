import WheelDealMigrate from './wheel-deal/migrate.js';
import RecordSpin from './wheel-deal/record-spin.js';
import RecordPeerRating from './wheel-deal/record-peer-rating.js';
import GetLeaderboard from './wheel-deal/get-leaderboard.js';
import GetAnalytics from './wheel-deal/get-analytics.js';
import GetSpinDetails from './wheel-deal/get-spin-details.js';
import GetPeerRatings from './wheel-deal/get-peer-ratings.js';
import UpdateSpin from './wheel-deal/update-spin.js';
import RecordVisit from './wheel-deal/record-visit.js';

const apis = { WheelDealMigrate, RecordSpin, RecordPeerRating, GetLeaderboard, GetAnalytics, GetSpinDetails, GetPeerRatings, UpdateSpin, RecordVisit } as const;
export default apis;
export type ApiRegistry = typeof apis;
