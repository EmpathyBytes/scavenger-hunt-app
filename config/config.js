/**
 * Application configuration settings
 * 
 * Contains environment-specific configuration settings
 * that can be imported throughout the application.
 */
export const DATABASE_CONFIG = {
  // Use environment variable or default to 'development_node'
  baseNode: process.env.FIREBASE_BASE_NODE || 'script_test'
};
