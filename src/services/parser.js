import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

/**
 * Parse property listings from HTML content
 * @param {string} html - HTML content to parse
 * @returns {Array} - Array of parsed property objects
 */
export function parseListings(html) {
  try {
    const $ = cheerio.load(html);
    const listings = [];

    // Select all property listing elements
    $('div[data-listing-id]').each((index, element) => {
      try {
        const listing = extractListingData($, element);
        if (listing) {
          listings.push(listing);
        }
      } catch (error) {
        logger.warn(`Error parsing listing ${index}: ${error.message}`);
      }
    });

    logger.info(`Extracted ${listings.length} listings from page`);
    return listings;
  } catch (error) {
    logger.error(`Error parsing HTML: ${error.message}`);
    return [];
  }
}

/**
 * Extract data from a single property listing element
 * @param {Object} $ - Cheerio instance
 * @param {Object} element - Listing element
 * @returns {Object} - Property data object
 */
function extractListingData($, element) {
  const $element = $(element);
  // Parsing size and psf
  const details = $element.find('.listing-feature-group li span');
  let area = null;
  let psf = null  
  details.each((i, el) => {
    const text = $(el).text().trim();
    if (text.includes('sqft')) {
      area = text;
    }
    if (text.includes('psf')) {
      psf = text;
    }
  });
    
  return {
    id: $element.attr('data-listing-id'),
    url: $element.find('a[href*="/listing/"]').attr('href'),
    title: $element.find('h3').text().trim(),
    address: $element.find('.listing-address').text().trim(),
    price: $element.find('.listing-price').text().trim(),
    bedrooms: $element.find('.pgicon-bedroom + span').text().trim(),
    bathrooms: $element.find('.pgicon-bathroom + span').text().trim(),
    area,
    psf,
    agentName: $element.find('.agent-name').text().trim(),
    agentUrl: $element.find('.agent-name').attr('href'),
    timestamp: new Date().toISOString()
  };
}

