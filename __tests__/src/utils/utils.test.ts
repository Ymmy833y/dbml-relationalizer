import { readFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import logger from '../../../src/utils/logger';

import { getVersion, getCommandOpt, splitQualifiedColumn, matchesWildcardPattern, addUniqueItems } from '../../../src/utils/utils';

jest.mock('fs');
jest.mock('path');
jest.mock('../../../src/utils/logger');


describe('getVersion', () => {
  it('should return the version from package.json', () => {
    const mockVersion = '1.0.0';
    const mockPackageJsonPath = '/mock/path/package.json';
    const mockPackageJsonContent = JSON.stringify({ version: mockVersion });

    (join as jest.Mock).mockReturnValue(mockPackageJsonPath);
    (readFileSync as jest.Mock).mockReturnValue(mockPackageJsonContent);

    const result = getVersion();

    expect(join).toHaveBeenCalledWith(process.cwd(), 'package.json');
    expect(readFileSync).toHaveBeenCalledWith(mockPackageJsonPath, 'utf8');
    expect(result).toBe(mockVersion);
  });

  it('should throw an error if package.json is invalid', () => {
    const mockPackageJsonPath = '/mock/path/package.json';
    const invalidContent = '{ invalid json }';

    (join as jest.Mock).mockReturnValue(mockPackageJsonPath);
    (readFileSync as jest.Mock).mockReturnValue(invalidContent);

    expect(() => getVersion()).toThrow(SyntaxError);
    expect(join).toHaveBeenCalledWith(process.cwd(), 'package.json');
    expect(readFileSync).toHaveBeenCalledWith(mockPackageJsonPath, 'utf8');
  });
});

describe('getCommandOpt', () => {
  const mockProgram = new Command();
  const mockOptions = { verbose: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return database type, connection, and options', () => {
    mockProgram.args = ['postgres', 'postgres://user:password@localhost:5432/db'];
    mockProgram.opts = jest.fn().mockReturnValue(mockOptions);

    const result = getCommandOpt(mockProgram);

    expect(result).toEqual({
      databaseType: 'postgres',
      connection: 'postgres://user:password@localhost:5432/db',
      options: mockOptions,
    });
    expect(logger.level).toBe('debug');
    expect(logger.debug).toHaveBeenCalledWith('Verbose mode enabled');
    expect(logger.debug).toHaveBeenCalledWith(
      'Database Type: postgres, Connection: postgres://user:password@localhost:5432/db, Options: {"verbose":true}'
    );
  });

  it('should correctly parse all command options', () => {
    mockProgram.args = ['postgres', 'postgres://user:password@localhost:5432/db'];
    mockProgram.opts = jest.fn().mockReturnValue({
      outFile: 'output.dbml',
      inputFile: 'schema.sql',
      verbose: true,
    });

    const result = getCommandOpt(mockProgram);

    expect(result).toEqual({
      databaseType: 'postgres',
      connection: 'postgres://user:password@localhost:5432/db',
      options: {
        outFile: 'output.dbml',
        inputFile: 'schema.sql',
        verbose: true,
      },
    });

    expect(logger.level).toBe('debug');
    expect(logger.debug).toHaveBeenCalledWith('Verbose mode enabled');
    expect(logger.debug).toHaveBeenCalledWith(
      'Database Type: postgres, Connection: postgres://user:password@localhost:5432/db, Options: {"outFile":"output.dbml","inputFile":"schema.sql","verbose":true}'
    );
  });

  it('should throw an error if database type or connection is missing', () => {
    mockProgram.args = ['postgres'];
    mockProgram.opts = jest.fn().mockReturnValue(mockOptions);

    expect(() => getCommandOpt(mockProgram)).toThrow(
      'Database type and connection string are required.'
    );
  });
});

