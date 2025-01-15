import { Command } from 'commander';
import generateDBML from '../../../src/commands/relation2dbml';
import { loadRelationDefinitions, fetchSchema, generateInferredRelationPattern, findRelations, generate } from '../../../src/services/index';
import logger from '../../../src/utils/logger';
import { getVersion, getCommandOpt } from '../../../src/utils/utils';
import { Relation } from '../../../src/types';

jest.mock('../../../src/services/index');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/utils/utils');

describe('generateDBML', () => {
  const mockProgram = new Command();
  const mockOptions = { inputFile: 'mockInputFile.yml', outFile: 'mockOutputFile.dbml' };
  const mockRelationDefinitions = {
    inference: { enabled: true, strategy: 'default' },
    relations: [],
  };
  const mockSchemaJson = {
    tables: { users: { name: 'users' }, orders: { name: 'orders' } },
    fields: {
      users: [{ name: 'id' }, { name: 'name' }],
      orders: [{ name: 'id' }, { name: 'user_id' }],
    },
    tableConstraints: {
      users: { id: { pk: true }, email: { unique: true } },
      orders: { id: { pk: true } },
    },
  };
  const mockSchemaMap = {
    users: { columns: ['id', 'name'], primaryKeys: ['id'], uniqueKeys: ['email'] },
    orders: { columns: ['id', 'user_id'], primaryKeys: ['id'], uniqueKeys: [] },
  };
  const mockInferredRelations: Relation[] = [];
  const mockRelations: Relation[] = [];

  beforeEach(() => {
    jest.clearAllMocks();

    (getVersion as jest.Mock).mockReturnValue('1.0.0');
    (getCommandOpt as jest.Mock).mockReturnValue({
      databaseType: 'postgres',
      connection: 'postgres://user:password@localhost:5432/db',
      options: mockOptions,
    });
    (loadRelationDefinitions as jest.Mock).mockReturnValue(mockRelationDefinitions);
    (fetchSchema as jest.Mock).mockResolvedValue(mockSchemaJson);
    (generateInferredRelationPattern as jest.Mock).mockReturnValue(mockInferredRelations);
    (findRelations as jest.Mock).mockReturnValue(mockRelations);
  });

  it('should complete DBML generation successfully', async () => {
    await generateDBML(mockProgram);

    expect(getVersion).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Starting relation2dbml script (Version: 1.0.0)');
    expect(getCommandOpt).toHaveBeenCalledWith(mockProgram);
    expect(loadRelationDefinitions).toHaveBeenCalledWith(mockOptions.inputFile);
    expect(fetchSchema).toHaveBeenCalledWith('postgres', 'postgres://user:password@localhost:5432/db');
    expect(generateInferredRelationPattern).toHaveBeenCalledWith(mockSchemaMap, mockRelationDefinitions.inference);
    expect(findRelations).toHaveBeenCalledWith(mockSchemaMap, mockRelationDefinitions, mockInferredRelations);
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
