import { Command } from 'commander';
import { startCrawler } from './services/crawler.js';
import { loadConfig } from './config/index.js';
import { logger } from './utils/logger.js';

// Set up command line interface
const program = new Command();

program
  .name('propertyguru-crawler')
  .description('Web crawler for PropertyGuru residential property listings')
  .version('1.0.0');

program
  .action(async (options) => {
    try {
      // Load configuration
      const config = await loadConfig(options.config);
      
      // Override config with command line options
      const crawlerConfig = {
        ...config,
        verbose: options.verbose || config.verbose
      };

      logger.info('Starting PropertyGuru crawler...');
      logger.info(`Configuration: ${JSON.stringify(crawlerConfig, null, 2)}`);
      
      // Start the crawler
      const results = await startCrawler(crawlerConfig);
      
      logger.info(`Crawling completed. Extracted ${results.length} property listings.`);
    } catch (error) {
      logger.error(`Error running crawler: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);