/**
 * Firebase Service Layer Integration Tests
 * ======================================
 * 
 * Purpose:
 * These tests verify the data integrity and operation sequencing of the Firebase service layer.
 * They ensure proper creation, association, and deletion of objects following the schema rules.
 * 
 * Files Being Tested:
 * - services/UserService.ts: User management and associations
 * - services/SessionService.ts: Session management and relationships
 * - services/ArtifactService.ts: Artifact management and discovery
 * 
 * Prerequisites:
 * 1. Node.js (v16+) installed
 * 2. Firebase project set up with Realtime Database
 * 3. Firebase configuration in firebaseConfig.ts
 * 
 * Setup:
 * 1. Install required dependencies:
 *    npm install
 * 
 * 2. Install tsx globally (if not already installed):
 *    npm install -g tsx
 * 
 *    What is tsx?
 *    - tsx is a Node.js runtime for TypeScript and ESM
 *    - It allows direct execution of TypeScript files without compilation
 * 
 * Running the Tests:
 *    tsx <path to the file>/testServices.ts
 *    or: npx tsx <path>/updatedSchemaTests.ts
 * 
 * Test Suites:
 * 
 * Database Impact:
 * Tests write to isolated nodes:
 * - SchemaTest_NoTeams_Test[test number]
 * 
 * Each test cleans up its node before starting.
 * 
 */

