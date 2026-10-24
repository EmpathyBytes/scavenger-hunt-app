// Stand-in for contexts/AuthContext.js (JSX + Firebase Auth). SessionService imports it but doesn't use it.
module.exports = { useAuth: () => ({ user: null }) };
