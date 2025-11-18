# Scavenger Hunt App for Georgia Tech

## Firebase CRUD Requirements and Rules for User, Session, Artifact, and Verification Objects

### Key Object Relationships and Rules Overview

#### Users and Sessions
- Users can join one sessions but may store multiple.
- User participation in a session is tracked in both the user object (`sessionsJoined`) and the session object (`participants`), which also tracks user's points and artifacts.
- A user can set any session they've joined as their "current" session.

#### Creating Objects
- Users and sessions are created as blank objects.
- Attributes are set later via update operations.
- This approach ensures proper initialization and consistent state.

#### Associations
- Users must be added to an existing session.
- The system enforces this sequence to maintain data integrity.
- Adding a user updates the user's sessionJoined map and session's participant object

#### Deletion Restrictions
- Users and sessions cannot be deleted if they have active associations.
- Users can only be deleted if they are not part of any sessions.
- Sessions can only be deleted if they have no users.

**Deletion Process:**  
To delete a user, UI programmers should:
1. Remove the user associations in each session.
2. Ensure the user has no active associations.
3. Remove the user from all sessions.
4. Delete the user once it has no associations.

---

## CRUD Operations and Constraints

## User Schema and Operations

```typescript
export interface User { 
  displayName: string; // Changed from username for consistency
  email: string; 
  profilePictureUrl?: string; 
  currentSession?: string; 
  sessionsJoined: { [sessionId: string]: boolean };
  isAdmin: boolean; 
  createdAt?: number; 
  updatedAt?: number; 
} 
```

### User Object Properties
- **displayName**: User's display name in the application
- **email**: User's email address
- **profilePictureUrl**: Optional URL to user's profile image
- **currentSession**: Optional ID of the session the user is currently active in
- **sessionsJoined**: Map of sessions the user has joined with boolean flag
- **isAdmin**: Boolean flag for administrative privileges
- **createdAt**: Timestamp of user creation
- **updatedAt**: Timestamp of last user update

### **User Operations**

#### **Create User**
```typescript
async createUser(userId: string): Promise<void>
```
- Creates a blank user object with `sessionsJoined` as an empty object
- Sets default values for all required fields
- Auto-populates timestamps

#### **User Profile Management**
```typescript
async setDisplayName(userId: string, displayName: string): Promise<void>
async setEmail(userId: string, email: string): Promise<void>
async setProfilePicture(userId: string, url: string): Promise<void>
async setAdminStatus(userId: string, isAdmin: boolean): Promise<void>
```
- Each setter updates a specific user property
- All setters automatically update the `updatedAt` timestamp
- Throws an error if the user doesn't exist

#### **Session Participation**
```typescript
async setCurrentSession(userId: string, sessionId: string | null): Promise<void>
```
- Sets which session is active for the user
- Can only set to sessions the user has already joined
- Set to null to clear the current session

```typescript
async addUserToSession(userId: string, sessionId: string): Promise<void>
```
- Validates both user and session existence
- Ensures user isn't already in the session
- Initializes user with empty foundArtifacts and zero points
- Updates both user and session records atomically
- Add user to session's participant map

```typescript
async removeUserFromSession(userId: string, sessionId: string): Promise<void>
```
- Validates user is part of the session
- Updates both user and session records
- Clears currentSession if it was set to this session

#### **User Queries**
```typescript
async getUser(userId: string): Promise<User | null>
```
- Retrieves user object by ID
- Returns null if user doesn't exist

```typescript
async listUserSessions(userId: string): Promise<string[]>
```
- Lists all sessions a user has joined
- Returns an empty array if user has no sessions

#### **Delete User**
```typescript
async deleteUser(userId: string): Promise<void>
```
- Validates user has no active session associations
- User must be removed from all sessions before deletion

---

## Session Schema and Operations

```typescript
export interface Session {
  sessionName: string;
  creatorId: string;
  startTime: number;
  endTime: number;
  gameState: GameState;
  participants: {
    [userId: string]: {
      points: number;
      foundArtifacts: { [artifactId: string]: boolean };
    };
  };
  artifacts: { [artifactId: string]: boolean };
}
```

### Session Object Properties
- **sessionName**: Display name for the session
- **creatorId**: ID of the user who created the session
- **startTime**: Unix timestamp when the session begins
- **endTime**: Unix timestamp when the session ends
- **gameState**: Current state of session represented by enum
- **participants**: Map of user IDs with their points and foundArtifacts set
- **artifacts**: Map of artifact IDs to boolean (availability indicator)

### **Session Operations**

#### **Create Session**
```typescript
async createSession(sessionId: string, creatorId: string): Promise<void>
```
- Creates a blank session object with empty participants and artifacts
- Sets creatorId to the provided value
- Sets default values for timestamps and status

#### **Session Configuration**
```typescript
async setSessionName(sessionId: string, name: string): Promise<void>
```
- Updates the session's display name

```typescript
async setTimes(sessionId: string, startTime: number, endTime: number): Promise<void>
```
- Sets the session's start and end times
- Validates that startTime is before endTime

```typescript
async setGameState(sessionId: string, newState: GameState): Promise<void>
```
- Sets the game state for a session

#### **Artifact Management**
```typescript
async addArtifact(sessionId: string, artifactId: string): Promise<void>
```
- Makes an artifact available in the session
- Validates both session and artifact existence
```typescript
async addFoundArtifact(sessionId: string, userId: string, artifactId: string):Promise<void>
```
- Makes an artifact available in the session
- Ensure user is within session
- Validates both session and artifact existence
- Add artifact to respective user's foundArtifacts within participants

