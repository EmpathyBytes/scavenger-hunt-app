import { BaseService } from './BaseService';
import { Team } from '../types/database';

export class TeamService extends BaseService {
  /**
   * Creates a new blank team with default values
   * 
   * Following the schema requirements, this creates a team with:
   * - Empty sessionId
   * - Empty teamName
   * - Empty members object
   * 
   * Teams should be created as blank objects and their attributes set later,
   * before they are added to a session.
   * 
   * @param teamId - Unique identifier for the team
   * @throws Error if the team already exists
   */
  async createTeam(teamId: string): Promise<void> {
    const exists = await this.exists(`teams/${teamId}`);
    if (exists) {
      throw new Error('Team already exists');
    }

    const newTeam: Team = {
      sessionId: '',
      teamName: '',
      members: {}
    };

    await this.setData(`teams/${teamId}`, newTeam);
  }

  /**
   * Retrieves a team by ID
   * 
   * @param teamId - Unique identifier for the team
   * @returns Team object or null if not found
   */
  async getTeam(teamId: string): Promise<Team | null> {
    return await this.getData<Team>(`teams/${teamId}`);
  }

  /**
   * Sets the display name for a team
   * 
   * @param teamId - Unique identifier for the team
   * @param name - New name for the team
   * @throws Error if the team does not exist
   */
  async setTeamName(teamId: string, name: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    await this.setData(`teams/${teamId}/teamName`, name);
  }

  /**
   * Adds a member to a team
   * 
   * Following schema requirements:
   * - Team must be assigned to a session first
   * - User must be part of the session before joining the team
   * - Updates both team and session records
   * 
   * @param teamId - Unique identifier for the team
   * @param userId - User to add to the team
   * @throws Error if the team does not exist
   * @throws Error if the team is not assigned to a session
   * @throws Error if the user is not part of the session
   * @throws Error if the user is already a member of the team
   */
  async addMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    if (!team.sessionId) {
      throw new Error('Team must be assigned to a session before adding members');
    }

    // Check if user exists in the team's session
    const userInSession = await this.exists(
      `sessions/${team.sessionId}/participants/${userId}`
    );
    if (!userInSession) {
      throw new Error('User must be part of the session before joining team');
    }

    // More defensive check - make sure members exists
    if (team.members && team.members[userId]) {
      throw new Error('User is already a member of this team');
    }

    await this.setData(`teams/${teamId}/members/${userId}`, true);
    await this.setData(
      `sessions/${team.sessionId}/participants/${userId}`,
      teamId
    );
  }

  /**
   * Removes a member from a team
   * 
   * Following schema requirements:
   * - Validates user is currently a member of the team
   * - Updates both team and session records to reflect the removal
   * 
   * @param teamId - Unique identifier for the team
   * @param userId - User to remove from the team
   * @throws Error if the team does not exist
   * @throws Error if the user is not a member of the team
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // More defensive check for members property
    if (!team.members || !team.members[userId]) {
      throw new Error('User is not a member of this team');
    }

    await this.removeData(`teams/${teamId}/members/${userId}`);
    if (team.sessionId) {
      await this.setData(
        `sessions/${team.sessionId}/participants/${userId}`,
        ''
      );
    }
  }

  /**
   * Deletes a team completely from the system
   * 
   * Following schema requirements:
   * - Team must not be part of any session (sessionId must be empty)
   * - Team must have no members
   * 
   * This should be called only after removing the team from its session
   * and ensuring all members have been removed.
   * 
   * @param teamId - Unique identifier for the team
   * @throws Error if the team does not exist
   * @throws Error if the team is still associated with a session
   * @throws Error if the team still has members
   */
  async deleteTeam(teamId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    if (team.sessionId) {
      throw new Error('Remove team from session before deletion');
    }

    // More defensive check for members property
    if (team.members && Object.keys(team.members).length > 0) {
      throw new Error('Remove all team members before deletion');
    }

    await this.removeData(`teams/${teamId}`);
  }

  /**
   * Lists all members of a team
   * 
   * @param teamId - Unique identifier for the team
   * @returns Array of user IDs who are members of the team
   * @throws Error if the team does not exist
   */
  async listTeamMembers(teamId: string): Promise<string[]> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // More defensive check when listing members
    return Object.keys(team.members || {});
  }

  /**
   * Gets the session ID that a team belongs to
   * 
   * @param teamId - Unique identifier for the team
   * @returns Session ID or null if the team is not assigned to a session
   * @throws Error if the team does not exist
   */
  async getTeamSession(teamId: string): Promise<string | null> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    return team.sessionId || null;
  }
  
}
