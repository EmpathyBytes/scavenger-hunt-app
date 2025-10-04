import { BaseService } from './BaseService';
import { Session } from '../types/updated_database';

export class SessionService extends BaseService {
  /**
   * Creates a new blank session with default values
   * 
   * Following the schema requirements, this creates a session with:
   * - Empty sessionName
   * - Specified creatorId
   * - Default time values (0)
   * - isActive set to false
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
      isActive: false,
      participants: [],
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
   * Sets the active status for a session
   * 
   * Active status determines whether the session is currently running
   * and available for user participation.
   * 
   * @param sessionId - Unique identifier for the session
   * @param isActive - Whether the session should be active
   * @throws Error if the session does not exist
   */
  async setActiveStatus(sessionId: string, isActive: boolean): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    await this.setData(`sessions/${sessionId}/isActive`, isActive);
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
        const userData = await this.getData(
          `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`
        );
        if (userData) {
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
