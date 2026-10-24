import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

type ArtifactRecord = {
  locationName?: string;
  locationHint?: string;
  hint?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const artifactsPath = join(__dirname, "artifacts.json");
const locationsPath = join(__dirname, "../dummy_data/locations.json");

const artifacts = JSON.parse(
  fs.readFileSync(artifactsPath, "utf8")
) as Record<string, ArtifactRecord>;

const locations = new Map<string, Record<string, unknown>>();

for (const [artifactId, artifact] of Object.entries(artifacts)) {
  const locationName = artifact.locationName?.trim();
  if (!locationName) continue;

  const id = locationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  if (!locations.has(id)) {
    locations.set(id, {
      name: locationName,
      hint: artifact.locationHint ?? artifact.hint ?? "",
      description: `Location for artifacts found at ${locationName}.`,
      latitude: artifact.latitude,
      longitude: artifact.longitude,
      artifacts: {},
    });
  }

  const location = locations.get(id);
  if (location && location.artifacts && typeof location.artifacts === "object") {
    (location.artifacts as Record<string, boolean>)[artifactId] = true;
  }
}

const locationCatalog = Object.fromEntries(
  [...locations.entries()].sort(([, left], [, right]) =>
    String(left.name).localeCompare(String(right.name))
  )
);

fs.writeFileSync(locationsPath, `${JSON.stringify(locationCatalog, null, 2)}\n`);
console.log(`Generated ${Object.keys(locationCatalog).length} locations.`);
