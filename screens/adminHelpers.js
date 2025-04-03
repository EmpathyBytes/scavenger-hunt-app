import 'react-native-get-random-values';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useServices } from '../contexts/ServiceContext';



export const createSession = async (sessionService, creatorId, sessionData) => {
  try {

    const sessionId = uuidv4();

    await sessionService.createSession(sessionId, creatorId);

    // Optionally, update the session with additional data (e.g., sessionName)
    if (sessionData) {
      await sessionService.setSessionName(sessionId, sessionData.sessionName);
      await sessionService.setActiveStatus(sessionId, sessionData.isActive);
      await sessionService.setTimes(sessionId, sessionData.startTime, sessionData.endTime);
    }

    // Return the created session ID
    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    const response = await fetch(`https://api.example.com/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error deleting session');
    }
    await deleteDoc(doc(db, 'sessions', sessionId)); // Delete the session ID from Firebase
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

export const updateSession = async (sessionId, updatedData) => {
  try {
    const response = await fetch(`https://api.example.com/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};