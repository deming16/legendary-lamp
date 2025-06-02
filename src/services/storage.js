import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Save data to a file in the specified format
 * @param {Array} data - Array of property objects
 * @param {Object} config - Configuration object
 * @returns {string} - Path to saved file
 */
export async function saveData(data, config) {
  try {
    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), config.outputDir);
    await fs.ensureDir(outputDir);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `${config.outputFilename}_${timestamp}`;    
    return await saveAsJson(data, outputDir, filename);

  } catch (error) {
    logger.error(`Error saving data: ${error.message}`);
    throw error;
  }
}

/**
 * Save data as JSON file
 * @param {Array} data - Array of property objects
 * @param {string} outputDir - Output directory
 * @param {string} filename - Output filename without extension
 * @returns {string} - Path to saved file
 */
async function saveAsJson(data, outputDir, filename) {
  const filePath = path.join(outputDir, `${filename}.json`);
  
  // Add metadata
  const output = {
    metadata: {
      timestamp: new Date().toISOString(),
      count: data.length
    },
    data
  };
  
  await fs.writeJson(filePath, output, { spaces: 2 });
  logger.info(`Data saved as JSON: ${filePath}`);
  return filePath;
}