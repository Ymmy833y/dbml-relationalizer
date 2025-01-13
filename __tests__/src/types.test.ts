import { isRelationPattern } from '../../src/types';

describe('isRelationPattern', () => {
  it('should return true for a valid RelationPattern object', () => {
    const validPattern = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
    };

    expect(isRelationPattern(validPattern)).toBe(true);
  });

  it('should return true for a valid RelationPattern object with optional ignoreChildQualifiedColumns', () => {
    const validPatternWithIgnore = {
      parentQualifiedColumn: 'users.id',
      childQualifiedColumns: ['orders.user_id'],
      ignoreChildQualifiedColumns: ['logs.user_id'],
    };

    expect(isRelationPattern(validPatternWithIgnore)).toBe(true);
  });

  it('should return false if parentQualifiedColumn is missing', () => {
    const missingParentQualifiedColumn = {
      childQualifiedColumns: ['orders.user_id'],
    };

    expect(isRelationPattern(missingParentQualifiedColumn)).toBe(false);
  });

  it('should return false if childQualifiedColumns is missing', () => {
    const missingChildQualifiedColumns = {
      parentQualifiedColumn: 'users.id',
    };

    expect(isRelationPattern(missingChildQualifiedColumns)).toBe(false);
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
