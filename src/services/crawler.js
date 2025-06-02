import { createHttpClient } from '../utils/http.js';
import { parseListings } from './parser.js';
import { saveData } from './storage.js';
import { logger } from '../utils/logger.js';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';

/**
 * Start the crawler with the provided configuration
 * @param {Object} config - Configuration object
 * @returns {Array} - Array of property objects
 */
export async function startCrawler(config) {
  // Create HTTP client
  const httpClient = createHttpClient(config);
  
  // Initialize progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Crawling progress |{bar}| {percentage}% | {value}/{total} Pages',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  
  try {
    // Create concurrency limiter
    const limit = pLimit(config.concurrency);
    
    // Start progress bar
    progressBar.start(config.pages, 0);
    
    // Collect all property listings
    let allListings = [];
    
    // Process pages in parallel with concurrency limit
    const tasks = [];
    for (let page = 1; page <= config.pages; page++) {
      tasks.push(limit(() => processPage(page, httpClient, config, progressBar)));
    }
    
    // Wait for all pages to be processed
    const pageResults = await Promise.all(tasks);
    
    // Combine all listings
    allListings = pageResults.flat();
    
    // Stop progress bar
    progressBar.stop();
    
    logger.info(`Crawling completed. Total listings found: ${allListings.length}`);
    
    // Save data to file
    if (allListings.length > 0) {
      const filePath = await saveData(allListings, config);
      logger.info(`Data saved to: ${filePath}`);
    }
    
    return allListings;
  } catch (error) {
    progressBar.stop();
    logger.error(`Crawler error: ${error.message}`);
    throw error;
  }
}

/**
 * Process a single page of property listings
 * @param {number} page - Page number
 * @param {Object} httpClient - HTTP client
 * @param {Object} config - Configuration object
 * @param {Object} progressBar - CLI progress bar
 * @returns {Array} - Array of property objects from this page
 */
async function processPage(page, httpClient, config, progressBar) {
  try {
    logger.info(`Processing page ${page}...`);
    
    // Build URL for this page
    const url = buildPageUrl(page, config);
    
    // Add delay to avoid rate limiting
    if (page > 1 && config.delay > 0) {
      await sleep(config.delay);
    }
    
    // Make HTTP request
    const response = await httpClient.get(url);
    
    // Parse HTML response
    const listings = parseListings(response.data, config);
    
    // Update progress
    progressBar.increment();
    
    logger.info(`Page ${page} completed: Found ${listings.length} listings`);
    return listings;
  } catch (error) {
    logger.error(`Error processing page ${page}: ${error.message}`);
    // Return empty array for failed pages
    progressBar.increment();
    return [];
  }
}

/**
 * Build URL for a specific page
 * @param {number} page - Page number
 * @param {Object} config - Configuration object
 * @returns {string} - Complete URL
 */
function buildPageUrl(page, config) {
  const { baseUrl, searchPath, params } = config;
  
  // Build query string from params
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'districtCode') {
      value.forEach(val => queryParams.append(key, val))
      continue
    }
    queryParams.append(key, value);
  }
  // Add page parameter
  if (page > 1) {
    queryParams.append('page', page);
  }
  
  const queryString = queryParams.toString();
  return `${baseUrl}${searchPath}${queryString ? '?' + queryString : ''}`;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise} - Promise that resolves after the specified duration
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}