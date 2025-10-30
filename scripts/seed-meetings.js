// Seed the meetings data directly
import { seedMeetings } from '../utils/seedMeetings';

// Run the seeding
const meetings = seedMeetings();
console.log('Seeded meetings:', meetings);