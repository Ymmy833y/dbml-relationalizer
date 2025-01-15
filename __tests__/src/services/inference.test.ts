import pluralize from 'pluralize';
import { DatabaseSchemaMap, InferenceDefinitions } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { generateInferredRelationPattern } from '../../../src/services/inference';

jest.mock('../../../src/utils/logger');
jest.mock('pluralize');

describe('generateInferredRelationPattern', () => {
  const mockInferenceEnabled: InferenceDefinitions = {
    enabled: true,
  };

  const mockInferenceDisabled: InferenceDefinitions = {
    enabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (pluralize.singular as jest.Mock).mockImplementation((word) => word.slice(0, -1));
  });

  it('should generate inferred relation patterns with default strategy', () => {
    const mockSchemaMap: DatabaseSchemaMap = {
      users: {
        columns: ['id', 'name', 'email'],
        primaryKeys: ['id'],
        uniqueKeys: ['email'],
      },
      orders: {
        columns: ['id', 'user_id'],
        primaryKeys: ['id'],
        uniqueKeys: [],
      },
    };
    const result = generateInferredRelationPattern(mockSchemaMap, mockInferenceEnabled);

    expect(result).toEqual([
      {
        parentQualifiedColumn: 'users.id',
        childQualifiedColumns: ['%.user_id'],
      },
      {
        parentQualifiedColumn: 'users.email',
        childQualifiedColumns: ['%.user_email'],
      },
      {
        parentQualifiedColumn: 'orders.id',
        childQualifiedColumns: ['%.order_id'],
      },
    ]);

    expect(logger.debug).toHaveBeenCalledWith(
      'Inferred Relation were generated successfully. Inferred Relation Pattern: ' +
        JSON.stringify(result)
    );
  });

  it('should generate inferred relation patterns with identical strategy', () => {
    const mockSchemaMap: DatabaseSchemaMap = {
      users: {
        columns: ['user_id', 'name', 'email'],
        primaryKeys: ['user_id'],
        uniqueKeys: ['email'],
      },
      orders: {
        columns: ['order_id', 'user_id'],
        primaryKeys: ['order_id'],
        uniqueKeys: [],
      },
    };
    const identicalInference: InferenceDefinitions = {
      enabled: true,
      strategy: 'identical',
    };

    const result = generateInferredRelationPattern(mockSchemaMap, identicalInference);

    expect(result).toEqual([
      {
        parentQualifiedColumn: 'users.user_id',
        childQualifiedColumns: ['%.user_id'],
      },
      {
        parentQualifiedColumn: 'users.email',
        childQualifiedColumns: ['%.email'],
      },
      {
        parentQualifiedColumn: 'orders.order_id',
        childQualifiedColumns: ['%.order_id'],
      },
    ]);
  });

  it('should return an empty array if inference is disabled', () => {
    const mockSchemaMap: DatabaseSchemaMap = {
      users: {
        columns: ['id', 'name', 'email'],
        primaryKeys: ['id'],
        uniqueKeys: ['email'],
      },
      orders: {
        columns: ['id', 'user_id'],
        primaryKeys: ['id'],
        uniqueKeys: [],
      },
    };
    const result = generateInferredRelationPattern(mockSchemaMap, mockInferenceDisabled);

    expect(result).toEqual([]);
    expect(logger.debug).toHaveBeenCalledWith('Implicit relationship inference is disabled.');
  });

  it('should handle a schema map with no primary or unique keys', () => {
    const emptySchemaMap: DatabaseSchemaMap = {
      empty_table: {
        columns: ['id', 'name'],
        primaryKeys: [],
        uniqueKeys: [],
      },
    };

    const result = generateInferredRelationPattern(emptySchemaMap, mockInferenceEnabled);

    expect(result).toEqual([]);
    expect(logger.debug).toHaveBeenCalledWith(
      'Inferred Relation were generated successfully. Inferred Relation Pattern: []'
    );
  });

  it('should handle empty schema map', () => {
    const result = generateInferredRelationPattern({}, mockInferenceEnabled);

    expect(result).toEqual([]);
    expect(logger.debug).toHaveBeenCalledWith(
      'Inferred Relation were generated successfully. Inferred Relation Pattern: []'
    );
  });
});
