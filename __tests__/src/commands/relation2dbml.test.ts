import { Command } from 'commander';
import { loadRelationPattern, fetchSchema, findRelations, generate } from '../../../src/services/index';
import { getVersion, getCommandOpt } from '../../../src/utils/utils';
import logger from '../../../src/utils/logger';

import generateDBML from '../../../src/commands/relation2dbml';

jest.mock('../../../src/services/index');
jest.mock('../../../src/utils/utils');
jest.mock('../../../src/utils/logger');

describe('generateDBML', () => {
  const mockProgram = new Command();
  const mockSchemaJson = {
    tables: {
      users: { name: 'users' },
      orders: { name: 'orders' },
    },
    fields: {
      users: [{ name: 'id' }, { name: 'name' }],
      orders: [{ name: 'id' }, { name: 'user_id' }],
    },
    tableConstraints: {
      users: { id: { pk: true } },
      orders: { id: { pk: true }, user_id: { fk: true } },
    },
  };
  const mockSchemaMap = {
    users: {
      columns: ['id', 'name'],
      primaryKeys: ['id'],
    },
    orders: {
      columns: ['id', 'user_id'],
      primaryKeys: ['id'],
    },
  };
  const mockRelations = [
    {
      parentTable: 'users',
      parentColumn: 'id',
      childTable: 'orders',
      childColumn: 'user_id',
    },
  ];
  const mockRelationPatterns = [
    {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
    },
  ];
  const mockOptions = {
    inputFile: 'relations.yml',
    outFile: 'output.dbml',
    verbose: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (getVersion as jest.Mock).mockReturnValue('1.0.0');
    (getCommandOpt as jest.Mock).mockReturnValue({
      databaseType: 'postgres',
      connection: 'postgres://user:password@localhost:5432/db',
      options: mockOptions,
    });
    (loadRelationPattern as jest.Mock).mockReturnValue(mockRelationPatterns);
    (fetchSchema as jest.Mock).mockResolvedValue(mockSchemaJson);
    (findRelations as jest.Mock).mockReturnValue(mockRelations);
  });

  it('should complete DBML generation successfully', async () => {
    await generateDBML(mockProgram);

    expect(getVersion).toHaveBeenCalled();
    expect(getCommandOpt).toHaveBeenCalledWith(mockProgram);
    expect(loadRelationPattern).toHaveBeenCalledWith(mockOptions.inputFile);
    expect(fetchSchema).toHaveBeenCalledWith('postgres', 'postgres://user:password@localhost:5432/db');
    expect(findRelations).toHaveBeenCalledWith(mockSchemaMap, mockRelationPatterns);
    expect(generate).toHaveBeenCalledWith(mockSchemaJson, mockRelations, mockOptions.outFile);
    expect(logger.info).toHaveBeenCalledWith('DBML generation completed successfully.');
  });

  it('should handle errors and log them', async () => {
    const mockError = new Error('Test error');
    (getCommandOpt as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(generateDBML(mockProgram)).rejects.toThrow('process.exit called');

    expect(logger.error).toHaveBeenCalledWith('Error: Test error');
    expect(logger.debug).toHaveBeenCalledWith(`Stack trace: ${mockError.stack}`);
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });

  it('should handle unexpected non-Error exceptions', async () => {
    const mockError = 'Unexpected string error';
    (getCommandOpt as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(generateDBML(mockProgram)).rejects.toThrow('process.exit called');

    expect(logger.error).toHaveBeenCalledWith('Unexpected error: Unexpected string error');
    expect(processExitSpy).toHaveBeenCalledWith(1);

    processExitSpy.mockRestore();
  });
});
