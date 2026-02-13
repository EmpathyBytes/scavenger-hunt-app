import { SessionService } from '../updated_services/SessionService';
import { DATABASE_CONFIG } from '../config/config';

/**
 * Running this file:
 * 1. Ensure package.json has the script:
 *    "create-new-dummy-session": "tsx dummy_data/create_new_dummy_sessions.ts"
 * 
 * 2. Run the script using:
 *    npx tsx dummy_data/create_new_dummy_sessions.ts 
 * or
 *    npm run create-new-dummy-session
 *
 */


// Initialize services with the same base node as used in ServiceContext.js
const sessionService = new SessionService(DATABASE_CONFIG.baseNode);

/**
 * Create a dummy session (with UPDATED SCHEMA)
 */
async function createDummySession(): Promise<void> {
  try {
    console.log('Creating dummy sessions...');
    
    // Create a session with ID "Session1"
    const sessionId = "session1";
    const creatorId = "admin"; // Using "admin" as the creator ID
    console.log(`Creating session: ${sessionId}`);
    await sessionService.createSession(sessionId, creatorId);
    await sessionService.setSessionName(sessionId, "Demo Scavenger Hunt");
    
    // Set some sample times for the session (e.g., starting now and ending in 24 hours)
    const startTime = Date.now();
    const endTime = startTime + (24 * 60 * 60 * 1000); // 24 hours later
    await sessionService.setTimes(sessionId, startTime, endTime);

    
    console.log('Dummy session created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating dummy session:', error);
    process.exit(1);
  }
}

// Run the function
createDummySession().catch(error => {
  console.error('Failed to create dummy session:', error);
  process.exit(1);
});
