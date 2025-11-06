import { database } from '../firebase_config';
import { ref, get, set } from "firebase/database";

export async function getPlayerPoints(sessionId: string, playerId: string) {
  const playerRef = ref(database, `sessions/${sessionId}/players/${playerId}/points`);
  try {
    const snapshot = await get(playerRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return 0; // default if no points set yet
  } catch (error) {
    console.error("Error fetching player points:", error);
    throw error;
  }
}

export async function updatePlayerPoints(sessionId: string, playerId: string, pointsToAdd: number) {
  const playerRef = ref(database, `sessions/${sessionId}/players/${playerId}/points`);
  try {
    const snapshot = await get(playerRef);
    let currentPoints = 0;
    if (snapshot.exists()) {
      currentPoints = snapshot.val();
    }
    const newPoints = currentPoints + pointsToAdd;
    await set(playerRef, newPoints);
  } catch (error) {
    console.error("Error updating player points:", error);
    throw error;
  }
}
