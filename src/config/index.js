import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default configuration
const defaultConfig = {
  baseUrl: 'https://www.propertyguru.com.sg',
  searchPath: '/property-for-sale',
  params: {
    isCommercial: 'false',
    market: 'residential'
  },
  pages: 5,
  delay: 2000,
  timeout: 30000,
  retries: 3,
  concurrency: 2,
  outputFilename: 'property-listings',
  outputDir: './data',
  userAgentRotation: true,
  proxyList: [],
  verbose: false
};

/**
 * Load configuration from file, falling back to defaults
 * @param {string} configPath - Path to the config file
 * @returns {Object} - Configuration object
 */
export async function loadConfig(configPath) {
  try {
    // Check if config file exists
    const resolvedPath = path.resolve(process.cwd(), configPath);
    
    if (await fs.pathExists(resolvedPath)) {
      const fileConfig = JSON.parse(await fs.readFile(resolvedPath, 'utf8'));
      logger.info(`Loaded configuration from ${resolvedPath}`);
      return { ...defaultConfig, ...fileConfig };
    } else {
      // Create default config if it doesn't exist
      logger.info(`Config file not found at ${resolvedPath}, using defaults`);
      await fs.ensureDir(path.dirname(resolvedPath));
      await fs.writeJson(resolvedPath, defaultConfig, { spaces: 2 });
      logger.info(`Created default config at ${resolvedPath}`);
      return defaultConfig;
    }
  } catch (error) {
    logger.warn(`Error loading config: ${error.message}. Using default configuration.`);
    return defaultConfig;
  }
}