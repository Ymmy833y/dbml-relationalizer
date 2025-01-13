/* eslint-disable @typescript-eslint/no-explicit-any */

interface RelationPattern {
  parentQualifiedColumn: string;
  childQualifiedColumns: string[];
  ignoreChildQualifiedColumns?: string[];
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
}

type DatabaseSchemaMap = Record<string, TableSchema>;

interface CommandOptions {
  outFile?: string;
  inputFile?: string;
  verbose?: boolean;
}

function isRelationPattern(obj: any): obj is RelationPattern {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  const requiredKeys = ['parentQualifiedColumn', 'childQualifiedColumns'];
  const optionalKeys = ['ignoreChildQualifiedColumns'];
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
    typeof obj.parentQualifiedColumn === 'string' &&
    Array.isArray(obj.childQualifiedColumns) &&
    (obj.ignoreChildQualifiedColumns === undefined || Array.isArray(obj.ignoreChildQualifiedColumns))
  );
}

export {
  RelationPattern,
  Relation,
  DatabaseSchemaJson,
  DatabaseSchemaMap,
  CommandOptions,
  isRelationPattern
};