import { UserService } from '../updated_services/UserService';
import { SessionService } from '../updated_services/SessionService';
import { ArtifactService } from '../updated_services/ArtifactService';
import { database } from '../firebase_config';
import { GameState } from '../types/updated_database';
import { ref, remove } from 'firebase/database';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearTestNode(baseNode: string) {
  console.log(`Clearing test node: ${baseNode}`);
  await remove(ref(database, baseNode));
  await sleep(1000); // Wait for cleanup to complete
  console.log('Test node cleared');
}
// Tests for schema before foundArtifact logic changed (when users contained this data)
/*
async function runTest1() {
  console.log('\nStarting Test 1: Basic CRUD Operations');
  const baseNode = 'SchemaTest_NoTeams_Test1';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Step 1: Create blank objects
    console.log('\nStep 1: Creating blank objects...');
    await userService.createUser('user1');
    await userService.createUser('user2');
    await sessionService.createSession('session1', 'admin1');
    await artifactService.createArtifact('artifact1');
    console.log('✓ Created blank objects');

    // Step 2: Set basic attributes
    console.log('\nStep 2: Setting basic attributes...');
    await userService.setDisplayName('user1', 'Alice');
    await userService.setEmail('user1', 'alice@test.com');
    await userService.setDisplayName('user2', 'Bob');
    await userService.setEmail('user2', 'bob@test.com');
    
    await sessionService.setSessionName('session1', 'Test Hunt');
    await sessionService.setTimes('session1', Date.now(), Date.now() + 3600000);
    
    await artifactService.setName('artifact1', 'Golden Key');
    await artifactService.setDescription('artifact1', 'A special key');
    await artifactService.setCoordinates('artifact1', 1.234, 5.678);
    console.log('✓ Set basic attributes');

    // Step 3: Test associations in correct order
    console.log('\nStep 3: Testing associations...');
    // Add artifact to session
    await sessionService.addArtifact('session1', 'artifact1');
    console.log('✓ Added artifact to session');

    // Add users to session
    await userService.addUserToSession('user1', 'session1');
    await userService.addUserToSession('user2', 'session1');
    console.log('✓ Added users to session');

    // Test current session setting
    await userService.setCurrentSession('user1', 'session1');
    console.log('✓ Set current session for user1');

    // Add found artifact
    await userService.addFoundArtifact('user1', 'session1', 'artifact1');
    await userService.updatePoints('user1', 'session1', 10);
    console.log('✓ Added found artifact and updated points');

    // Step 4: Test queries (new)
    console.log('\nStep 4: Testing queries...');
    const user1Sessions = await userService.listUserSessions('user1');
    const sessionParticipants = await sessionService.listSessionParticipants('session1');
    const sessionArtifacts = await sessionService.listSessionArtifacts('session1');
    
    if (!user1Sessions.includes('session1')) throw new Error('User sessions query failed');
    if (!sessionParticipants.includes('user1')) throw new Error('Session participants query failed');
    if (!sessionArtifacts.includes('artifact1')) throw new Error('Session artifacts query failed');
    console.log('✓ All queries working correctly');

    // Step 5: Test removal in reverse order
    console.log('\nStep 5: Testing removal in reverse order...');
    // Remove found artifact
    await userService.removeFoundArtifact('user1', 'session1', 'artifact1');
    console.log('✓ Removed found artifact');

    // Clear current session for target user (optional since we delete, anyways)
    await userService.setCurrentSession('user1', null);
    console.log('✓ Cleared current session');

    // Remove users from session
    await userService.removeUserFromSession('user1', 'session1');
    await userService.removeUserFromSession('user2', 'session1');
    console.log('✓ Removed users from session');

    // Remove artifact from session
    await sessionService.removeArtifact('session1', 'artifact1');
    console.log('✓ Removed artifact from session');

    // Step 6: Delete blank objects
    console.log('\nStep 6: Deleting blank objects...');
    await sessionService.deleteSession('session1');
    await userService.deleteUser('user1');
    await userService.deleteUser('user2');
    await artifactService.deleteArtifact('artifact1');
    console.log('✓ Deleted all objects');

    console.log('\nTest 1 completed successfully! ✨');
  } catch (error) {
    console.error('Test 1 failed:', error);
    throw error;
  }
}

async function runTest2() {
  console.log('\nStarting Test 2: Complex Operations and Validation Test');
  const baseNode = 'SchemaTest_NoTeams_Test2';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Section 1: Multi-session Setup
    console.log('\nCreating multiple sessions and users...');
    await sessionService.createSession('session1', 'admin1');
    await sessionService.createSession('session2', 'admin1');
    await sessionService.setSessionName('session1', 'Campus Hunt');
    await sessionService.setSessionName('session2', 'Library Hunt');
    
    await userService.createUser('user_A');
    await userService.setDisplayName('user_A', 'Alice');
    await userService.createUser('user_B');
    await userService.setDisplayName('user_B', 'Ben');
    await userService.createUser('user_C');
    await userService.setDisplayName('user_C', 'Chris');
    
    // Add users to multiple sessions
    await userService.addUserToSession('user_A', 'session1');
    await userService.addUserToSession('user_B', 'session1');
    await userService.addUserToSession('user_C', 'session1');
    
    await userService.addUserToSession('user_A', 'session2');
    await userService.addUserToSession('user_B', 'session2');
    console.log('✓ Users added to multiple sessions');

    // Test current session management
    await userService.setCurrentSession('user_A', 'session1');
    await userService.setCurrentSession('user_B', 'session2');
    console.log('✓ Current sessions set');

    // Section 2: Artifact Setup and Discovery
    console.log('\nSetting up artifacts and testing discovery...');
    await artifactService.createArtifact('artifact1');
    await artifactService.createArtifact('artifact2');
    await artifactService.createArtifact('artifact3');
    
    await artifactService.setName('artifact1', 'Historic Bell');
    await artifactService.setName('artifact2', 'Fountain Coin');
    await artifactService.setName('artifact3', 'Library Book');
    
    // Add artifacts to sessions
    await sessionService.addArtifact('session1', 'artifact1');
    await sessionService.addArtifact('session1', 'artifact2');
    await sessionService.addArtifact('session1', 'artifact3');
    await sessionService.addArtifact('session2', 'artifact1');
    await sessionService.addArtifact('session2', 'artifact2');
    await sessionService.addArtifact('session2', 'artifact3');
    console.log('✓ Artifacts added to sessions');

    // Users find artifacts in different sessions
    // Note: Thinking that we should have map of all artifacts with location and score
    await userService.addFoundArtifact('user_A', 'session1', 'artifact1');
    await userService.updatePoints('user_A', 'session1', 15);

    await userService.addFoundArtifact('user_B', 'session1', 'artifact2');
    await userService.updatePoints('user_B', 'session1', 10);

    await userService.addFoundArtifact('user_A', 'session1', 'artifact3');
    await userService.updatePoints('user_A', 'session1', 20);
    console.log('✓ Artifacts found and points updated');

    // Section 3: Validation and Error Testing
    console.log('\nTesting validation rules...');
    
    // Test duplicate session joining
    try {
      await userService.addUserToSession('user_A', 'session1');
      throw new Error('Should not be able to join session twice');
    } catch (e: Error | any) {
      if (!e.message.includes('already part of this session')) throw e;
    }
    console.log('✓ Duplicate session joining prevented');

    // Test artifact finding validation
    // not really necessary, probably, since list of available artifacts consistent
    try {
      await userService.addFoundArtifact('user_C', 'session1', 'artifact4');
      throw new Error('Should not find artifact not in session');
    } catch (e: Error | any) {
      if (!e.message.includes('Artifact is not part of this session')) throw e;
    }
    console.log('✓ Cross-session artifact finding prevented');

    // Test deletion restrictions
    try {
      await userService.deleteUser('user_A');
      throw new Error('Should not delete user with session associations');
    } catch (e: Error | any) {
      if (!e.message.includes('session associations')) throw e;
    }

    try {
      await sessionService.deleteSession('session1');
      throw new Error('Should not delete session with participants');
    } catch (e: Error | any) {
      if (!e.message.includes('active participants')) throw e;
    }
    console.log('✓ Deletion restrictions working');

    // Section 4: Complex Session Management
    console.log('\nTesting complex session management...');
    
    // User leaves one session but stays in another
    await userService.removeUserFromSession('user_A', 'session1');
    console.log('✓ User A removed from session1 but still in session2');

    // Verify user A's state
    const userA = await userService.getUser('user_A');
    if (userA?.sessionsJoined['session1']) {
      throw new Error('User A should not be in session1');
    }
    if (!userA?.sessionsJoined['session2']) {
      throw new Error('User A should still be in session2');
    }
    if (userA?.currentSession === 'session1') {
      throw new Error('User A current session should be cleared or different');
    }
    console.log('✓ User state verified after partial session removal');

    // Section 5: Cleanup Preparation
    console.log('\nPreparing for cleanup...');
    // Remove all users from sessions
    await userService.removeUserFromSession('user_A', 'session2');
    await userService.removeUserFromSession('user_B', 'session1');
    await userService.removeUserFromSession('user_B', 'session2');
    await userService.removeUserFromSession('user_C', 'session1');
    
    // Remove artifacts from sessions
    await sessionService.removeArtifact('session1', 'artifact1');
    await sessionService.removeArtifact('session1', 'artifact2');
    await sessionService.removeArtifact('session2', 'artifact3');
    
    // Delete users, sessions, and artifacts
    await userService.deleteUser('user_A');
    await userService.deleteUser('user_B');
    await userService.deleteUser('user_C');

    await sessionService.deleteSession('session1');
    await sessionService.deleteSession('session2');

    await artifactService.deleteArtifact('artifact1');
    await artifactService.deleteArtifact('artifact2');
    await artifactService.deleteArtifact('artifact3');

    console.log('✓ Cleanup preparation completed');

    console.log('\nTest 2 completed successfully! ✨');
  } catch (error) {
    console.error('Test 2 failed:', error);
    throw error;
  }
}

async function runTest3() {
  console.log('\nStarting Test 3: Validation Rules and Edge Cases');
  const baseNode = 'SchemaTest_NoTeams_Test3';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Initial setup
    console.log('\nCreating test data...');
    await userService.createUser('user1');
    await userService.setDisplayName('user1', 'Test User');
    await sessionService.createSession('session1', 'admin1');
    await artifactService.createArtifact('artifact1');
    await artifactService.createArtifact('artifact2');
    
    await sessionService.addArtifact('session1', 'artifact1');
    await userService.addUserToSession('user1', 'session1');
    console.log('✓ Basic setup completed');

    // Test 1: Invalid current session setting
    console.log('\nTesting invalid current session...');
    try {
      await userService.setCurrentSession('user1', 'nonexistent_session');
      throw new Error('Should not set non-existent session as current');
    } catch (e: Error | any) {
      if (!e.message.includes('not part of this session')) throw e;
    }
    console.log('✓ Invalid current session prevented');

    // Test 2: Artifact operations without session membership
    console.log('\nTesting artifact operations without session membership...');
    await userService.createUser('user2');
    try {
      await userService.addFoundArtifact('user2', 'session1', 'artifact1');
      throw new Error('Should not find artifact without session membership');
    } catch (e: Error | any) {
      if (!e.message.includes('not part of this session')) throw e;
    }
    console.log('✓ Artifact finding without session membership prevented');

    // Test 3: Invalid artifact removal
    console.log('\nTesting invalid artifact removal...');
    try {
      await userService.removeFoundArtifact('user1', 'session1', 'artifact2');
      throw new Error('Should not remove non-found artifact');
    } catch (e: Error | any) {
      if (!e.message.includes('not in user\'s found artifacts')) throw e;
    }
    console.log('✓ Invalid artifact removal prevented');

    // Test 4: Point updates validation
    console.log('\nTesting point updates validation...');
    try {
      await userService.updatePoints('user1', 'nonexistent_session', 100);
      throw new Error('Should not update points for non-existent session');
    } catch (e: Error | any) {
      if (!e.message.includes('not part of this session')) throw e;
    }
    console.log('✓ Invalid point updates prevented');

    // Test 5: Session time validation
    console.log('\nTesting session time validation...');
    try {
      await sessionService.setTimes('session1', Date.now() + 1000, Date.now());
      throw new Error('Should not set invalid times');
    } catch (e: Error | any) {
      if (!e.message.includes('Start time must be before end time')) throw e;
    }
    console.log('✓ Invalid session times prevented');

    // Test 6: Artifact deletion protection
    console.log('\nTesting artifact deletion protection...');
    await userService.addFoundArtifact('user1', 'session1', 'artifact1');
    try {
      await artifactService.deleteArtifact('artifact1');
      throw new Error('Should not delete artifact used in session');
    } catch (e: Error | any) {
      if (!e.message.includes('part of an active session')) throw e;
    }
    console.log('✓ Artifact deletion protection working');

    // Test 7: Remove artifact with found artifacts
    console.log('\nTesting artifact removal with found artifacts...');
    try {
      await sessionService.removeArtifact('session1', 'artifact1');
      throw new Error('Should not remove artifact found by users');
    } catch (e: Error | any) {
      if (!e.message.includes('found by users')) throw e;
    }
    console.log('✓ Artifact removal protection working');

    // Cleanup for final deletion
    console.log('\nCleaning up for final deletion...');
    await userService.removeFoundArtifact('user1', 'session1', 'artifact1');
    await sessionService.removeArtifact('session1', 'artifact1');
    await userService.removeUserFromSession('user1', 'session1');
    
    // Final deletions
    await sessionService.deleteSession('session1');
    await userService.deleteUser('user1');
    await userService.deleteUser('user2');
    await artifactService.deleteArtifact('artifact1');
    await artifactService.deleteArtifact('artifact2');
    console.log('✓ Final cleanup completed');

    console.log('\nTest 3 completed successfully! ✨');
  } catch (error) {
    console.error('Test 3 failed:', error);
    throw error;
  }
}

async function runBulkOperationsTest() {
  console.log('\nStarting Bulk Operations Test');
  const baseNode = 'SchemaTest_BulkOps_Test';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    const BATCH_SIZE = 0; // Test with manageable size first
    const userPrefix = 'bulk_user_';
    const artifactPrefix = 'bulk_artifact_';

    // Test 1: Bulk User Creation
    console.log(`\n1. Testing bulk user creation (${BATCH_SIZE} users)...`);
    const createStart = Date.now();
    
    const createPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      createPromises.push(userService.createUser(`${userPrefix}${i}`));
    }
    await Promise.all(createPromises);
    
    const createTime = Date.now() - createStart;
    console.log(`✓ Created ${BATCH_SIZE} users in ${createTime}ms`);
    console.log(`  Average: ${(createTime / BATCH_SIZE).toFixed(2)}ms per user`);

    // Test 2: Bulk Session Association
    console.log(`\n2. Testing bulk session associations...`);
    await sessionService.createSession('bulk_session', 'admin1');
    
    const associateStart = Date.now();
    const associatePromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      associatePromises.push(
        userService.addUserToSession(`${userPrefix}${i}`, 'bulk_session')
      );
    }
    await Promise.all(associatePromises); // run operations concurrently, stop if any errors
    
    const associateTime = Date.now() - associateStart;
    console.log(`✓ Associated ${BATCH_SIZE} users in ${associateTime}ms`);
    console.log(`  Average: ${(associateTime / BATCH_SIZE).toFixed(2)}ms per association`);

    // Test 3: Bulk Artifact Operations
    console.log(`\n3. Testing bulk artifact operations...`);
    const artifactPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      artifactPromises.push(artifactService.createArtifact(`${artifactPrefix}${i}`));
    }
    await Promise.all(artifactPromises);
    
    // Add artifacts to session
    for (let i = 0; i < BATCH_SIZE; i++) {
      await sessionService.addArtifact('bulk_session', `${artifactPrefix}${i}`);
    }
    console.log(`✓ Created and associated ${BATCH_SIZE} artifacts`);

    // Test 4: Bulk User Deletion (with cleanup)
    console.log(`\n4. Testing bulk user deletion...`);
    
    // First remove from session
    const removeFromSessionStart = Date.now();
    const removeSessionPromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      removeSessionPromises.push(
        userService.removeUserFromSession(`${userPrefix}${i}`, 'bulk_session')
      );
    }
    await Promise.all(removeSessionPromises);
    const removeSessionTime = Date.now() - removeFromSessionStart;

    // Then delete users
    const deleteStart = Date.now();
    const deletePromises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      deletePromises.push(userService.deleteUser(`${userPrefix}${i}`));
    }
    await Promise.all(deletePromises);
    const deleteTime = Date.now() - deleteStart;

    console.log(`✓ Removed ${BATCH_SIZE} users from session in ${removeSessionTime}ms`);
    console.log(`✓ Deleted ${BATCH_SIZE} users in ${deleteTime}ms`);
    console.log(`  Session removal avg: ${(removeSessionTime / BATCH_SIZE).toFixed(2)}ms`);
    console.log(`  Deletion avg: ${(deleteTime / BATCH_SIZE).toFixed(2)}ms`);

    // Test 5: Error Handling with Large Batches
    console.log(`\n5. Testing error handling...`);
    
    // Test what happens when we exceed reasonable limits
    const TOO_MANY_USERS = 300; // Adjust based on your findings
    try {
      const massivePromises = [];
      for (let i = 0; i < TOO_MANY_USERS; i++) { // Be conservative
        massivePromises.push(userService.createUser(`massive_user_${i}`));
      }
      await Promise.all(massivePromises);
      console.log(`✓ Successfully handled ${TOO_MANY_USERS} operations`);

      console.log('Cleaning up test users...');
      const cleanupPromises = [];
      for (let i = 0; i < TOO_MANY_USERS; i++) {
        cleanupPromises.push(userService.deleteUser(`massive_user_${i}`));
      }
      await Promise.all(cleanupPromises);
      console.log(`✓ Successfully cleaned up ${TOO_MANY_USERS} users`);
    } catch (error) {
      console.log(`⚠️  System limited at: ${error}`);
    }

    // Cleanup
    await sessionService.deleteSession('bulk_session');
    for (let i = 0; i < BATCH_SIZE; i++) {
      await artifactService.deleteArtifact(`${artifactPrefix}${i}`);
    }

    console.log('\n✓ Bulk operations test completed successfully!');
    
  } catch (error) {
    console.error('Bulk operations test failed:', error);
    throw error;
  }
}
*/

