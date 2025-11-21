import { services } from '../contexts/ServiceContext';
import { DATABASE_CONFIG } from '../config/config';
import * as fs from 'fs';
import * as path from 'path';


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
        await services.artifactService.createArtifact(artifactId);
        
        // Set all the properties
        if (artifactData.name) {
        await services.artifactService.setName(artifactId, artifactData.name);
        }
        
        if (artifactData.description) {
        await services.artifactService.setDescription(artifactId, artifactData.description);
        }
        
        if (artifactData.locationHint) {
        await services.artifactService.setLocationHint(artifactId, artifactData.locationHint);
        }
        
        if (artifactData.latitude !== undefined && artifactData.longitude !== undefined) {
        await services.artifactService.setCoordinates(artifactId, artifactData.latitude, artifactData.longitude);
        }
        
        if (artifactData.isChallenge !== undefined) {
        await services.artifactService.setChallengeStatus(artifactId, artifactData.isChallenge);
        }
        
        if (artifactData.imageUrl) {
        await services.artifactService.setImageUrl(artifactId, artifactData.imageUrl);
        }
        
        if (artifactData.audioUrl) {
        await services.artifactService.setAudioUrl(artifactId, artifactData.audioUrl);
        }
        
        console.log(`Successfully uploaded artifact: ${artifactId}`);
    } catch (error) {
        console.error(`Error uploading artifact ${artifactId}:`, error);
    }
}

async function uploadNewSession(sessionId: string, creatorId: string, sessionName: string): Promise<void> {
    try {
        console.log(`Creating session: ${sessionId}`);

        await services.sessionService.createSession(sessionId, creatorId);

        // session name as param input
        await services.sessionService.setSessionName(sessionId, sessionName);

        // Set some sample times for the session (e.g., starting now and ending in 24 hours)
        const startTime = Date.now();
        const endTime = startTime + (24 * 60 * 60 * 1000); // 24 hours later
        await services.sessionService.setTimes(sessionId, startTime, endTime);

        // participants loaded later

        // artifacts: assumes every artifact is availiable on init
        for (const artifactId of Object.keys(artifactsData)) {
            await services.sessionService.addArtifact(sessionId, artifactId);
        }

        console.log(`Successfully created session: ${sessionId}`);
    } catch (error) {
        console.error(`Error uploading session ${sessionId}`, error);
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
}

// // Start the upload process
// uploadAllArtifacts().catch(error => {
//   console.error('Upload failed:', error);
//   process.exit(1);
// });
