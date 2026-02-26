import admin from 'firebase-admin';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { DATABASE_CONFIG } from '../config/config';

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
// Make sure you have your service account JSON
const serviceAccountPath = join(__dirname, '../config/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scavengerhunt-f9285-default-rtdb.firebaseio.com/"
});

const db = admin.database();

async function uploadAllArtifacts() {
  try {
    // Read artifacts JSON
    const artifactsFilePath = join(__dirname, 'artifacts.json');
    const artifactsData = JSON.parse(fs.readFileSync(artifactsFilePath, 'utf8'));

    const baseNode = DATABASE_CONFIG.baseNode;
    const catalogRef = db.ref(`${baseNode}/ArtifactCatalog`);

    await catalogRef.set(artifactsData);

    console.log("ArtifactCatalog uploaded successfully!");
  } catch (error) {
    console.error("Failed to upload ArtifactCatalog:", error);
    process.exit(1);
  }

  // Give Firebase a moment to finish
  setTimeout(() => process.exit(0), 1000);
}

uploadAllArtifacts();


// import { database } from '../firebase_config.js';
// import { DATABASE_CONFIG } from '../config/config.js';
// import { ref, set } from 'firebase/database';
// import fs from 'fs';
// import { dirname, join } from 'path';
// import { fileURLToPath } from 'url';

// // __dirname workaround for ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// async function uploadAllArtifacts() {
//   try {
//     const artifactsFilePath = join(__dirname, 'artifacts.json');
//     const artifactsData = JSON.parse(fs.readFileSync(artifactsFilePath, 'utf8'));

//     const catalogRef = ref(database, `${DATABASE_CONFIG.baseNode}/ArtifactCatalog`);

//     await set(catalogRef, artifactsData);

//     console.log("ArtifactCatalog uploaded successfully!");
//   } catch (error) {
//     console.error("Failed to upload ArtifactCatalog:", error);
//     process.exit(1);
//   }

//   setTimeout(() => process.exit(0), 1000);
// }

// uploadAllArtifacts();