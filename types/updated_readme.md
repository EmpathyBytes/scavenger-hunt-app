# Scavenger Hunt App for Georgia Tech

## Firebase CRUD Requirements and Rules for User, Session, Team, Artifact, and Verification Objects

### Key Object Relationships and Rules Overview

#### Users and Sessions
- Users can join one sessions but may store multiple.
- User participation in a session is tracked in both the user object (`sessionsJoined`) and the session object (`participants`).
- A user can set any session they've joined as their "current" session.

#### Creating Objects
- Users and sessions are created as blank objects.
- Attributes are set later via update operations.
- This approach ensures proper initialization and consistent state.

#### Associations
- Users must be added to an existing session.
- The system enforces this sequence to maintain data integrity.

#### Deletion Restrictions
- Users and sessions cannot be deleted if they have active associations.
- Users can only be deleted if they are not part of any sessions.
- Sessions can only be deleted if they have no users.

**Deletion Process:**  
To delete a user or a team, UI programmers should:
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
  sessionsJoined: { 
    [sessionId: string]: { 
      points: number; 
      foundArtifacts: { [artifactId: string]: boolean }; 
    }; 
  }; 
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
- **sessionsJoined**: Map of sessions the user has joined with session-specific data
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

```typescript
async removeUserFromSession(userId: string, sessionId: string): Promise<void>
```
- Validates user is part of the session
- Updates both user and session records
- Clears currentSession if it was set to this session

#### **Artifact Discovery**
```typescript
async addFoundArtifact(userId: string, sessionId: string, artifactId: string): Promise<void>
```
- Validates user is part of the session
- Validates artifact is part of the session
- Updates the user's found artifacts list

```typescript
async removeFoundArtifact(userId: string, sessionId: string, artifactId: string): Promise<void>
```
- Validates user is part of the session
- Ensures artifact is part of the user's found artifacts
- Updates the user's found artifacts list

```typescript
async updatePoints(userId: string, sessionId: string, points: number): Promise<void>
```
- Updates a user's points within a specific session
- Sets the absolute point value (not incremental)
- Validates user is part of the session

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
  isActive: boolean;
  participants: { [userId: string]: string }; // userId -> teamId
  artifacts: { [artifactId: string]: boolean }; // Available artifacts in this session
}
```

### Session Object Properties
- **sessionName**: Display name for the session
- **creatorId**: ID of the user who created the session
- **startTime**: Unix timestamp when the session begins
- **endTime**: Unix timestamp when the session ends
- **isActive**: Boolean flag for active status
- **participants**: Array of user IDs in session
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
async setActiveStatus(sessionId: string, isActive: boolean): Promise<void>
```
- Sets whether the session is currently active

#### **Artifact Management**
```typescript
async addArtifact(sessionId: string, artifactId: string): Promise<void>
```
- Makes an artifact available in the session
- Validates both session and artifact existence

```typescript
async removeArtifact(sessionId: string, artifactId: string): Promise<void>
```
- Validates artifact is part of the session
- Ensures no users have found this artifact in the session
- Updates the session's artifacts list

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
| **Add Artifact to User's Found Artifacts** | User is not part of this session. / Artifact is not part of this session. |
| **Remove Artifact from User's Found Artifacts** | User is not part of this session. / Artifact is not in user's found artifacts. |
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




