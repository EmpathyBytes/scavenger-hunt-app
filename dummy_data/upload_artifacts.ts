import { ArtifactService } from '../services/ArtifactService';
import { DATABASE_CONFIG } from '../config/config';
import * as fs from 'fs';
import * as path from 'path';

// Initialize artifact service with the same base node as used in the app
const artifactService = new ArtifactService(DATABASE_CONFIG.baseNode);

// Read artifacts data from JSON file
const artifactsFilePath = path.join(__dirname, 'artifacts.json');
const artifactsData = JSON.parse(fs.readFileSync(artifactsFilePath, 'utf8'));

/**
 * Upload a single artifact to the database
 */
async function uploadArtifact(artifactId: string, artifactData: any): Promise<void> {
  try {
    console.log(`Creating artifact: ${artifactId}`);
    
    // Create the artifact first
    await artifactService.createArtifact(artifactId);
    
    // Set all the properties
    if (artifactData.name) {
      await artifactService.setName(artifactId, artifactData.name);
    }
    
    if (artifactData.description) {
      await artifactService.setDescription(artifactId, artifactData.description);
    }
    
    if (artifactData.locationHint) {
      await artifactService.setLocationHint(artifactId, artifactData.locationHint);
    }
    
    if (artifactData.latitude !== undefined && artifactData.longitude !== undefined) {
      await artifactService.setCoordinates(artifactId, artifactData.latitude, artifactData.longitude);
    }
    
    if (artifactData.isChallenge !== undefined) {
      await artifactService.setChallengeStatus(artifactId, artifactData.isChallenge);
    }
    
    if (artifactData.imageUrl) {
      await artifactService.setImageUrl(artifactId, artifactData.imageUrl);
    }
    
    if (artifactData.audioUrl) {
      await artifactService.setAudioUrl(artifactId, artifactData.audioUrl);
    }
    
    console.log(`Successfully uploaded artifact: ${artifactId}`);
  } catch (error) {
    console.error(`Error uploading artifact ${artifactId}:`, error);
  }
}

/**
 * Upload all artifacts from the JSON file
 */
async function uploadAllArtifacts(): Promise<void> {
  console.log('Starting artifact upload...');
  
  // Process artifacts sequentially to avoid potential race conditions
  for (const artifactId of Object.keys(artifactsData)) {
    await uploadArtifact(artifactId, artifactsData[artifactId]);
  }
  
  console.log('Artifact upload complete!');
  process.exit(0);
}

// Start the upload process
uploadAllArtifacts().catch(error => {
  console.error('Upload failed:', error);
  process.exit(1);
});