```typescript
async removeFoundArtifact(sessionId: string, userId: string, artifactId: string): Promise<void>
```
- Validates user is part of the session
- Ensures artifact is part of the session participant's found artifacts
- Updates the participants's found artifacts set

```typescript
async removeArtifact(sessionId: string, artifactId: string): Promise<void>
```
- Validates artifact is part of the session
- Ensures no users have found this artifact in the session
- Updates the session's participants map to remove artifact from user's foundArtifacts

#### **User Management**
```typescript
async addParticipant(sessionId: string, userId: string): 
Promise<void>  
```
- Validates session exists and user is not already part of the session
- Initialize participant entry with 0 points and empty foundArtifacts

```typescript
async removeParticipant(sessionId: string, userId: string): 
Promise<void>  
```
- Validates session exists and user is part of the session
- Delete user entry from participants

```typescript
async setPoints(sessionId: string, userId: string, points: number): Promise<void>
```
- Validates user is part of the session
- Updates a user's points within participants object in the session
- Sets the absolute point value (not incremental)

```typescript
async addPoints(sessionId: string, userId: string, delta: number): Promise<void>
```
- Validates user is part of the session
- Updates a user's points within participants object in the session
- Adds (or subtract if negative) a number of points to the user's current points

#### **Session Queries**
```typescript
async getSession(sessionId: string): Promise<Session | null>
```
- Retrieves a session by ID
- Returns null if session doesn't exist

```typescript
async listSessionParticipants(sessionId: string): Promise<string[]>
async listSessionArtifacts(sessionId: string): Promise<string[]>
```
- Lists all participants or artifacts in a session
- Return empty arrays if none exist

#### **Delete Session**
```typescript
async deleteSession(sessionId: string): Promise<void>
```
- Validates session has no participants
- Completely removes the session from the database

---


## Artifact Schema and Operations

```typescript
export interface Artifact {
  name: string;
  description: string;
  locationHint: string;
  latitude: number;
  longitude: number;
  isChallenge: boolean;
  imageUrl?: string;
  audioUrl?: string;
}
```

### Artifact Object Properties
- **name**: Display name for the artifact
- **description**: Detailed artifact description
- **locationHint**: Text hint about where to find the artifact
- **latitude**: Geographic latitude coordinate
- **longitude**: Geographic longitude coordinate
- **isChallenge**: Flag for special challenge artifacts
- **imageUrl**: Optional URL to an image of the artifact
- **audioUrl**: Optional URL to related audio content

### **Artifact Operations**

#### **Create Artifact**
```typescript
async createArtifact(artifactId: string): Promise<void>
```
- Creates a new blank artifact with default values
- Must be separately added to sessions to be discoverable

#### **Artifact Configuration**
```typescript
async setName(artifactId: string, name: string): Promise<void>
async setDescription(artifactId: string, description: string): Promise<void>
async setLocationHint(artifactId: string, hint: string): Promise<void>
async setCoordinates(artifactId: string, latitude: number, longitude: number): Promise<void>
async setImageUrl(artifactId: string, imageUrl: string): Promise<void>
async setAudioUrl(artifactId: string, audioUrl: string): Promise<void>
async setChallengeStatus(artifactId: string, isChallenge: boolean): Promise<void>
```
- Individual setters for each artifact property
- Each validates artifact existence

#### **Artifact Queries**
```typescript
async getArtifact(artifactId: string): Promise<Artifact | null>
```
- Retrieves an artifact by ID
- Returns null if artifact doesn't exist

```typescript
async listSessionArtifacts(sessionId: string): Promise<string[]>
```
- Lists all artifacts in a session
- Returns an empty array if session has no artifacts

```typescript
async getArtifactLocation(artifactId: string): Promise<{ latitude: number; longitude: number }>
```
- Retrieves just the location coordinates of an artifact
- Used for mapping and proximity calculations

#### **Delete Artifact**
```typescript
async deleteArtifact(artifactId: string): Promise<void>
```
- Validates artifact is not used in any active session
- Completely removes the artifact from the database

---

## Error Messages for Operations

| **Operation** | **Error Message** |
|--------------|------------------|
| **Create User/Session/Artifact** | [Object] already exists. |
| **Any Getter or Setter** | [Object] not found. |
| **Add User to Session** | Session does not exist. / User is already part of this session. |
| **Remove User from Session** | User is not part of this session. |
| **Add Artifact to Participant's Found Artifacts** | Session does not exist. / User is not part of this session. / Artifact is not part of this session. |
| **Remove Artifact from Participant's Found Artifacts** | Session does not exist. / User is not part of this session. / Artifact is not in participant's founArtifacts. |
| **Update Points** Session does not exist. / User is not part of this session. |
| **Delete User** | User still has session associations. Remove from all sessions first. |
| **Delete Session** | Cannot delete session with active participants. |
| **Delete Artifact** | Cannot delete artifact that is part of an active session. |

---

## General Guidance for Deletion Operations

To delete a user or session, UI programmers should:

### Deleting a User:
1. For each session the user is in:
   - Call `removeUserFromSession()` to remove from the session
2. After removing from all sessions, call `deleteUser()`

### Deleting a Session:
1. For each user in the session:
   - Call `removeUserFromSession()` to remove from session
3. After session has no participants, call `deleteSession()`

### Deleting an Artifact:
1. Remove artifact from each session using `removeArtifact()`
2. After artifact is not in any session, call `deleteArtifact()`

---




