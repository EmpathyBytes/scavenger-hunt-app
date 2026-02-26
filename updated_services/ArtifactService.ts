import { BaseService } from './BaseService';
import { Artifact, Session } from '../types/updated_database';

export class ArtifactService extends BaseService {
  async getAllArtifacts(): Promise<Array<{ id: string } & Artifact>> {
    const artifacts = await this.getData<Record<string, Artifact>>('artifacts');
    if (!artifacts) return [];

    return Object.entries(artifacts)
      .map(([id, artifact]) => ({ id, ...(artifact ?? ({} as Artifact)) }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  /**
   * Creates a new blank artifact with default values
   * 
   * Following the schema requirements, this creates an artifact with:
   * - Empty name and description
   * - Empty locationHint
   * - Default coordinates (0,0)
   * - isChallenge set to false
   * 
   * @param artifactId - Unique identifier for the artifact
   * @throws Error if the artifact already exists
   */
  async createArtifact(artifactId: string): Promise<void> {
    const exists = await this.exists(`artifacts/${artifactId}`);
    if (exists) {
      throw new Error('Artifact already exists');
    }

    const newArtifact: Artifact = {
      name: '',
      description: '',
      locationHint: '',
      latitude: 0,
      longitude: 0,
      isChallenge: false
    };

    await this.setData(`artifacts/${artifactId}`, newArtifact);
  }

  /**
   * Retrieves an artifact by ID
   * 
   * @param artifactId - Unique identifier for the artifact
   * @returns Artifact object or null if not found
   */
  async getArtifact(artifactId: string): Promise<Artifact | null> {
    return await this.getData<Artifact>(`artifacts/${artifactId}`);
  }

  /**
   * Sets the display name for an artifact
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param name - New display name for the artifact
   * @throws Error if the artifact does not exist
   */
  async setName(artifactId: string, name: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/name`, name);
  }

  /**
   * Sets the description for an artifact
   * 
   * Description provides detailed information about what the 
   * artifact is and its significance in the scavenger hunt.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param description - Detailed description of the artifact
   * @throws Error if the artifact does not exist
   */
  async setDescription(artifactId: string, description: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/description`, description);
  }

  /**
   * Sets the location hint for an artifact
   * 
   * Location hint provides clues about where to find the artifact
   * without directly revealing its coordinates.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param hint - Textual hint about artifact location
   * @throws Error if the artifact does not exist
   */
  async setLocationHint(artifactId: string, hint: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/locationHint`, hint);
  }

  /**
   * Sets the geographic coordinates for an artifact
   * 
   * Defines the exact location of the artifact on the map.
   * These coordinates are used for proximity detection.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param latitude - Geographic latitude
   * @param longitude - Geographic longitude
   * @throws Error if the artifact does not exist
   */
  async setCoordinates(artifactId: string, latitude: number, longitude: number): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/latitude`, latitude);
    await this.setData(`artifacts/${artifactId}/longitude`, longitude);
  }

  /**
   * Sets the image URL for an artifact
   * 
   * Associates an image with the artifact, which can be
   * displayed in the UI for user recognition.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param imageUrl - URL to the artifact's image
   * @throws Error if the artifact does not exist
   */
  async setImageUrl(artifactId: string, imageUrl: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/imageUrl`, imageUrl);
  }

  /**
   * Sets the audio URL for an artifact
   * 
   * Associates an audio file with the artifact, which can
   * provide additional information or clues for users.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param audioUrl - URL to the artifact's audio file
   * @throws Error if the artifact does not exist
   */
  async setAudioUrl(artifactId: string, audioUrl: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/audioUrl`, audioUrl);
  }

  /**
   * Sets the challenge status for an artifact
   * 
   * Challenge artifacts may have special rules or provide
   * additional points when found by users.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @param isChallenge - Whether the artifact is a challenge artifact
   * @throws Error if the artifact does not exist
   */
  async setChallengeStatus(artifactId: string, isChallenge: boolean): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/isChallenge`, isChallenge);
  }

  /**
   * Deletes an artifact completely from the system
   * 
   * Following schema requirements:
   * - Validates artifact is not used in any active session
   * 
   * @param artifactId - Unique identifier for the artifact
   * @throws Error if the artifact does not exist
   * @throws Error if the artifact is part of an active session
   */
  async deleteArtifact(artifactId: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');

    // Check if artifact is used in any session
    const sessions = await this.getData<{ [key: string]: Session }>('sessions');
    if (sessions) {
      for (const sessionId of Object.keys(sessions)) {
        if (sessions[sessionId].artifacts[artifactId]) {
          throw new Error('Cannot delete artifact that is part of an active session');
        }
      }
    }

    await this.removeData(`artifacts/${artifactId}`);
  }

  /**
   * Lists all artifacts in a session
   * 
   * @param sessionId - Unique identifier for the session
   * @returns Array of artifact IDs that are part of the session
   * @throws Error if the session does not exist
   */
  async listSessionArtifacts(sessionId: string): Promise<string[]> {
    const session = await this.getData<Session>(`sessions/${sessionId}`);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.artifacts);
  }

  /**
   * Gets the geographic location of an artifact
   * 
   * Retrieves the coordinates for mapping and proximity calculations.
   * 
   * @param artifactId - Unique identifier for the artifact
   * @returns Object containing latitude and longitude
   * @throws Error if the artifact does not exist
   */
  async getArtifactLocation(artifactId: string): Promise<{ latitude: number; longitude: number }> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');

    return {
      latitude: artifact.latitude,
      longitude: artifact.longitude
    };
  }
}