// Tests for current schema; foundArtifact logic contained in session's participants
async function runTest1() {
  console.log('\nStarting Test 1: Basic CRUD Operations');
  const baseNode = 'SchemaTest_NoTeams_Test1';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Step 1: Create blank objects
    console.log('\nStep 1: Creating blank objects...');
    await userService.createUser('user1');
    await userService.createUser('user2');
    await sessionService.createSession('session1', 'admin1');
    await artifactService.createArtifact('artifact1');
    console.log('✓ Created blank objects');

    // Step 2: Set basic attributes
    console.log('\nStep 2: Setting basic attributes...');
    await userService.setDisplayName('user1', 'Alice');
    await userService.setEmail('user1', 'alice@test.com');
    await userService.setDisplayName('user2', 'Bob');
    await userService.setEmail('user2', 'bob@test.com');
    
    await sessionService.setSessionName('session1', 'Test Hunt');
    await sessionService.setTimes('session1', Date.now(), Date.now() + 3600000);
    
    await artifactService.setName('artifact1', 'Golden Key');
    await artifactService.setDescription('artifact1', 'A special key');
    await artifactService.setCoordinates('artifact1', 1.234, 5.678);
    console.log('✓ Set basic attributes');

    // Step 3: Test GameState transitions
    console.log('\nStep 3: Testing GameState transitions...');
    await sessionService.setGameState('session1', GameState.LOBBY);
    console.log('✓ Set session to LOBBY state');

    // Step 4: Test associations in correct order
    console.log('\nStep 4: Testing associations...');
    // Add artifact to session
    await sessionService.addArtifact('session1', 'artifact1');
    console.log('✓ Added artifact to session');

    // Add users to session
    await userService.addUserToSession('user1', 'session1');
    await userService.addUserToSession('user2', 'session1');
    console.log('✓ Added users to session');

    // Test current session setting
    await userService.setCurrentSession('user1', 'session1');
    console.log('✓ Set current session for user1');

    // Step 5: Start the game
    console.log('\nStep 5: Starting the game...');
    await sessionService.setGameState('session1', GameState.ACTIVE);
    console.log('✓ Set session to ACTIVE state');

    // Step 6: Test artifact discovery and points (using SessionService methods instead of User)
    console.log('\nStep 6: Testing artifact discovery and points...');
    // Add found artifact using SessionService (not UserService)
    await sessionService.addFoundArtifact('session1', 'user1', 'artifact1');
    console.log('✓ Added found artifact for user1');

    // Update points using SessionService methods
    await sessionService.addPoints('session1', 'user1', 10);
    console.log('✓ Added 10 points to user1');
    // Verify user1 points after addition
    const sessionAfterAdd = await sessionService.getSession('session1');
    const user1PointsAfterAdd = sessionAfterAdd?.participants['user1']?.points;
    if (user1PointsAfterAdd !== 10) {
        throw new Error(`Expected user1 points to be 10, but got ${user1PointsAfterAdd}`);
    }
    console.log(`✓ Verified user1 points: ${user1PointsAfterAdd}`);

    await sessionService.setPoints('session1', 'user2', 5);
    console.log('✓ Set user2 points to 5');
    const sessionAfterSet = await sessionService.getSession('session1');
    const user2PointsAfterSet = sessionAfterSet?.participants['user2']?.points;
    if (user2PointsAfterSet !== 5) {
        throw new Error(`Expected user2 points to be 5, but got ${user2PointsAfterSet}`);
    }
    console.log(`✓ Verified user2 points: ${user2PointsAfterSet}`);

    // Step 7: Test queries
    console.log('\nStep 7: Testing queries...');
    const user1Sessions = await userService.listUserSessions('user1');
    const sessionParticipants = await sessionService.listSessionParticipants('session1');
    const sessionArtifacts = await sessionService.listSessionArtifacts('session1');
    
    if (!user1Sessions.includes('session1')) throw new Error('User sessions query failed');
    if (!sessionParticipants.includes('user1')) throw new Error('Session participants query failed');
    if (!sessionArtifacts.includes('artifact1')) throw new Error('Session artifacts query failed');
    console.log('✓ All queries working correctly');

    // Step 8: Test game state transitions
    console.log('\nStep 8: Testing game state transitions...');
    await sessionService.setGameState('session1', GameState.PAUSED);
    console.log('✓ Set session to PAUSED state');

    await sessionService.setGameState('session1', GameState.FINISHED);
    console.log('✓ Set session to FINISHED state');

    // Step 9: Test removal in reverse order
    console.log('\nStep 9: Testing removal in reverse order...');
    // Remove found artifact using SessionService
    await sessionService.removeFoundArtifact('session1', 'user1', 'artifact1');
    console.log('✓ Removed found artifact from user1 in session 1');

    // Clear current session for target user
    await userService.setCurrentSession('user1', null);
    console.log('✓ Cleared current session');

    // Remove users from session
    await userService.removeUserFromSession('user1', 'session1');
    await userService.removeUserFromSession('user2', 'session1');
    console.log('✓ Removed users from session');

    // Remove artifact from session
    await sessionService.removeArtifact('session1', 'artifact1');
    console.log('✓ Removed artifact from session');

    // Step 10: Delete blank objects
    console.log('\nStep 10: Deleting blank objects...');
    await sessionService.deleteSession('session1');
    await userService.deleteUser('user1');
    await userService.deleteUser('user2');
    await artifactService.deleteArtifact('artifact1');
    console.log('✓ Deleted all objects');

    console.log('\nTest 1 completed successfully! ✨');
  } catch (error) {
    console.error('Test 1 failed:', error);
    throw error;
  }
}

