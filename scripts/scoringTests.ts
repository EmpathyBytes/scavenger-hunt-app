/**
 * Score-write tests
 * ============================
 *
 * Verifies that earned points are added to
 * sessions/{sessionId}/participants/{userId}/points.
 *
 * Runs entirely in memory: firebase/database, firebase_config and AuthContext
 * are replaced with stubs (see scripts/test-support/). No Firebase project or
 * network access is used, and nothing is written to the live database.
 *
 * Running the tests:
 *    npm run test-scoring
 *    or: npx tsx scripts/scoringTests.ts
 */

// Must be loaded before any service module
require('./test-support/registerStubs');

import assert from 'node:assert/strict';

const db = require('firebase/database');
const { SessionService } = require('../updated_services/SessionService');

const BASE = 'ScoringTest';
const PARTICIPANT_PATH = `${BASE}/sessions/s1/participants/u1`;
const POINTS_PATH = `${PARTICIPANT_PATH}/points`;

// Artifact entries as CreateGameScreen stores them (objects copied from the catalog)
const ARTIFACTS_WITH_POINTS = {
  a1: { name: 'ARTIFACT_1', hint: '', points: 10 },
  a2: { name: 'ARTIFACT_2', hint: '', points: 15 },
};

function seed(startingPoints = 0, artifacts: object = ARTIFACTS_WITH_POINTS) {
  db.__reset({
    [BASE]: {
      users: {
        u1: { displayName: 'Alice', sessionsJoined: { s1: true }, currentSession: 's1', isAdmin: false },
      },
      sessions: {
        s1: {
          sessionName: 'Test Hunt',
          sessionCode: 's1',
          creatorId: 'host',
          gameState: 'ACTIVE',
          startTime: 0,
          endTime: 0,
          participants: { u1: { points: startingPoints } },
          artifacts,
        },
      },
    },
  });
}

const tests: Array<[string, () => Promise<void>]> = [
  ['T-4a addPoints adds to the participant score and writes nothing else', async () => {
    seed();
    await new SessionService(BASE).addPoints('s1', 'u1', 10);
    assert.equal(db.__read(POINTS_PATH), 10);
    const otherWrites = db.__writes().filter((w: { path: string }) => w.path !== POINTS_PATH);
    assert.deepEqual(otherWrites, []);
  }],

  ['T-4b addPoints accumulates across calls', async () => {
    seed();
    const service = new SessionService(BASE);
    await service.addPoints('s1', 'u1', 10);
    await service.addPoints('s1', 'u1', 15);
    assert.equal(db.__read(POINTS_PATH), 25);
  }],

  ['T-4c addPoints rejects a non-participant and writes nothing', async () => {
    seed();
    await assert.rejects(
      new SessionService(BASE).addPoints('s1', 'u9', 10),
      /User is not part of this session/
    );
    assert.deepEqual(db.__writes(), []);
  }],

  ['T-4d awardPointsForArtifacts records each artifact and adds the total', async () => {
    seed(5);
    const total = await new SessionService(BASE).awardPointsForArtifacts('s1', 'u1', ['a1', 'a2']);
    assert.equal(total, 25);
    assert.equal(db.__read(POINTS_PATH), 30); // 5 already earned + 25
    assert.deepEqual(db.__read(`${PARTICIPANT_PATH}/foundArtifacts`), { a1: true, a2: true });
  }],

  ['T-4e awardPointsForArtifacts skips the points write when artifacts have no point values', async () => {
    seed(5, { a1: true, a2: { name: 'ARTIFACT_2' } });
    const total = await new SessionService(BASE).awardPointsForArtifacts('s1', 'u1', ['a1', 'a2']);
    assert.equal(total, 0);
    assert.equal(db.__read(POINTS_PATH), 5);
    const pointWrites = db.__writes().filter((w: { path: string }) => w.path === POINTS_PATH);
    assert.deepEqual(pointWrites, []);
    assert.deepEqual(db.__read(`${PARTICIPANT_PATH}/foundArtifacts`), { a1: true, a2: true });
  }],

  ['T-4f awardPointsForArtifacts writes only under the participant', async () => {
    seed();
    await new SessionService(BASE).awardPointsForArtifacts('s1', 'u1', ['a1', 'a2']);
    assert.equal(db.__read(`${BASE}/users/u1/sessionsJoined/s1`), true);
    const outside = db.__writes().filter((w: { path: string }) => !w.path.startsWith(`${PARTICIPANT_PATH}/`));
    assert.deepEqual(outside, []);
  }],

  ['T-4g awardPointsForArtifacts writes nothing if any artifact is not in the session', async () => {
    seed();
    await assert.rejects(
      new SessionService(BASE).awardPointsForArtifacts('s1', 'u1', ['a1', 'missing']),
      /Artifact is not part of this session/
    );
    assert.deepEqual(db.__writes(), []);
  }],

  ['T-4h awardPointsForArtifacts rejects a non-participant and writes nothing', async () => {
    seed();
    await assert.rejects(
      new SessionService(BASE).awardPointsForArtifacts('s1', 'u9', ['a1']),
      /User is not part of this session/
    );
    assert.deepEqual(db.__writes(), []);
  }],
];

async function runAllTests() {
  let failed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${name}\n  ${(error as Error).message}`);
    }
  }
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
