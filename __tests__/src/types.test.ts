import { isInferenceDefinitions, isRelationPattern } from '../../src/types';

describe('isInferenceDefinitions', () => {
  it('should return true for a valid InferenceDefinitions object', () => {
    const validObject = {
      enabled: true,
      strategy: 'default',
    };

    expect(isInferenceDefinitions(validObject)).toBe(true);
  });

  it('should return true for a valid object without the optional strategy property', () => {
    const validObjectWithoutStrategy = {
      enabled: false,
    };

    expect(isInferenceDefinitions(validObjectWithoutStrategy)).toBe(true);
  });

  it('should return false if enabled is missing', () => {
    const missingEnabled = {
      strategy: 'default',
    };

    expect(isInferenceDefinitions(missingEnabled)).toBe(false);
  });

  it('should return false if enabled is not a boolean', () => {
    const invalidEnabled = {
      enabled: 'true',
      strategy: 'default',
    };

    expect(isInferenceDefinitions(invalidEnabled)).toBe(false);
  });

  it('should return false if strategy is invalid', () => {
    const invalidStrategy = {
      enabled: true,
      strategy: 'invalid',
    };

    expect(isInferenceDefinitions(invalidStrategy)).toBe(false);
  });

  it('should return false if there are additional properties', () => {
    const extraProperties = {
      enabled: true,
      strategy: 'default',
      extraKey: 'extraValue',
    };

    expect(isInferenceDefinitions(extraProperties)).toBe(false);
  });

  it('should return false for non-object inputs', () => {
    expect(isInferenceDefinitions(null)).toBe(false);
    expect(isInferenceDefinitions(undefined)).toBe(false);
    expect(isInferenceDefinitions(123)).toBe(false);
    expect(isInferenceDefinitions('string')).toBe(false);
    expect(isInferenceDefinitions(['array'])).toBe(false);
    expect(isInferenceDefinitions(true)).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isInferenceDefinitions({})).toBe(false);
  });
});

describe('isRelationPattern', () => {
  it('should return true for a valid RelationPattern object with optional childQualifiedColumns and ignoreChildQualifiedColumns', () => {
    const validPatternWithIgnore = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
      ignoreChildQualifiedColumns: ['logs.user_id'],
    };

    expect(isRelationPattern(validPatternWithIgnore)).toBe(true);
  });

  it('should return false if parentQualifiedColumn is missing', () => {
    const missingParentQualifiedColumn = {};

    expect(isRelationPattern(missingParentQualifiedColumn)).toBe(false);
  });

  it('should return false if parentQualifiedColumn is not a string', () => {
    const invalidParentQualifiedColumn = {
      parentQualifiedColumn: 123,
      childQualifiedColumns: ['orders.user_id'],
    };

    expect(isRelationPattern(invalidParentQualifiedColumn)).toBe(false);
  });

  it('should return false if childQualifiedColumns is not an array', () => {
    const invalidChildQualifiedColumns = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: 'orders.user_id',
    };

    expect(isRelationPattern(invalidChildQualifiedColumns)).toBe(false);
  });

  it('should return false if ignoreChildQualifiedColumns is not an array or undefined', () => {
    const invalidIgnoreChildQualifiedColumns = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
      ignoreChildQualifiedColumns: 'logs.user_id',
    };

    expect(isRelationPattern(invalidIgnoreChildQualifiedColumns)).toBe(false);
  });

  it('should return false if both childQualifiedColumns and ignoreChildQualifiedColumns are undefined', () => {
    const bothUndefined = {
      parentQualifiedColumn: 'users.id',
    };

    expect(isRelationPattern(bothUndefined)).toBe(false);
  });

  it('should return true if one of childQualifiedColumns or ignoreChildQualifiedColumns is defined', () => {
    const onlyChildDefined = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
    };

    const onlyIgnoreDefined = {
      parentQualifiedColumn: 'users.id',
      ignoreChildQualifiedColumns: ['logs.user_id'],
    };

    expect(isRelationPattern(onlyChildDefined)).toBe(true);
    expect(isRelationPattern(onlyIgnoreDefined)).toBe(true);
  });

  it('should return false for objects with additional properties', () => {
    const extraProperties = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
      extraKey: 'extraValue',
    };

    expect(isRelationPattern(extraProperties)).toBe(false);
  });

  it('should return false for non-object inputs', () => {
    expect(isRelationPattern(null)).toBe(false);
    expect(isRelationPattern(undefined)).toBe(false);
    expect(isRelationPattern(123)).toBe(false);
    expect(isRelationPattern('string')).toBe(false);
    expect(isRelationPattern(['array'])).toBe(false);
    expect(isRelationPattern(true)).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isRelationPattern({})).toBe(false);
  });
});
