import React, { createContext, useContext } from 'react';
import { UserService } from '../services/UserService';
import { SessionService } from '../services/SessionService';
import { TeamService } from '../services/TeamService';
import { ArtifactService } from '../services/ArtifactService';
import { DATABASE_CONFIG } from '../config/config';

/**
 * Create pre-configured service instances
 * 
 * Services are initialized with the application-wide base node
 * to maintain consistency across the application.
 */
export const services = {
  userService: new UserService(DATABASE_CONFIG.baseNode),
  sessionService: new SessionService(DATABASE_CONFIG.baseNode),
  teamService: new TeamService(DATABASE_CONFIG.baseNode),
  artifactService: new ArtifactService(DATABASE_CONFIG.baseNode),
};

// Create the service context
const ServiceContext = createContext(services);

/**
 * Hook for accessing the service context
 * 
 * Provides a simple way to access all service instances
 * from any component in the application.
 */
export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

/**
 * Service Provider component
 * 
 * Wraps the application with service context to make all
 * service instances accessible to child components.
 */
export const ServiceProvider = ({ children }) => {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};
