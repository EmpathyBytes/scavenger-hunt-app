import { SessionService } from '../services/SessionService';
import { TeamService } from '../services/TeamService';
import { DATABASE_CONFIG } from '../config/config';

// Initialize services with the same base node as used in ServiceContext.js
const sessionService = new SessionService(DATABASE_CONFIG.baseNode);
const teamService = new TeamService(DATABASE_CONFIG.baseNode);

/**
 * Create a dummy session with two teams
 */
async function createDummySession(): Promise<void> {
  try {
    console.log('Creating dummy session and teams...');
    
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
    
    // Create Team A
    const teamAId = "teamA";
    console.log(`Creating team: ${teamAId}`);
    await teamService.createTeam(teamAId);
    await teamService.setTeamName(teamAId, "Team A");
    
    // Create Team B
    const teamBId = "teamB";
    console.log(`Creating team: ${teamBId}`);
    await teamService.createTeam(teamBId);
    await teamService.setTeamName(teamBId, "Team B");
    
    // Add teams to the session
    console.log(`Adding teams to session: ${sessionId}`);
    await sessionService.addTeam(sessionId, teamAId);
    await sessionService.addTeam(sessionId, teamBId);
    
    console.log('Dummy session and teams created successfully!');
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
