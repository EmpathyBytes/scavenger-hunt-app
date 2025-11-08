import { BaseService } from './BaseService';
import { User } from '../types/updated_database';
import { SessionService } from './SessionService';

export class UserService extends BaseService {
  private sessionService: SessionService;

  constructor() {
    super();
    this.sessionService = new SessionService();
  }

  /**
   * Creates a new blank user with default values
   * 
   * Following the schema requirements, this creates a user with:
   * - Empty displayName and email
   * - Empty sessionsJoined object
   * - isAdmin set to false
   * - Auto-populated timestamps
   * 
   * @param userId - Unique identifier for the user
   * @throws Error if the user already exists
   */
  async createUser(userId: string): Promise<void> {
    const exists = await this.exists(`users/${userId}`);
    if (exists) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      displayName: '',
      email: '',
      sessionsJoined: {},
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.setData(`users/${userId}`, newUser);
  }

  /**
   * Retrieves a user by ID
   * 
   * @param userId - Unique identifier for the user
   * @returns User object or null if not found
   */
  async getUser(userId: string): Promise<User | null> {
    return await this.getData<User>(`users/${userId}`);
  }

  /**
   * Sets the display name for a user
   * 
   * Updates the user's displayName and updatedAt timestamp
   * 
   * @param userId - Unique identifier for the user
   * @param displayName - New display name for the user
   * @throws Error if the user does not exist
   */
  async setDisplayName(userId: string, displayName: string): Promise<void> {  // Renamed from setUsername
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/displayName`, displayName);  // Changed path
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Sets the email address for a user
   * 
   * Updates the user's email and updatedAt timestamp
   * 
   * @param userId - Unique identifier for the user
   * @param email - New email address for the user
   * @throws Error if the user does not exist
   */
  async setEmail(userId: string, email: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/email`, email);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Sets the profile picture URL for a user
   * 
   * Updates the user's profilePictureUrl and updatedAt timestamp
   * 
   * @param userId - Unique identifier for the user
   * @param url - URL to the user's profile picture
   * @throws Error if the user does not exist
   */
  async setProfilePicture(userId: string, url: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/profilePictureUrl`, url);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Sets the user's current active session
   * 
   * Current session can only be set to a session the user has already joined.
   * Setting to null clears the current session.
   * 
   * @param userId - Unique identifier for the user
   * @param sessionId - Session to set as current, or null to clear
   * @throws Error if the user does not exist
   * @throws Error if sessionId is not in user's sessionsJoined
   */
  async setCurrentSession(userId: string, sessionId: string | null): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    if (sessionId && (!user.sessionsJoined || !user.sessionsJoined[sessionId])) {
      throw new Error('User is not part of this session');
    }

    await this.setData(`users/${userId}/currentSession`, sessionId);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Sets the admin status for a user
   * 
   * @param userId - Unique identifier for the user
   * @param isAdmin - Whether the user should have admin privileges
   * @throws Error if the user does not exist
   */
  async setAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/isAdmin`, isAdmin);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Adds a user to a session
   * 
   * Following schema requirements:
   * - Validates both user and session existence
   * - Ensures user isn't already in the session
   * - Initializes user with empty foundArtifacts and zero points
   * - Updates both user and session records
   * - Add user to session's participant map
   * 
   * @param userId - Unique identifier for the user
   * @param sessionId - Session to add the user to
   * @throws Error if the user does not exist
   * @throws Error if the session does not exist
   * @throws Error if the user is already in the session
   */
  async addUserToSession(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const sessionExists = await this.exists(`sessions/${sessionId}`);
    if (!sessionExists) throw new Error('Session does not exist');
    
    // More defensive check - treat undefined sessionsJoined same as empty object
    if (user.sessionsJoined && user.sessionsJoined[sessionId]) {
      throw new Error('User is already part of this session');
    }

    // Add user to session's participants and updates user's sessionJoined set
    await this.sessionService.addParticipant(sessionId, userId);
    await this.setData(`users/${userId}/sessionsJoined/${sessionId}`, true);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Removes a user from a session
   * 
   * Following schema requirements:
   * - Validates user is part of the session
   * - Updates both user and session records
   * - Clears currentSession if it was set to this session
   * 
   * @param userId - Unique identifier for the user
   * @param sessionId - Session to remove the user from
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the user is still in a team (must be removed from team first)
   */
  async removeUserFromSession(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error('User is not part of this session');
    }

    await this.removeData(`users/${userId}/sessionsJoined/${sessionId}`);
    await this.sessionService.removeParticipant(sessionId, userId);
    // await this.removeData(`sessions/${sessionId}/participants/${userId}`);
    
    if (user.currentSession === sessionId) {
      await this.setData(`users/${userId}/currentSession`, null);
    }
    
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }


  /**
   * Deletes a user completely from the system
   * 
   * Following schema requirements:
   * - Validates user has no active session associations
   * - User must be removed from all teams and sessions before deletion
   * 
   * @param userId - Unique identifier for the user
   * @throws Error if the user does not exist
   * @throws Error if the user still has session associations
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    // More defensive check for sessionsJoined
    if (user.sessionsJoined && Object.keys(user.sessionsJoined).length > 0) {
      throw new Error('User still has session associations. Remove from all sessions first');
    }

    await this.removeData(`users/${userId}`);
  }

  /**
   * Lists all sessions a user has joined
   * 
   * @param userId - Unique identifier for the user
   * @returns Array of session IDs the user has joined
   * @throws Error if the user does not exist
   */
  async listUserSessions(userId: string): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    return Object.keys(user.sessionsJoined || {});
  }
}
