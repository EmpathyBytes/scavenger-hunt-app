/**
 * Redirects Firebase and React Native-dependent modules to in-memory stubs so
 * service code can be tested under plain Node (tsx). Import this before any
 * service module.
 */
const { registerHooks } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const stub = (file) => pathToFileURL(path.join(__dirname, file)).href;

const redirects = [
  [/^firebase\/database$/, stub('memoryDatabase.js')],
  [/(^|\/)firebase_config(\.js)?$/, stub('firebaseConfigStub.js')],
  [/(^|\/)contexts\/AuthContext(\.js)?$/, stub('authContextStub.js')],
];

registerHooks({
  resolve(specifier, context, nextResolve) {
    for (const [pattern, url] of redirects) {
      if (pattern.test(specifier)) return { url, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
