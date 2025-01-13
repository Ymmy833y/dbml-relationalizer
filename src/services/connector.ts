import { connector } from '@dbml/connector';
import { DatabaseSchemaJson } from '../types.js';
import logger from '../utils/logger.js';

export async function fetchSchema(databaseType: string, connection: string): Promise<DatabaseSchemaJson> {
  logger.debug('Connecting to the database...');
  try {
    const schemaJson = await connector.fetchSchemaJson(connection, databaseType);
    logger.debug(`Fetched schema with ${Object.keys(schemaJson.tables).length} tables.`);
    return schemaJson;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to connect to database: ${error.message}`);
      logger.debug(`Stack trace: ${error.stack}`);
    } else {
      logger.error('Failed to connect to database: Unknown error.');
    }
    throw new Error('Failed to connect to database.');
  }
}
