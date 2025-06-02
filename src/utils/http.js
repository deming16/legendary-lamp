import axios from 'axios';
import axiosRetry from 'axios-retry';
import randomUseragent from 'random-useragent';
import { logger } from '../utils/logger.js';

/**
 * Create an HTTP client with retry and timeout configuration
 * @param {Object} config - Configuration object
 * @returns {Object} - Configured axios instance
 */
export function createHttpClient(config) {
  // Create axios instance with default configuration
  const client = axios.create({
    timeout: config.timeout || 30000,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    }
  });

  // Configure retry behavior
  axiosRetry(client, {
    retries: config.retries || 3,
    retryDelay: (retryCount) => {
      const delay = Math.pow(2, retryCount) * 1000;
      logger.info(`Retry attempt ${retryCount}. Retrying in ${delay}ms...`);
      return delay;
    },
    retryCondition: (error) => {
      // Retry on network errors or 5xx responses
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
        (error.response && error.response.status >= 400);
    }
  });

  // Add request interceptor for user agent rotation
  client.interceptors.request.use(request => {
    if (config.userAgentRotation) {
      request.headers['User-Agent'] = randomUseragent.getRandom();
      if (config.verbose) {
        logger.info(`Using User-Agent: ${request.headers['User-Agent']}`);
      }
    }
    return request;
  });

  // Add response interceptor for logging
  client.interceptors.response.use(
    response => {
      if (config.verbose) {
        logger.info(`Received response from ${response.config.url} (${response.status})`);
      }
      return response;
    },
    error => {
      if (error.response) {
        logger.error(`HTTP Error: ${error.response.status} - ${error.response.statusText} for ${error.config.url}`);
      } else if (error.request) {
        logger.error(`Request error: ${error.message} for ${error.config.url}`);
      } else {
        logger.error(`Error: ${error.message}`);
      }
      return Promise.reject(error);
    }
  );

  return client;
}