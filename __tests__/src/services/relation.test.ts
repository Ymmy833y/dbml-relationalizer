import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RelationDefinitions, RelationPattern, DatabaseSchemaMap } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { findRelations } from '../../../src/services/relation';

vi.mock('../../../src/utils/logger');

describe('findRelations', () => {
  const mockSchemaMap: DatabaseSchemaMap = {
    users: {
      columns: ['id', 'name', 'email', 'address'],
      primaryKeys: ['id'],
      uniqueKeys: ['email'],
    },
    orders: {
      columns: ['id', 'user_id', 'total'],
      primaryKeys: ['id'],
      uniqueKeys: [],
    },
    addresses: {
      columns: ['id', 'address', 'tel'],
      primaryKeys: ['id'],
      uniqueKeys: []
    }
  };

  const mockRelationDefinitions: RelationDefinitions = {
    inference: {
      enabled: true
    },
    relations: [
      {
        parentQualifiedColumn: 'addresses.address',
        childQualifiedColumns: ['%.address'],
      },
    ],
  };

  const mockInferredRelations: RelationPattern[] = [
    {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['%.user_id'],
    },
    {
      parentQualifiedColumn: 'users.email',
      childQualifiedColumns: ['%.email'],
    },
    {
      parentQualifiedColumn: 'orders.id',
      childQualifiedColumns: ['%.order_id'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find relations for valid relation patterns and inferred relations', () => {
    const result = findRelations(mockSchemaMap, mockRelationDefinitions, mockInferredRelations);

    expect(result).toEqual([
      {
        parentTable: 'users',
        parentColumn: 'id',
        childTable: 'orders',
        childColumn: 'user_id',
      },
      {
        parentTable: 'addresses',
        parentColumn: 'address',
        childTable: 'users',
        childColumn: 'address',
      },
    ]);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should handle ignoreChildQualifiedColumns correctly', () => {
    const relationDefinitionsWithIgnore: RelationDefinitions = {
      inference: {
        enabled: true
      },
      relations: [
        {
          parentQualifiedColumn: 'users.id',
          ignoreChildQualifiedColumns: ['orders.user_id'],
        },
      ],
    };

    const result = findRelations(mockSchemaMap, relationDefinitionsWithIgnore, mockInferredRelations);

    expect(result).toEqual([]);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should log warnings for invalid parentQualifiedColumn format', () => {
    const invalidDefinitions: RelationDefinitions = {
      inference: {
        enabled: true
      },
      relations: [
        {
          parentQualifiedColumn: 'users', // Invalid format
          childQualifiedColumns: ['orders.user_id'],
        },
      ],
    };

    const result = findRelations(mockSchemaMap, invalidDefinitions, []);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'Invalid format for parentQualifiedColumn: \'users\'. Expected \'tableName.columnName\'. Skipping relation.'
    );
  });

  it('should log warnings for non-existent parentQualifiedColumn in schema', () => {
    const invalidDefinitions: RelationDefinitions = {
      inference: {
        enabled: true
      },
      relations: [
        {
          parentQualifiedColumn: 'nonexistent_table.id',
          childQualifiedColumns: ['orders.user_id'],
        },
      ],
    };

    const result = findRelations(mockSchemaMap, invalidDefinitions, []);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'ParentQualifiedColumn does not exist in Database schema: nonexistent_table.id. Skipping relation.'
    );
  });

  it('should handle empty relations and inferred relations', () => {
    const emptyDefinitions: RelationDefinitions = {
      inference: {
        enabled: true
      },
      relations: []
    };
    const result = findRelations(mockSchemaMap, emptyDefinitions, []);

    expect(result).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should handle schema map with no matching childQualifiedColumns', () => {
    const unmatchedDefinitions: RelationDefinitions = {
      inference: {
        enabled: true
      },
      relations: [
        {
          parentQualifiedColumn: 'users.id',
          childQualifiedColumns: ['nonexistent_table.column'],
        },
      ],
    };

    const result = findRelations(mockSchemaMap, unmatchedDefinitions, []);

    expect(result).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should handle schema map with no matching tables or columns', () => {
    const emptySchemaMap: DatabaseSchemaMap = {};
    const result = findRelations(emptySchemaMap, mockRelationDefinitions, mockInferredRelations);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'ParentQualifiedColumn does not exist in Database schema: users.id. Skipping relation.'
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'ParentQualifiedColumn does not exist in Database schema: users.email. Skipping relation.'
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'ParentQualifiedColumn does not exist in Database schema: orders.id. Skipping relation.'
    );
  });

  it('should handle ignoreSelfReferences flag correctly', () => {
    const mockSchemaMap: DatabaseSchemaMap = {
      users: {
        columns: ['user_id', 'name', 'email', 'address'],
        primaryKeys: ['user_id'],
        uniqueKeys: ['email'],
      },
      orders: {
        columns: ['order_id', 'user_id', 'total'],
        primaryKeys: ['order_id'],
        uniqueKeys: [],
      },
    };

    const relationDefinitionsWithSelfReference: RelationDefinitions = {
      inference: {
        enabled: false
      },
      relations: [
        {
          parentQualifiedColumn: 'users.user_id',
          childQualifiedColumns: ['%.user_id'],
        },
      ],
      ignoreSelfReferences: false, // Allow self-reference
    };

    const result = findRelations(mockSchemaMap, relationDefinitionsWithSelfReference, []);

    expect(result).toEqual([
      {
        parentTable: 'users',
        parentColumn: 'user_id',
        childTable: 'users',
        childColumn: 'user_id',
      },
      {
        parentTable: 'users',
        parentColumn: 'user_id',
        childTable: 'orders',
        childColumn: 'user_id',
      },
    ]);

    expect(logger.warn).not.toHaveBeenCalled();
  });
});
