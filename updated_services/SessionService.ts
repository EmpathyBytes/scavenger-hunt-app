import { BaseService } from './BaseService';
import { GameState, Session } from '../types/updated_database';

export class SessionService extends BaseService {
  /**
   * Creates a new blank session with default values
   * 
   * Following the schema requirements, this creates a session with:
   * - Empty sessionName
   * - Specified creatorId
   * - Default time values (0)
   * - GameState set to LOBBY
   * - Empty participants and artifacts objects
   * 
   * @param sessionId - Unique identifier for the session
   * @param creatorId - User ID of the session creator
   * @throws Error if the session already exists
   */
  async createSession(sessionId: string, creatorId: string): Promise<void> {
    const exists = await this.exists(`sessions/${sessionId}`);
    if (exists) {
      throw new Error('Session already exists');
    }

    const newSession: Session = {
      sessionName: '',
      creatorId,
      startTime: 0,
      endTime: 0,
      gameState: GameState.LOBBY, // Initialized as Lobby by default
      participants: {},
      artifacts: {}
    };

    await this.setData(`sessions/${sessionId}`, newSession);
  }

  /**
   * Retrieves a session by ID
   * 
   * @param sessionId - Unique identifier for the session
   * @returns Session object or null if not found
   */
  async getSession(sessionId: string): Promise<Session | null> {
    return await this.getData<Session>(`sessions/${sessionId}`);
  }

  /**
   * Sets the display name for a session
   * 
   * @param sessionId - Unique identifier for the session
   * @param name - New name for the session
   * @throws Error if the session does not exist
   */
  async setSessionName(sessionId: string, name: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    await this.setData(`sessions/${sessionId}/sessionName`, name);
  }

  /**
   * Sets the start and end times for a session
   * 
   * Ensures that start time is before end time to maintain
   * temporal consistency of the session.
   * 
   * @param sessionId - Unique identifier for the session
   * @param startTime - Start timestamp (in milliseconds)
   * @param endTime - End timestamp (in milliseconds)
   * @throws Error if the session does not exist
   * @throws Error if startTime is not before endTime
   */
  async setTimes(sessionId: string, startTime: number, endTime: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    await this.setData(`sessions/${sessionId}/startTime`, startTime);
    await this.setData(`sessions/${sessionId}/endTime`, endTime);
  }

