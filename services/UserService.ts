import { BaseService } from "./BaseService";
import { User, Team } from "../types/database";

export class UserService extends BaseService {
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
      throw new Error("User already exists");
    }

    const newUser: User = {
      displayName: "",
      email: "",
      sessionsJoined: {},
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
  async setDisplayName(userId: string, displayName: string): Promise<void> {
    // Renamed from setUsername
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    await this.setData(`users/${userId}/displayName`, displayName); // Changed path
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
    if (!user) throw new Error("User not found");

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
    if (!user) throw new Error("User not found");

    await this.setData(`users/${userId}/profilePictureUrl`, url);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async getCurrentSession(userId: string): Promise<string | null> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    return user.currentSession || null;
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
  async setCurrentSession(
    userId: string,
    sessionId: string | null
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    if (
      sessionId &&
      (!user.sessionsJoined || !user.sessionsJoined[sessionId])
    ) {
      throw new Error("User is not part of this session");
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
    if (!user) throw new Error("User not found");

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
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session to add the user to
   * @throws Error if the user does not exist
   * @throws Error if the session does not exist
   * @throws Error if the user is already in the session
   */
  async addUserToSession(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const sessionExists = await this.exists(`sessions/${sessionId}`);
    if (!sessionExists) throw new Error("Session does not exist");

    // More defensive check - treat undefined sessionsJoined same as empty object
    if (user.sessionsJoined && user.sessionsJoined[sessionId]) {
      throw new Error("User is already part of this session");
    }

    await this.setData(`users/${userId}/sessionsJoined/${sessionId}`, {
      points: 0,
      foundArtifacts: {},
      locationsFound: {},
    });
    await this.setData(`sessions/${sessionId}/participants/${userId}`, "");
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Removes a user from a session
   *
   * Following schema requirements:
   * - Validates user is part of the session
   * - Ensures user is not part of any team in the session
   * - Updates both user and session records
   * - Clears currentSession if it was set to this session
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session to remove the user from
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the user is still in a team (must be removed from team first)
   */
  async removeUserFromSession(
    userId: string,
    sessionId: string
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error("User is not part of this session");
    }

    const sessionData = user.sessionsJoined[sessionId];
    if (sessionData && sessionData.teamId) {
      throw new Error(
        "Remove user from team first before removing from session"
      );
    }

    await this.removeData(`users/${userId}/sessionsJoined/${sessionId}`);
    await this.removeData(`sessions/${sessionId}/participants/${userId}`);

    if (user.currentSession === sessionId) {
      await this.setData(`users/${userId}/currentSession`, null);
    }

    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Assigns a user to a team within a session
   *
   * Following schema requirements:
   * - Validates session and team existence
   * - Ensures user is part of the session
   * - Ensures team belongs to the session
   * - If user was in another team, removes them first
   * - Updates user, team, and session records atomically
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session in which to assign the team
   * @param teamId - Team to assign the user to
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the team does not exist
   * @throws Error if the team is not part of the session
   */
  async assignUserToTeam(
    userId: string,
    sessionId: string,
    teamId: string
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error("User is not part of this session");
    }

    const teamExists = await this.exists(`teams/${teamId}`);
    if (!teamExists) throw new Error("Team does not exist");

    const team = await this.getData<Team>(`teams/${teamId}`);
    if (!team) throw new Error("Team not found");

    if (team.sessionId !== sessionId) {
      throw new Error("Team does not belong to this session");
    }

    // If user is already in another team in this session, remove them first
    const currentTeamId = user.sessionsJoined[sessionId].teamId;
    if (currentTeamId) {
      await this.removeData(`teams/${currentTeamId}/members/${userId}`);
    }

    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/teamId`,
      teamId
    );
    await this.setData(`teams/${teamId}/members/${userId}`, true);
    await this.setData(`sessions/${sessionId}/participants/${userId}`, teamId);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Removes a user from their team in a session
   *
   * Following schema requirements:
   * - Validates user is part of the session
   * - Validates user is part of a team in that session
   * - Updates user, team, and session records atomically
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session from which to remove the team assignment
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the user is not in any team in this session
   */
  async removeUserFromTeam(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const sessionData = user.sessionsJoined?.[sessionId];
    if (!sessionData) throw new Error("User is not part of this session");

    const teamId = sessionData.teamId;
    if (!teamId)
      throw new Error("User is not part of any team in this session");

    await this.removeData(`teams/${teamId}/members/${userId}`);
    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/teamId`,
      null
    );
    await this.setData(`sessions/${sessionId}/participants/${userId}`, "");
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Marks an artifact as found by a user in a session
   *
   * Following schema requirements:
   * - Validates user is part of the session
   * - Validates artifact is part of the session
   * - Updates the user's found artifacts list
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session in which the artifact was found
   * @param artifactId - Artifact that was found
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the artifact is not part of the session
   */
  async addFoundArtifact(
    userId: string,
    sessionId: string,
    artifactId: string
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error("User is not part of this session");
    }

    const sessionExists = await this.exists(
      `sessions/${sessionId}/artifacts/${artifactId}`
    );
    if (!sessionExists) {
      throw new Error("Artifact is not part of this session");
    }

    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`,
      true
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Removes an artifact from a user's found artifacts in a session
   *
   * Following schema requirements:
   * - Validates user is part of the session
   * - Validates artifact was previously found by the user
   * - Updates the user's found artifacts list
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session from which to remove the found artifact
   * @param artifactId - Artifact to remove from found list
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the artifact is not in the user's found artifacts
   */
  async removeFoundArtifact(
    userId: string,
    sessionId: string,
    artifactId: string
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const sessionData = user.sessionsJoined?.[sessionId];
    if (!sessionData) throw new Error("User is not part of this session");

    if (
      !sessionData.foundArtifacts ||
      !sessionData.foundArtifacts[artifactId]
    ) {
      throw new Error("Artifact is not in user's found artifacts");
    }

    await this.removeData(
      `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Adds a found location to the user's session data
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session in which the location was found
   * @param locationId - Location that was found
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   */
  async addFoundLocation(
    userId: string,
    sessionId: string,
    locationId: string
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error(`User is not part of session ${sessionId}.`);
    }

    // Atomic write - same pattern as addFoundArtifact
    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/locationsFound/${locationId}`,
      true
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Removes a found location from the user's session data
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session from which to remove the location
   * @param locationId - Location to remove from found list
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   * @throws Error if the location is not in the user's found locations
   */
  async removeFoundLocation(
    userId: string,
    sessionId: string,
    locationId: string
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error(`User is not part of session ${sessionId}.`);
    }

    const sessionData = user.sessionsJoined[sessionId] as {
      locationsFound?: { [locationId: string]: boolean };
      points: number;
      foundArtifacts: { [artifactId: string]: boolean };
    };

    if (
      !sessionData.locationsFound ||
      !sessionData.locationsFound[locationId]
    ) {
      throw new Error(
        `Location ${locationId} is not in the user's found locations.`
      );
    }

    await this.removeData(
      `users/${userId}/sessionsJoined/${sessionId}/locationsFound/${locationId}`
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  /**
   * Updates a user's points in a session
   *
   * Points are tracked per-session for each user
   *
   * @param userId - Unique identifier for the user
   * @param sessionId - Session in which to update the points
   * @param points - New point value (not incremental)
   * @throws Error if the user does not exist
   * @throws Error if the user is not in the session
   */
  async updatePoints(
    userId: string,
    sessionId: string,
    points: number
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error("User is not part of this session");
    }

    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/points`,
      points
    );
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
    if (!user) throw new Error("User not found");

    // More defensive check for sessionsJoined
    if (user.sessionsJoined && Object.keys(user.sessionsJoined).length > 0) {
      throw new Error(
        "User still has session associations. Remove from all sessions first"
      );
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
    if (!user) throw new Error("User not found");

    return Object.keys(user.sessionsJoined || {});
  }
}