// Tests basic handling for participants and foundArtifact logic under sessions
async function runTest2() {
  console.log('\nStarting Test 2: Test Participant and FoundArtifact');
  const baseNode = 'SchemaTest_NoTeams_Test2';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    console.log('\nStep 1: Create 1 user, 1 session, and 1 artifact');
    await userService.createUser('user1');
    await sessionService.createSession('session1', 'admin1');
    await artifactService.createArtifact('artifact1');
    
    await userService.setDisplayName('user1', 'Test User');
    await sessionService.setSessionName('session1', 'Test Session');
    await artifactService.setName('artifact1', 'Test Artifact');
    console.log('✓ Created user, session, and artifact');

    // Step 2: Add user to session
    console.log('\nStep 2: Add user to session');
    await userService.addUserToSession('user1', 'session1');
    console.log('✓ Added user to session');

    // Step 3: Test duplicate participant prevention
    console.log('\nStep 3: Test duplicate participant prevention');
    try {
      await userService.addUserToSession('user1', 'session1');
      throw new Error('❌ Should have thrown error for duplicate participant');
    } catch (error: any) {
      if (!error.message.includes('already part')) {
        throw new Error(`❌ Wrong error message: ${error.message}`);
      }
      console.log('✓ Correctly prevented duplicate participant');
    }

    // Step 4: Verify session participants
    console.log('\nStep 4: Verify session participants');
    const participants = await sessionService.listSessionParticipants('session1');
    if (participants.length !== 1 || !participants.includes('user1')) {
      throw new Error(`❌ Session should have 1 participant (user1), got: ${participants}`);
    }
    console.log('✓ Session participants correctly contains user1');

    // Step 5: Try addFoundArtifact before adding user to session (should error)
    console.log('\nStep 5: Try addFoundArtifact before user joins session');
    try {
      await sessionService.addFoundArtifact('session1', 'nonexistentUser', 'artifact1');
      throw new Error('❌ Should have thrown error for non-participant user');
    } catch (error: any) {
      if (!error.message.includes('not part')) {
        throw new Error(`❌ Wrong error message: ${error.message}`);
      }
      console.log('✓ Correctly prevented found artifact for non-participant');
    }

    // Step 6: Try addFoundArtifact before adding artifact to session (should error)
    console.log('\nStep 6: Try addFoundArtifact before artifact added to session');
    try {
      await sessionService.addFoundArtifact('session1', 'user1', 'artifact1');
      throw new Error('❌ Should have thrown error for artifact not in session');
    } catch (error: any) {
      if (!error.message.includes('not part of this session')) {
        throw new Error(`❌ Wrong error message: ${error.message}`);
      }
      console.log('✓ Correctly prevented found artifact for non-session artifact');
    }

    // Step 7: Add artifact to session and successfully add found artifact
    console.log('\nStep 7: Add artifact to session and record found artifact');
    await sessionService.addArtifact('session1', 'artifact1');
    await sessionService.addFoundArtifact('session1', 'user1', 'artifact1');
    console.log('✓ Successfully added artifact to session and recorded found artifact');

    // Step 8: Verify found artifact was recorded
    console.log('\nStep 8: Verify found artifact was recorded');
    const session = await sessionService.getSession('session1');
    const userFoundArtifacts = session?.participants?.['user1']?.foundArtifacts;
    if (!userFoundArtifacts?.['artifact1']) {
      throw new Error('❌ Found artifact not recorded in participant data');
    }
    console.log('✓ Found artifact correctly recorded in participant data');

    // Step 9: Try to delete session with participants (should error)
    console.log('\nStep 9: Try to delete session with participants');
    try {
      await sessionService.deleteSession('session1');
      throw new Error('❌ Should have thrown error for session with participants');
    } catch (error: any) {
      if (!error.message.includes('active participants')) {
        throw new Error(`❌ Wrong error message: ${error.message}`);
      }
      console.log('✓ Correctly prevented session deletion with participants');
    }

    // Step 10: Try to delete artifact used in session (should error)
    console.log('\nStep 10: Try to delete artifact used in session');
    try {
      await artifactService.deleteArtifact('artifact1');
      throw new Error('❌ Should have thrown error for artifact in active session');
    } catch (error: any) {
      if (!error.message.includes('part of an active session')) {
        throw new Error(`❌ Wrong error message: ${error.message}`);
      }
      console.log('✓ Correctly prevented artifact deletion while in session');
    }

    // Step 11: Cleanup in correct order
    console.log('\nStep 11: Cleanup in correct order');
    
    // Remove found artifact first
    await sessionService.removeFoundArtifact('session1', 'user1', 'artifact1');
    console.log('✓ Removed found artifact');
    
    // Remove artifact from session
    await sessionService.removeArtifact('session1', 'artifact1');
    console.log('✓ Removed artifact from session');
    
    // Remove user from session
    await userService.removeUserFromSession('user1', 'session1');
    console.log('✓ Removed user from session');
    
    // Verify session has no participants
    const finalParticipants = await sessionService.listSessionParticipants('session1');
    if (finalParticipants.length !== 0) {
      throw new Error(`❌ Session should have 0 participants after cleanup, got: ${finalParticipants.length}`);
    }
    console.log('✓ Session has no participants after cleanup');

    // Step 12: Final deletions
    console.log('\nStep 12: Final deletions');
    await sessionService.deleteSession('session1');
    await userService.deleteUser('user1');
    await artifactService.deleteArtifact('artifact1');
    console.log('✓ Successfully deleted all objects');

    console.log('\n🎉 Test 2 completed successfully! All participant and found artifact logic working correctly.');

  } catch (error) {
    console.error('❌ Test 2 failed: ', error);
    throw error;
  }
}