  /**
   * Sets the game state for a session
   * 
   * @param sessionId - Unique identifier for the session
   * @param newState - The GameState to apply to the session
   * @throws Error if the session does not exist
   */
  async setGameState(sessionId: string, newState: GameState): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    // Update the 'gameState' property instead of 'isActive'
    await this.setData(`sessions/${sessionId}/gameState`, newState);
  }

  /**
   * Adds an artifact to a session
   * 
   * Makes an artifact available to be found by users in this session.
   * Validates that both the session and artifact exist.
   * 
   * @param sessionId - Unique identifier for the session
   * @param artifactId - Artifact to add to the session
   * @throws Error if the session does not exist
   * @throws Error if the artifact does not exist
   */
  async addArtifact(sessionId: string, artifactId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const artifactExists = await this.exists(`artifacts/${artifactId}`);
    if (!artifactExists) throw new Error('Artifact not found');

    await this.setData(`sessions/${sessionId}/artifacts/${artifactId}`, true);
  }

  /**
   * Removes an artifact from a session
   * 
   * Following schema requirements:
   * - Validates artifact is part of the session
   * - Ensures no user has found this artifact in the session
   * - Updates the session's artifacts list
   * 
   * @param sessionId - Unique identifier for the session
   * @param artifactId - Artifact to remove from the session
   * @throws Error if the session does not exist
   * @throws Error if the artifact is not part of the session
   * @throws Error if any user has found the artifact in this session
   */
  async removeArtifact(sessionId: string, artifactId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.artifacts || !session.artifacts[artifactId]) {
      throw new Error('Artifact is not part of this session');
    }

    // More defensive check - treat undefined/null participants same as empty object
    if (session.participants) {
      for (const userId of Object.keys(session.participants)) {
        /*
        const userData = await this.getData(
          `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`
        );
        if (userData) {
          throw new Error('Cannot remove artifact that has been found by users');
        }
        */
        // changed location of foundArtifacts for participants 
        const found = await this.getData(`sessions/${sessionId}/participants/${userId}/foundArtifacts/${artifactId}`);
        if (found) {
          throw new Error('Cannot remove artifact that has been found by users');
        }
      }
    }

    await this.removeData(`sessions/${sessionId}/artifacts/${artifactId}`);
  }

  /**
   * Deletes a session completely from the system
   * 
   * Following schema requirements:
   * - Session must have no participants
   * 
   * This should be called only after removing all users
   * from the session.
   * 
   * @param sessionId - Unique identifier for the session
   * @throws Error if the session does not exist
   * @throws Error if the session still has participants
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    // More defensive checks for participants
    if (session.participants && Object.keys(session.participants).length > 0) {
      throw new Error('Cannot delete session with active participants');
    }

    await this.removeData(`sessions/${sessionId}`);
  }

  /**
   * Adds a user to a session as a participant
   * 
   * Creation Requirements:
   * - Session must exist
   * - User must not already be part of the session
   * 
   * Key Behaviors:
   * - Initializes participant entry under the session
   * - Sets default values:
   *   - points = 0
   *   - foundArtifacts = {}
   * 
   * @param sessionId - Unique identifier for the session
   * @param userId - User ID to add as participant
   * @throws Error if the session does not exist
   * @throws Error if the user is already part of this session
   */
  async addParticipant(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.participants && session.participants[userId]) {
      throw new Error('User is already part of this session');
    }

    await this.setData(`sessions/${sessionId}/participants/${userId}`, {
      points: 0,
      foundArtifacts: {}
    });
  }

  /**
   * Removes a user from a session
   * 
   * Removal Requirements:
   * - Session must exist
   * - User must currently be part of the session
   * 
   * Key Behaviors:
   * - Deletes the user's participant data from the session
   * - Does not affect other participants
   * 
   * @param sessionId - Unique identifier for the session
   * @param userId - User ID to remove from the session
   * @throws Error if the session does not exist
   * @throws Error if the user is not part of this session
   */
  async removeParticipant(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.participants || !session.participants[userId]) {
      throw new Error('User is not part of this session');
    }

    await this.removeData(`sessions/${sessionId}/participants/${userId}`);
  }

  /**
   * Adds a found artifact to a participant within a session
   * Records that a specific user/participant has found a given artifact
   * 
   * Validation Rules:
   * - Session must exist
   * - User must be a participant of the session
   * - Artifact must exist within the session’s artifact list
   * 
   * Key Behaviors:
   * - Adds artifactId under sessions/{sessionId}/participants/{userId}/foundArtifacts
   * - Marks it as `true` to indicate discovery
   * 
   * @param sessionId - Unique identifier for the session
   * @param userId - User ID of the participant
   * @param artifactId - Artifact ID found by the user
   * @throws Error if the session does not exist
   * @throws Error if the user is not part of the session
   * @throws Error if the artifact is not part of the session
   */
  async addFoundArtifact(sessionId: string, userId: string, artifactId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.participants || !session.participants[userId]) throw new Error('User is not part of this session');
    if (!session.artifacts || !session.artifacts[artifactId]) throw new Error('Artifact is not part of this session');

    await this.setData(`sessions/${sessionId}/participants/${userId}/foundArtifacts/${artifactId}`, true);
  }

  /**
   * Removes a found artifact from a participant
   * 
   * Validation Rules:
   * - Session must exist
   * - User must be a participant of the session
   * - Artifact must exist in user's foundArtifacts list
   * 
   * Key Behaviors:
   * - Removes artifactId from sessions/{sessionId}/participants/{userId}/foundArtifacts
   * 
   * @param sessionId - Unique identifier for the session
   * @param userId - User ID of the participant
   * @param artifactId - Artifact ID to remove from user's found list
   * @throws Error if the session does not exist
   * @throws Error if the user is not part of the session
   * @throws Error if the artifact is not found in participant's foundArtifacts
   */
  async removeFoundArtifact(sessionId: string, userId: string, artifactId: string): Promise<void> {  
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.participants || !session.participants[userId]) throw new Error('User is not part of this session');
    if (!session.participants[userId].foundArtifacts) throw new Error('Participant does not have foundArtifacts object');
    
    const found = await this.getData(
      `sessions/${sessionId}/participants/${userId}/foundArtifacts/${artifactId}`
    );
    if (!found) throw new Error('Artifact not found in participant\'s foundArtifacts');

    await this.removeData(`sessions/${sessionId}/participants/${userId}/foundArtifacts/${artifactId}`);
  }

  /**
   * Sets a participant’s total points within a session to a specific value
   * 
   * Validation Rules:
   * - Session must exist
   * - User must be a participant of the session
   * 
   * @param sessionId - Unique identifier for the session
   * @param userId - User ID of the participant
   * @param points - Amount to set user points to
   * @throws Error if the session does not exist
   * @throws Error if the user is not part of the session
   */
  async setPoints(sessionId: string, userId: string, points: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.participants || !session.participants[userId]) throw new Error('User is not part of this session');

    // const pointsPath = `sessions/${sessionId}/participants/${userId}/points`;
    // const current = (await this.getData<number>(pointsPath)) ?? 0;
    // await this.setData(pointsPath, current + points);

    await this.setData(`sessions/${sessionId}/participants/${userId}/points`, points)
  }

  /**
   * Adds to a participant’s total points within a session
   * - Adjusts the participant’s score by a delta (positive or negative)
   * - In other words, either add or subtract the current user amount
   * 
   * Validation Rules:
   * - Session must exist
   * - User must be a participant of the session
   * 
   * Key Behaviors:
   * - Retrieves current point total
   * - Adds delta (can be positive or negative)
   * - Writes updated point total to session
   * 
   * @param sessionId - Unique identifier for the session
   * @param userId - User ID of the participant
   * @param delta - Amount to adjust user’s points by (positive or negative)
   * @throws Error if the session does not exist
   * @throws Error if the user is not part of the session
   */
  async addPoints(sessionId: string, userId: string, delta: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.participants || !session.participants[userId]) throw new Error('User is not part of this session');

    const pointsPath = `sessions/${sessionId}/participants/${userId}/points`;
    const current = (await this.getData<number>(pointsPath)) ?? 0;
    await this.setData(pointsPath, current + delta);
  }


  /**
   * Lists all participants in a session
   * 
   * @param sessionId - Unique identifier for the session
   * @returns Array of user IDs that are participants in the session
   * @throws Error if the session does not exist
   */
  async listSessionParticipants(sessionId: string): Promise<string[]> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.participants || {});
  }

  /**
   * Lists all artifacts in a session
   * 
   * @param sessionId - Unique identifier for the session
   * @returns Array of artifact IDs that are available in the session
   * @throws Error if the session does not exist
   */
  async listSessionArtifacts(sessionId: string): Promise<string[]> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.artifacts || {});
  }
}
