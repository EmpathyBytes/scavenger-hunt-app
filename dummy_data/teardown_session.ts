import { services } from '../contexts/ServiceContext';

// Kick players from session; set session status to "finished"
// users are moved to *join session screen*
// Use listeners to check user status on Firebase (if they are still within session)
// If not, redirect to join session screen

// This will be called by admin; can move to sessionService later if needed (!!!)

/**
 * Removes all users from a specific session.
 * This triggers the database changes that the client apps will listen to.
 */
export const endSessionAndKickUsers = async (sessionId: string) => {
  const { sessionService, userService } = services;

  try {
    // 1. Get the session to find current participants
    // Can also call listSessionParticipants() in updated sessionService
    const session = await sessionService.getSession(sessionId);

    if (!session || !session.participants) {
      console.log('Session is empty or does not exist');
      return;
    }

    const participantIds = Object.keys(session.participants);

    // 2. Remove each user using the existing UserService logic
    // Promise.all to execute these in parallel
    await Promise.all(
      participantIds.map(async (userId) => {
        try {
          // This method already:
          // - Removes user from session's participant list
          // - Removes session from user's sessionsJoined
          // - Sets user.currentSession to null
          await userService.removeUserFromSession(userId, sessionId);
          console.log(`Removed user ${userId}`);
        } catch (err) {
          console.error(`Failed to remove user ${userId}:`, err);
        }
      })
    );

    console.log('All users removed from session');
    
    // Optional: Delete the session entirely, handle appropriately
    // await sessionService.deleteSession(sessionId); 
    // Or set session state to "finished"
    // await sessionService.setGameState(sessionId, 'finished');
    // console.log(`Session ${sessionId} set to finished state`);

  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};