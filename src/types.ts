/* eslint-disable @typescript-eslint/no-explicit-any */

type InferenceStrategy = 'default' | 'identical';

interface InferenceDefinitions {
  enabled: boolean;
  strategy?: InferenceStrategy;
}

interface RelationPattern {
  parentQualifiedColumn: string;
  childQualifiedColumns?: string[];
  ignoreChildQualifiedColumns?: string[];
}

interface RelationDefinitions {
  inference: InferenceDefinitions;
  relations?: RelationPattern[];
  ignoreSelfReferences?: boolean;
}

interface Relation {
  parentTable: string;
  parentColumn: string;
  childTable: string;
  childColumn: string;
}

interface DatabaseSchemaJson {
  tables: Record<string, any>;
  fields: Record<string, any>;
  tableConstraints: Record<string, Record<string, any>>;
}

interface TableSchema {
  columns: string[];
  primaryKeys: string[];
  uniqueKeys: string[];
}

type DatabaseSchemaMap = Record<string, TableSchema>;

interface CommandOptions {
  outFile?: string;
  inputFile?: string;
  verbose?: boolean;
}

function isInferenceDefinitions(obj: any): obj is InferenceDefinitions {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const requiredKeys = ['enabled'];
  const optionalKeys = ['strategy'];
  const allowedKeys = [...requiredKeys, ...optionalKeys];

  const objKeys = Object.keys(obj);

  // Required properties are present
  if (!requiredKeys.every(key => objKeys.includes(key))) {
    return false;
  }

  // Disallowed properties are not present
  if (!objKeys.every(key => allowedKeys.includes(key))) {
    return false;
  }

  // Check the properties type
  return (
    typeof obj.enabled === 'boolean' &&
    (obj.strategy === undefined || ['default', 'identical'].includes(obj.strategy))
  );
}

function isRelationPattern(obj: any): obj is RelationPattern {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const requiredKeys = ['parentQualifiedColumn'];
  const optionalKeys = ['childQualifiedColumns', 'ignoreChildQualifiedColumns'];
  const allowedKeys = [...requiredKeys, ...optionalKeys];

  const objKeys = Object.keys(obj);

  // Required properties are present
  if (!requiredKeys.every(key => objKeys.includes(key))) {
    return false;
  }

  // Disallowed properties are not present
  if (!objKeys.every(key => allowedKeys.includes(key))) {
    return false;
  }

  // Ensure at least one of 'childQualifiedColumns' or 'ignoreChildQualifiedColumns' is defined
  if (
    obj.childQualifiedColumns === undefined &&
    obj.ignoreChildQualifiedColumns === undefined
  ) {
    return false;
  }

  // Check the properties type
  return (
    typeof obj.parentQualifiedColumn === 'string' &&
    (obj.childQualifiedColumns === undefined || Array.isArray(obj.childQualifiedColumns)) &&
    (obj.ignoreChildQualifiedColumns === undefined || Array.isArray(obj.ignoreChildQualifiedColumns))
  );
}

export {
  InferenceStrategy,
  InferenceDefinitions,
  RelationPattern,
  RelationDefinitions,
  Relation,
  DatabaseSchemaJson,
  DatabaseSchemaMap,
  CommandOptions,
  isInferenceDefinitions,
  isRelationPattern
};
