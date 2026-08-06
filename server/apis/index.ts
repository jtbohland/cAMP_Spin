import WheelDealMigrate from './wheel-deal/migrate.js';
import RecordSpin from './wheel-deal/record-spin.js';
import RecordPeerRating from './wheel-deal/record-peer-rating.js';
import GetLeaderboard from './wheel-deal/get-leaderboard.js';
import GetAnalytics from './wheel-deal/get-analytics.js';
import GetSpinDetails from './wheel-deal/get-spin-details.js';
import GetPeerRatings from './wheel-deal/get-peer-ratings.js';
import UpdateSpin from './wheel-deal/update-spin.js';
import RecordVisit from './wheel-deal/record-visit.js';
import GetProfile from './wheel-deal/get-profile.js';
import SaveProfile from './wheel-deal/save-profile.js';
import ScorePitch from './wheel-deal/score-pitch.js';
import RecordAiScore from './wheel-deal/record-ai-score.js';
import GetAiScoreTrend from './wheel-deal/get-ai-score-trend.js';

const apis = { WheelDealMigrate, RecordSpin, RecordPeerRating, GetLeaderboard, GetAnalytics, GetSpinDetails, GetPeerRatings, UpdateSpin, RecordVisit, GetProfile, SaveProfile, ScorePitch, RecordAiScore, GetAiScoreTrend } as const;
export default apis;
export type ApiRegistry = typeof apis;
