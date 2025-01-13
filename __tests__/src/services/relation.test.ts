import { RelationPattern, DatabaseSchemaMap } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { findRelations } from '../../../src/services/relation';

jest.mock('../../../src/utils/logger');

describe('findRelations', () => {
  const mockSchemaMap: DatabaseSchemaMap = {
    users: {
      columns: ['id', 'name', 'email'],
      primaryKeys: ['id'],
    },
    orders: {
      columns: ['id', 'user_id', 'total'],
      primaryKeys: ['id'],
    },
  };

  const mockRelationPatterns: RelationPattern[] = [
    {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
    },
  ];

  const mockRelationPatternsWithIgnore: RelationPattern[] = [
    {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
      ignoreChildQualifiedColumns: ['orders.user_id'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return relations for valid relation patterns', () => {
    const result = findRelations(mockSchemaMap, mockRelationPatterns);

    expect(result).toEqual([
      {
        parentTable: 'users',
        parentColumn: 'id',
        childTable: 'orders',
        childColumn: 'user_id',
      },
    ]);
  });

  it('should skip relations for invalid parentQualifiedColumn format', () => {
    const invalidPatterns: RelationPattern[] = [
      {
        parentQualifiedColumn: 'users',
        childQualifiedColumns: ['orders.user_id'],
      },
    ];

    const result = findRelations(mockSchemaMap, invalidPatterns);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid format for parentQualifiedColumn: 'users'. Expected 'tableName.columnName'. Skipping relation."
    );
  });

  it('should skip relations when parentQualifiedColumn does not exist in schema', () => {
    const invalidPatterns: RelationPattern[] = [
      {
        parentQualifiedColumn: 'nonexistent_table.id',
        childQualifiedColumns: ['orders.user_id'],
      },
    ];

    const result = findRelations(mockSchemaMap, invalidPatterns);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      "ParentQualifiedColumn does not exist in Database schema: nonexistent_table.id. Skipping relation."
    );
  });

  it('should exclude relations based on ignoreChildQualifiedColumns', () => {
    const result = findRelations(mockSchemaMap, mockRelationPatternsWithIgnore);

    expect(result).toEqual([]);
  });

  it('should log a warning for invalid childQualifiedColumns', () => {
    const patternsWithInvalidChild: RelationPattern[] = [
      {
        parentQualifiedColumn: 'users.id',
        childQualifiedColumns: ['orders'], // Invalid format
      },
    ];

    const result = findRelations(mockSchemaMap, patternsWithInvalidChild);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid format for childQualifiedColumn: 'orders'. Expected 'tableName.columnName'."
    );
  });

  it('should handle multiple valid relation patterns', () => {
    const multiplePatterns: RelationPattern[] = [
      {
        parentQualifiedColumn: 'users.id',
        childQualifiedColumns: ['orders.user_id'],
      },
      {
        parentQualifiedColumn: 'orders.id',
        childQualifiedColumns: ['users.id'],
      },
    ];

    const result = findRelations(mockSchemaMap, multiplePatterns);

    expect(result).toEqual([
      {
        parentTable: 'users',
        parentColumn: 'id',
        childTable: 'orders',
        childColumn: 'user_id',
      },
      {
        parentTable: 'orders',
        parentColumn: 'id',
        childTable: 'users',
        childColumn: 'id',
      },
    ]);
  });

  it('should return an empty array when no relations are found', () => {
    const patternsWithoutRelations: RelationPattern[] = [
      {
        parentQualifiedColumn: 'users.id',
        childQualifiedColumns: ['nonexistent_table.column'],
      },
    ];

    const result = findRelations(mockSchemaMap, patternsWithoutRelations);

    expect(result).toEqual([]);
  });
});