describe('splitQualifiedColumn', () => {
  it('should correctly split a qualified column into table and column', () => {
    const input = 'user.id';
    const result = splitQualifiedColumn(input);
    expect(result).toEqual({ table: 'user', column: 'id' });
  });

  it('should return null for input without a dot separator', () => {
    const input = 'user_id';
    const result = splitQualifiedColumn(input);
    expect(result).toBeNull();
  });

  it('should return null for input with multiple dots', () => {
    const input = 'schema.user.id';
    const result = splitQualifiedColumn(input);
    expect(result).toBeNull();
  });

  it('should return null for input with empty table or column name', () => {
    expect(splitQualifiedColumn('.id')).toBeNull();
    expect(splitQualifiedColumn('users.')).toBeNull();
    expect(splitQualifiedColumn('.')).toBeNull();
  });

  it('should trim whitespace around table and column names', () => {
    const input = '  users  .  id  ';
    const result = splitQualifiedColumn(input);
    expect(result).toEqual({ table: 'users', column: 'id' });
  });
});

describe('matchesWildcardPattern', () => {
  it('should return true for matching pattern with % as wildcard', () => {
    expect(matchesWildcardPattern('user_id', '%')).toBe(true);
    expect(matchesWildcardPattern('user_id', '%_id')).toBe(true);
    expect(matchesWildcardPattern('order_created_date', 'order_%date')).toBe(true);
    expect(matchesWildcardPattern('order_date', 'order_%date')).toBe(true);
  });

  it('should return false for non-matching pattern', () => {
    expect(matchesWildcardPattern('user_id', 'id%')).toBe(false);
    expect(matchesWildcardPattern('orderdate', 'order_%date')).toBe(false);
    expect(matchesWildcardPattern('order_created_date', '%_id')).toBe(false);
  });

  it('should cache regex patterns to optimize performance', () => {
    const pattern = 'order_%date';
    const spy = jest.spyOn(RegExp.prototype, 'test');

    matchesWildcardPattern('order_created_date', pattern);
    matchesWildcardPattern('order_date', pattern);

    // RegExp.prototype.test should only be called twice
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  it('should handle patterns with only % wildcard', () => {
    expect(matchesWildcardPattern('anything', '%')).toBe(true);
    expect(matchesWildcardPattern('', '%')).toBe(true);
  });

  it('should handle patterns without any wildcards', () => {
    expect(matchesWildcardPattern('exact_match', 'exact_match')).toBe(true);
    expect(matchesWildcardPattern('exact_match', 'different_match')).toBe(false);
  });
});

describe('addUniqueItems', () => {
  it('should add unique objects to the original list', () => {
    const originalList = [
      { key: 'value1', anotherKey: 'value2' },
    ];
    const itemsToAdd = [
      { key: 'value1', anotherKey: 'value2' }, // duplicate object with different reference
      { key: 'uniqueKey', anotherKey: 'uniqueValue' }, // unique object
    ];

    addUniqueItems(originalList, itemsToAdd);

    expect(originalList).toEqual([
      { key: 'value1', anotherKey: 'value2' },
      { key: 'uniqueKey', anotherKey: 'uniqueValue' },
    ]);
  });

  it('should not add duplicate objects with different references', () => {
    const originalList = [
      { key: 'value1', anotherKey: 'value2' },
    ];
    const duplicateObject = { key: 'value1', anotherKey: 'value2' }; // Same content, different reference

    addUniqueItems(originalList, [duplicateObject]);

    // Only the first object remains in the list
    expect(originalList).toEqual([
      { key: 'value1', anotherKey: 'value2' },
    ]);
  });

  it('should handle an empty original list', () => {
    const originalList: object[] = [];
    const itemsToAdd = [
      { key: 'value1', anotherKey: 'value2' },
      { key: 'uniqueKey', anotherKey: 'uniqueValue' },
    ];

    addUniqueItems(originalList, itemsToAdd);

    expect(originalList).toEqual([
      { key: 'value1', anotherKey: 'value2' },
      { key: 'uniqueKey', anotherKey: 'uniqueValue' },
    ]);
  });

  it('should handle an empty itemsToAdd list', () => {
    const originalList = [
      { key: 'value1', anotherKey: 'value2' },
    ];
    const itemsToAdd: object[] = [];

    addUniqueItems(originalList, itemsToAdd);

    expect(originalList).toEqual([
      { key: 'value1', anotherKey: 'value2' },
    ]);
  });

  it('should handle empty original and itemsToAdd lists', () => {
    const originalList: object[] = [];
    const itemsToAdd: object[] = [];

    addUniqueItems(originalList, itemsToAdd);

    expect(originalList).toEqual([]);
  });
});
