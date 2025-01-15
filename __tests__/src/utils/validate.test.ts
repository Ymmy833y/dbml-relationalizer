import { isInferenceDefinitions, isRelationPattern } from '../../../src/types';
import logger from '../../../src/utils/logger';

import {
  validateInferenceDefinitions,
  validateRelationPatterns,
  validateRelationPattern,
} from '../../../src/utils/validate';

jest.mock('../../../src/utils/logger');
jest.mock('../../../src/types', () => ({
  isInferenceDefinitions: jest.fn(),
  isRelationPattern: jest.fn(),
}));

describe('validateInferenceDefinitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for valid inference definitions', () => {
    (isInferenceDefinitions as unknown as jest.Mock).mockReturnValue(true);

    const validInference = {
      enabled: true,
      strategy: 'default',
    };

    const result = validateInferenceDefinitions(validInference);

    expect(result).toBe(true);
    expect(isInferenceDefinitions).toHaveBeenCalledWith(validInference);
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('should return false for invalid inference definitions and log a debug message', () => {
    (isInferenceDefinitions as unknown as jest.Mock).mockReturnValue(false);

    const invalidInference = {
      enabled: 'true',
    };

    const result = validateInferenceDefinitions(invalidInference);

    expect(result).toBe(false);
    expect(isInferenceDefinitions).toHaveBeenCalledWith(invalidInference);
    expect(logger.debug).toHaveBeenCalledWith('Inference is invalid.');
  });
});

describe('validateRelationPattern', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for a valid relation pattern', () => {
    (isRelationPattern as unknown as jest.Mock).mockReturnValue(true);

    const validRelation = {
      parentQualifiedColumn: 'users.id',
    };

    const result = validateRelationPattern(validRelation, 0);

    expect(result).toBe(true);
    expect(isRelationPattern).toHaveBeenCalledWith(validRelation);
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('should return false for an invalid relation pattern and log a debug message', () => {
    (isRelationPattern as unknown as jest.Mock).mockReturnValue(false);

    const invalidRelation = { parentQualifiedColumns: 'users' };

    const result = validateRelationPattern(invalidRelation, 2);

    expect(result).toBe(false);
    expect(isRelationPattern).toHaveBeenCalledWith(invalidRelation);
    expect(logger.debug).toHaveBeenCalledWith(
      'Relation at index 3 is invalid. relation: {"parentQualifiedColumns":"users"}'
    );
  });
});

describe('validateRelationsPattern', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for an empty relations array', () => {
    const result = validateRelationPatterns([]);
    expect(result).toBe(true);
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('should return true for a valid relations array', () => {
    (isRelationPattern as unknown as jest.Mock).mockReturnValue(true);

    const validRelations = [
      { parentQualifiedColumn: 'users.id', childQualifiedColumns: ['orders.user_id'] },
      { parentQualifiedColumn: 'products.id', childQualifiedColumns: ['sales.product_id'] },
    ];

    const result = validateRelationPatterns(validRelations);

    expect(result).toBe(true);
    expect(isRelationPattern).toHaveBeenCalledTimes(validRelations.length);
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('should return false if any relation in the array is invalid', () => {
    (isRelationPattern as unknown as jest.Mock).mockImplementation((relation) =>
      relation.parentQualifiedColumn === 'users.id'
    );

    const mixedRelations = [
      { parentQualifiedColumn: 'users.id' },
      { parentQualifiedColumns: 'invalid' },
    ];

    const result = validateRelationPatterns(mixedRelations);

    expect(result).toBe(false);
    expect(isRelationPattern).toHaveBeenCalledTimes(mixedRelations.length);
    expect(logger.debug).toHaveBeenCalledWith(
      'Relation at index 2 is invalid. relation: {"parentQualifiedColumns":"invalid"}'
    );
  });

  it('should return true if relations is undefined or not an array and log a debug message', () => {
    const result = validateRelationPatterns(undefined);
    expect(result).toBe(true);
    expect(logger.debug).toHaveBeenCalledWith('Relations is not specified.');
  });
});
