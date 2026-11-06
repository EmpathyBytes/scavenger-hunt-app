/**
 * Leaderboard entry tests (Ticket 3)
 * ==================================
 *
 * Verifies that getSessionLeaderboardEntries lists every participant with
 * their display name (or a "Player XXXX" fallback) and their real score from
 * sessions/{sessionId}/participants/{userId}/points.
 *
 * Runs entirely in memory: firebase/database, firebase_config and AuthContext
 * are replaced with stubs (see scripts/test-support/). No Firebase project or
 * network access is used, and nothing is written to the live database.
 *
 * Running the tests:
 *    npm run test-leaderboard
 *    or: npx tsx scripts/leaderboardTests.ts
 */

// Must be loaded before any service module
require('./test-support/registerStubs');

import assert from 'node:assert/strict';

const db = require('firebase/database');
const { SessionService, playerLabel } = require('../updated_services/SessionService');

const BASE = 'LeaderboardTest';

type Entry = { userId: string; displayName: string; points: number };

function seed(users: object, participants?: object) {
  db.__reset({
    [BASE]: {
      users,
      sessions: {
        s1: {
          sessionName: 'Test Hunt',
          sessionCode: 's1',
          creatorId: 'host',
          gameState: 'ACTIVE',
          startTime: 0,
          endTime: 0,
          ...(participants && { participants }),
        },
      },
    },
  });
}

async function entries(): Promise<Entry[]> {
  return new SessionService(BASE).getSessionLeaderboardEntries('s1');
}

function byUser(list: Entry[], userId: string): Entry {
  const entry = list.find((e) => e.userId === userId);
  assert.ok(entry, `expected an entry for ${userId}`);
  return entry;
}

const tests: Array<[string, () => Promise<void>]> = [
  ['T-1 lists every participant with their name and real score', async () => {
    seed(
      {
        u1: { displayName: 'DISPLAYNAME_1' },
        u2: { displayName: 'DISPLAYNAME_2' },
        u3: { displayName: 'DISPLAYNAME_3' },
      },
      { u1: { points: 10 }, u2: { points: 30 }, u3: { points: 20 } }
    );
    assert.deepEqual(await entries(), [
      { userId: 'u2', displayName: 'DISPLAYNAME_2', points: 30 },
      { userId: 'u3', displayName: 'DISPLAYNAME_3', points: 20 },
      { userId: 'u1', displayName: 'DISPLAYNAME_1', points: 10 },
    ]);
  }],

  ['T-3a empty display name falls back to "Player XXXX"', async () => {
    seed({ uid_3QzA: { displayName: '' } }, { uid_3QzA: { points: 5 } });
    assert.equal(byUser(await entries(), 'uid_3QzA').displayName, 'Player 3QzA');
  }],

  ['T-3b whitespace-only display name falls back to "Player XXXX"', async () => {
    seed({ uid_4KpL: { displayName: '   ' } }, { uid_4KpL: { points: 5 } });
    assert.equal(byUser(await entries(), 'uid_4KpL').displayName, 'Player 4KpL');
  }],

  ['T-3c participant with no user record is listed as "Player XXXX"', async () => {
    seed({}, { uid_5WnB: { points: 5 } });
    assert.deepEqual(await entries(), [{ userId: 'uid_5WnB', displayName: 'Player 5WnB', points: 5 }]);
  }],

  ['T-3d participant with no points value is listed with 0', async () => {
    seed({ u6: { displayName: 'DISPLAYNAME_6' } }, { u6: { foundArtifacts: { a1: true } } });
    assert.deepEqual(await entries(), [{ userId: 'u6', displayName: 'DISPLAYNAME_6', points: 0 }]);
  }],

  ['T-3e scores come from the participant record, not the legacy user path', async () => {
    // A stale value at the legacy path must be ignored
    seed(
      { u1: { displayName: 'DISPLAYNAME_1', sessionsJoined: { s1: { points: 999 } } } },
      { u1: { points: 12 } }
    );
    assert.equal(byUser(await entries(), 'u1').points, 12);
  }],

  ['T-3f nameless players get distinct labels', async () => {
    seed({}, { uid_3QzA: { points: 1 }, uid_9TrX: { points: 2 } });
    const labels = (await entries()).map((e) => e.displayName).sort();
    assert.deepEqual(labels, ['Player 3QzA', 'Player 9TrX']);
  }],

  ['T-4 session with no participants returns an empty list', async () => {
    seed({});
    assert.deepEqual(await entries(), []);
  }],

  ['playerLabel keeps real names and trims surrounding spaces', async () => {
    assert.equal(playerLabel('uid_3QzA', '  DISPLAYNAME_1 '), 'DISPLAYNAME_1');
    assert.equal(playerLabel('uid_3QzA', null), 'Player 3QzA');
    assert.equal(playerLabel('u2', undefined), 'Player u2');
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
