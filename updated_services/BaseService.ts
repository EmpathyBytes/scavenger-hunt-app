import { database } from '../firebase_config';
import { ref, get, set, remove } from 'firebase/database';

/**
 * Base service class providing common Firebase database operations
 * 
 * This abstract service provides the foundation for all database interactions,
 * ensuring consistent access patterns and error handling across the application.
 * It implements the core CRUD operations needed to maintain data integrity
 * according to the schema requirements.
 */
export class BaseService {
  /**
   * Base node path for database operations
   * 
   * All database operations are performed relative to this path.
   * This allows for isolation of test environments, multi-tenancy,
   * and other segmentation needs.
   */
  protected baseNode: string;

  /**
   * Creates a new service instance
   * 
   * @param baseNode - Optional base path for all database operations
   *                   Allows for isolation of database operations
   *                   (e.g., for testing or multi-tenancy)
   */
  constructor(baseNode: string = '') {
    this.baseNode = baseNode;
  }

  /**
   * Gets a Firebase reference for the specified path
   * 
   * The path is automatically prefixed with the baseNode
   * to maintain proper context isolation.
   * 
   * @param path - Relative path within the database
   * @returns Firebase reference to the specified path
   */
  protected getRef(path: string) {
    return ref(database, `${this.baseNode}/${path}`);
  }

  /**
   * Checks if data exists at the specified path
   * 
   * Used for validating existence before performing operations.
   * Critical for enforcing schema constraints such as preventing
   * duplicate creation or validating references.
   * 
   * @param path - Relative path to check for data
   * @returns Promise resolving to true if data exists, false otherwise
   */
  protected async exists(path: string): Promise<boolean> {
    const snapshot = await get(this.getRef(path));
    return snapshot.exists();
  }

  /**
   * Retrieves data from the specified path
   * 
   * Used to get current state before applying changes or
   * to retrieve objects for validation.
   * 
   * @param path - Relative path to retrieve data from
   * @returns Promise resolving to the data at the specified path, 
   *          or null if no data exists
   */
  protected async getData<T>(path: string): Promise<T | null> {
    const snapshot = await get(this.getRef(path));
    return snapshot.val();
  }

  /**
   * Writes data to the specified path
   * 
   * Used for creating new objects and updating existing ones.
   * This is the foundation for all write operations across services.
   * 
   * Following schema requirements:
   * - Used to create blank objects
   * - Used to set attributes via atomic operations
   * - Used to establish and update associations
   * 
   * @param path - Relative path to write data to
   * @param data - Data to write at the specified path
   * @returns Promise that resolves when the write is complete
   */
  protected async setData(path: string, data: any): Promise<void> {
    await set(this.getRef(path), data);
  }

  /**
   * Removes data at the specified path
   * 
   * Used for removing associations and deleting objects.
   * Critical for maintaining data integrity during disassociation
   * and deletion operations.
   * 
   * Following schema requirements:
   * - Used to remove associations in proper order
   * - Used to delete objects once all associations are removed
   * 
   * @param path - Relative path to remove data from
   * @returns Promise that resolves when the removal is complete
   */
  protected async removeData(path: string): Promise<void> {
    await remove(this.getRef(path));
  }
}