async function runTest3() {
  console.log('\nStarting Test 3: Multiple Session Participation & User Deletion Cascading');
  const baseNode = 'SchemaTest_NoTeams_Test3';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    console.log('\nStep 1: Create user and multiple sessions');
    await userService.createUser('multiUser');
    await sessionService.createSession('sessionA', 'admin1');
    await sessionService.createSession('sessionB', 'admin1');
    await sessionService.createSession('sessionC', 'admin1');
    
    await userService.setDisplayName('multiUser', 'Multi Session User');
    await sessionService.setSessionName('sessionA', 'Morning Hunt');
    await sessionService.setSessionName('sessionB', 'Afternoon Hunt');
    await sessionService.setSessionName('sessionC', 'Evening Hunt');
    console.log('✓ Created user and three sessions');

    // Step 2: Add user to multiple sessions
    console.log('\nStep 2: Add user to multiple sessions');
    await userService.addUserToSession('multiUser', 'sessionA');
    await userService.addUserToSession('multiUser', 'sessionB');
    await userService.addUserToSession('multiUser', 'sessionC');
    console.log('✓ User added to all three sessions');

    // Step 3: Verify user appears in all session participant lists
    console.log('\nStep 3: Verify user in all session participant lists');
    const participantsA = await sessionService.listSessionParticipants('sessionA');
    const participantsB = await sessionService.listSessionParticipants('sessionB');
    const participantsC = await sessionService.listSessionParticipants('sessionC');
    
    if (!participantsA.includes('multiUser') || !participantsB.includes('multiUser') || !participantsC.includes('multiUser')) {
      throw new Error('❌ User not found in all session participant lists');
    }
    console.log('✓ User correctly appears in all session participant lists');

    // Step 4: Verify user sessionsJoined tracking
    console.log('\nStep 4: Verify user sessionsJoined tracking');
    const userSessions = await userService.listUserSessions('multiUser');
    if (userSessions.length !== 3 || !userSessions.includes('sessionA') || !userSessions.includes('sessionB') || !userSessions.includes('sessionC')) {
      throw new Error(`❌ User sessionsJoined incorrect: ${userSessions}`);
    }
    console.log('✓ User sessionsJoined correctly tracks all sessions');

    // Step 5: Test current session management across multiple sessions
    console.log('\nStep 5: Test current session management');
    await userService.setCurrentSession('multiUser', 'sessionA');
    let user = await userService.getUser('multiUser');
    if (user?.currentSession !== 'sessionA') {
      throw new Error('❌ Current session not set correctly');
    }
    console.log('✓ Current session set to sessionA');

    await userService.setCurrentSession('multiUser', 'sessionB');
    user = await userService.getUser('multiUser');
    if (user?.currentSession !== 'sessionB') {
      throw new Error('❌ Current session not switched correctly');
    }
    console.log('✓ Current session switched to sessionB');

    // Step 6: Test session-specific data isolation
    console.log('\nStep 6: Test session-specific data isolation');
    await artifactService.createArtifact('sharedArtifact');
    await sessionService.addArtifact('sessionA', 'sharedArtifact');
    await sessionService.addArtifact('sessionB', 'sharedArtifact');
    
    await sessionService.addFoundArtifact('sessionA', 'multiUser', 'sharedArtifact');
    await sessionService.addPoints('sessionA', 'multiUser', 10);
    
    // Verify data is isolated to sessionA only
    const sessionAData = await sessionService.getSession('sessionA');
    const sessionBData = await sessionService.getSession('sessionB');
    
    if (!sessionAData?.participants?.['multiUser']?.foundArtifacts?.['sharedArtifact']) {
      throw new Error('❌ Found artifact not recorded in sessionA');
    }
    if (sessionAData?.participants?.['multiUser']?.points !== 10) {
      throw new Error('❌ Points not recorded in sessionA');
    }
    if (sessionBData?.participants?.['multiUser']?.foundArtifacts?.['sharedArtifact']) {
      throw new Error('❌ Found artifact incorrectly appears in sessionB');
    }
    if (sessionBData?.participants?.['multiUser']?.points !== 0) {
      throw new Error('❌ Points incorrectly appear in sessionB');
    }
    console.log('✓ Session-specific data properly isolated');

    // Step 7: Test user deletion cascading prevention
    console.log('\nStep 7: Test user deletion cascading prevention');
    try {
      await userService.deleteUser('multiUser');
      throw new Error('❌ Should have prevented user deletion with active session associations');
    } catch (error: any) {
      if (!error.message.includes('session associations')) {
        throw new Error(`❌ Wrong error message: ${error.message}`);
      }
      console.log('✓ Correctly prevented user deletion with active sessions');
    }

    // Step 8: Test proper user deletion with cleanup
    console.log('\nStep 8: Test proper user deletion with cleanup');
    
    // Remove user from all sessions first
    await userService.removeUserFromSession('multiUser', 'sessionA');
    await userService.removeUserFromSession('multiUser', 'sessionB');
    await userService.removeUserFromSession('multiUser', 'sessionC');
    console.log('✓ Removed user from all sessions');

    // Verify user removed from all session participant lists
    const finalParticipantsA = await sessionService.listSessionParticipants('sessionA');
    const finalParticipantsB = await sessionService.listSessionParticipants('sessionB');
    const finalParticipantsC = await sessionService.listSessionParticipants('sessionC');
    
    if (finalParticipantsA.includes('multiUser') || finalParticipantsB.includes('multiUser') || finalParticipantsC.includes('multiUser')) {
      throw new Error('❌ User still appears in session participant lists after removal');
    }
    console.log('✓ User removed from all session participant lists');

    // Verify user sessionsJoined is empty
    const finalUserSessions = await userService.listUserSessions('multiUser');
    if (finalUserSessions.length !== 0) {
      throw new Error(`❌ User sessionsJoined should be empty, got: ${finalUserSessions}`);
    }
    console.log('✓ User sessionsJoined correctly empty');

    // Now user deletion should succeed
    await userService.deleteUser('multiUser');
    console.log('✓ Successfully deleted user after session cleanup');

    // Step 9: Verify sessions are still intact and functional
    console.log('\nStep 9: Verify sessions remain functional after user deletion');
    await userService.createUser('newUser');
    await userService.addUserToSession('newUser', 'sessionA');
    
    const sessionAAfter = await sessionService.getSession('sessionA');
    if (!sessionAAfter?.participants?.['newUser']) {
      throw new Error('❌ Session not functional after original user deletion');
    }
    console.log('✓ Sessions remain functional after user deletion');

    // Step 10: Final cleanup
    console.log('\nStep 10: Final cleanup');
    await userService.removeUserFromSession('newUser', 'sessionA');
    await userService.deleteUser('newUser');
    await sessionService.deleteSession('sessionA');
    await sessionService.deleteSession('sessionB');
    await sessionService.deleteSession('sessionC');
    await artifactService.deleteArtifact('sharedArtifact');
    console.log('✓ All objects cleaned up successfully');

    console.log('\n🎉 Test 3 completed successfully! Multiple session participation and user deletion cascading working correctly.');

  } catch (error) {
    console.error('❌ Test 3 failed: ', error);
    throw error;
  }
}

async function runAllTests() {
  try {
    await runTest1();
    await runTest2();
    await runTest3();
    /*
    await runTest1();
    await runTest2();
    await runTest3();
    await runBulkOperationsTest();
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('  ✅ Basic CRUD operations');
    console.log('  ✅ Complex multi-session scenarios');
    console.log('  ✅ Validation rules and error handling');
    console.log('  ✅ Artifact discovery and point tracking');
    console.log('  ✅ User session management');
    console.log (' ✅ Bulk Test');
    */
  } catch (error) {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  }
  
  // Allow time for Firebase operations to complete
  await sleep(2000);
  process.exit(0);
}

runAllTests();