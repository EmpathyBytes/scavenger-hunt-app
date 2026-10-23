/**
 * In-memory stand-in for the parts of 'firebase/database' the services use.
 * Lets service tests run without network access or a Firebase project.
 *
 * Mirrors Realtime Database behavior where it matters to the services:
 * - writing null removes the node
 * - empty objects are not stored
 */
const state = { root: {}, writes: [] };

function splitPath(path) {
  return String(path).split('/').filter(Boolean);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function prune(value) {
  if (value === null || typeof value !== 'object') return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    const pruned = prune(v);
    if (pruned !== null && pruned !== undefined) out[k] = pruned;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function readPath(path) {
  let node = state.root;
  for (const key of splitPath(path)) {
    if (node === null || typeof node !== 'object' || !(key in node)) return null;
    node = node[key];
  }
  return node;
}

function writePath(path, value) {
  const keys = splitPath(path);
  const pruned = prune(clone(value));
  if (keys.length === 0) {
    state.root = pruned ?? {};
    return;
  }
  let node = state.root;
  const parents = [];
  for (const key of keys.slice(0, -1)) {
    if (node[key] === null || typeof node[key] !== 'object') node[key] = {};
    parents.push([node, key]);
    node = node[key];
  }
  const last = keys[keys.length - 1];
  if (pruned === null || pruned === undefined) delete node[last];
  else node[last] = pruned;
  // Drop parents left empty, as the Realtime Database does
  for (let i = parents.length - 1; i >= 0; i--) {
    const [parent, key] = parents[i];
    if (Object.keys(parent[key]).length === 0) delete parent[key];
    else break;
  }
}

function snapshot(path) {
  const value = clone(readPath(path));
  const keys = splitPath(path);
  return {
    key: keys[keys.length - 1] ?? null,
    val: () => (value === undefined ? null : value),
    exists: () => value !== null && value !== undefined,
    forEach: (cb) => {
      if (value && typeof value === 'object') {
        for (const k of Object.keys(value)) cb(snapshot(`${path}/${k}`));
      }
    },
  };
}

module.exports = {
  ref: (_db, path = '') => ({ path }),
  get: async (r) => snapshot(r.path),
  set: async (r, value) => {
    state.writes.push({ op: 'set', path: r.path, value: clone(value) });
    writePath(r.path, value);
  },
  remove: async (r) => {
    state.writes.push({ op: 'remove', path: r.path });
    writePath(r.path, null);
  },
  onValue: (r, cb) => {
    cb(snapshot(r.path));
    return () => {};
  },
  getDatabase: () => ({}),

  // Test helpers
  __reset(initial = {}) {
    state.root = clone(initial);
    state.writes = [];
  },
  __read: readPath,
  __writes: () => state.writes,
};
