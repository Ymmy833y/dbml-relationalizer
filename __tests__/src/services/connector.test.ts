import { connector } from '@dbml/connector';
import { DatabaseSchemaJson } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { fetchSchema } from '../../../src/services/connector';

jest.mock('@dbml/connector');
jest.mock('../../../src/utils/logger');

describe('fetchSchema', () => {
  const mockDatabaseType = 'postgres';
  const mockConnection = 'postgres://user:password@localhost:5432/db';
  const mockSchemaJson: DatabaseSchemaJson = {
    tables: {
      users: {},
      orders: {},
    },
    fields: {},
    tableConstraints: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch the schema and log the number of tables', async () => {
    (connector.fetchSchemaJson as jest.Mock).mockResolvedValue(mockSchemaJson);

    const result = await fetchSchema(mockDatabaseType, mockConnection);

    expect(connector.fetchSchemaJson).toHaveBeenCalledWith(mockConnection, mockDatabaseType);
    expect(result).toEqual(mockSchemaJson);
    expect(logger.debug).toHaveBeenCalledWith('Connecting to the database...');
    expect(logger.debug).toHaveBeenCalledWith(`Fetched schema with ${Object.keys(mockSchemaJson.tables).length} tables.`);
  });

  it('should log and rethrow an error if connector.fetchSchemaJson throws an error', async () => {
    const mockError = new Error('Database connection failed');

    (connector.fetchSchemaJson as jest.Mock).mockRejectedValue(mockError);

    await expect(fetchSchema(mockDatabaseType, mockConnection)).rejects.toThrow('Failed to connect to database.');

    expect(connector.fetchSchemaJson).toHaveBeenCalledWith(mockConnection, mockDatabaseType);
    expect(logger.debug).toHaveBeenCalledWith('Connecting to the database...');
    expect(logger.error).toHaveBeenCalledWith(`Failed to connect to database: ${mockError.message}`);
    expect(logger.debug).toHaveBeenCalledWith(`Stack trace: ${mockError.stack}`);
  });

  it('should log a generic error message if the error is not an instance of Error', async () => {
    const mockError = 'Unknown error';

    (connector.fetchSchemaJson as jest.Mock).mockRejectedValue(mockError);

    await expect(fetchSchema(mockDatabaseType, mockConnection)).rejects.toThrow('Failed to connect to database.');

    expect(connector.fetchSchemaJson).toHaveBeenCalledWith(mockConnection, mockDatabaseType);
    expect(logger.debug).toHaveBeenCalledWith('Connecting to the database...');
    expect(logger.error).toHaveBeenCalledWith('Failed to connect to database: Unknown error.');
    expect(logger.debug).not.toHaveBeenCalledWith(expect.stringContaining('Stack trace'));
  });
});
