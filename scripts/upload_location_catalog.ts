import admin from "firebase-admin";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { DATABASE_CONFIG } from "../config/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(
  __dirname,
  "../config/serviceAccountKey.json"
);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scavengerhunt-f9285-default-rtdb.firebaseio.com/",
});

async function uploadLocationCatalog() {
  try {
    const locationsPath = join(__dirname, "../dummy_data/locations.json");
    const locations = JSON.parse(fs.readFileSync(locationsPath, "utf8"));
    const database = admin.database();

    await database
      .ref(`${DATABASE_CONFIG.baseNode}/LocationCatalog`)
      .set(locations);

    console.log("LocationCatalog uploaded successfully.");
  } catch (error) {
    console.error("Failed to upload LocationCatalog:", error);
    process.exitCode = 1;
  } finally {
    await admin.app().delete();
  }
}

uploadLocationCatalog();
