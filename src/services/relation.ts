import { RelationPattern, Relation, DatabaseSchemaMap } from '../types.js';
import logger from '../utils/logger.js';

const regexCache: Record<string, RegExp> = {};

/**
 * Extracts table_name and column_name from the expected value "table_name.column_name".
 * Returns null if the arguments do not match the expected format.
 * @param qualifiedColumn
 * @returns Extracted table and column names or null
 */
function splitQualifiedColumn(qualifiedColumn: string): { table: string; column: string } | null {
  const parts = qualifiedColumn.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null; // Return null for invalid input
  }

  const [table, column] = parts;
  return {
    table: table.trim(),
    column: column.trim(),
  };
}

/**
 * Verifies whether the specified table and column exist in the database.
 * @param schemaMap database schemas
 * @param table table name
 * @param column column name
 * @returns True if it exists, False if it does not exist.
 */
function existQualifiedColumn(schemaMap: DatabaseSchemaMap, table: string, column: string): boolean {
  const columnNames = schemaMap[table];
  if (!columnNames) {
    return false;
  }
  return columnNames.columns.includes(column);
}

/**
 * Checks if a given string matches a wildcard pattern.
 * Wildcard patterns use `%` as a placeholder for zero or more characters.
 *
 * Example:
 *   pattern: "%_id", value: "user_id" -> true
 *   pattern: "order_%date", value: "order_created_date" -> true
 *   pattern: "order_%date", value: "order_date" -> true
 *   pattern: "order_%date", value: "orderdate" -> false
 *
 * @param value
 * @param pattern
 * @returns True if the string matches the pattern, otherwise false.
 */
function matchesWildcardPattern(value: string, pattern: string): boolean {
  if (!regexCache[pattern]) {
    const regexPattern = '^' + pattern.replace(/%/g, '.*') + '$';
    regexCache[pattern] = new RegExp(regexPattern);
  }
  return regexCache[pattern].test(value);
}

function filterQualifiedColumnsByPattern(qualifiedColumns: string[], pattern: string): string[] {
  return qualifiedColumns.filter(qualifiedColumn => matchesWildcardPattern(qualifiedColumn, pattern));
}

function extractRelationsFromChildQualifiedColumns(
  schemaMap: DatabaseSchemaMap,
  childQualifiedColumns: string[],
  parentTable: string,
  parentColumn: string
): Relation[] {
  const relations: Relation[] = [];

  childQualifiedColumns.forEach(childQualifiedColumn => {
    const splitResult = splitQualifiedColumn(childQualifiedColumn);
    if (!splitResult) {
      logger.warn(`Invalid format for childQualifiedColumn: '${childQualifiedColumn}'. Expected 'tableName.columnName'.`);
      return;
    }

    const { table: childTable, column: childColumn } = splitResult;

    const validTables = filterQualifiedColumnsByPattern(Object.keys(schemaMap), childTable);
    validTables.forEach(validTable => {
      filterQualifiedColumnsByPattern(schemaMap[validTable].columns, childColumn).forEach(validColumn => {
        relations.push({
          parentTable,
          parentColumn,
          childTable: validTable,
          childColumn: validColumn
        });
      });
    });
  });

  return relations;
}

/**
 * Returns whether the Relation is included in the ignore Relation.
 * As a prerequisite, the parent of the Relation and the parent of the ignore Relation must match.
 * @param relation
 * @param ignoreRelations
 * @returns True if it is included in the ignore relation, False if it is not.
 */
function isIgnoredRelation(relation: Relation, ignoreRelations: Relation[]): boolean {
  return ignoreRelations.some(ignoreRelation =>
    relation.childTable === ignoreRelation.childTable &&
    relation.childColumn === ignoreRelation.childColumn
  );
}

function findRelation(schemaMap: DatabaseSchemaMap, relationPattern: RelationPattern): Relation[] {
  const splitResult = splitQualifiedColumn(relationPattern.parentQualifiedColumn);
  if (!splitResult) {
    logger.warn(`Invalid format for parentQualifiedColumn: '${relationPattern.parentQualifiedColumn}'. Expected 'tableName.columnName'. Skipping relation.`);
    return [];
  }

  const { table: parentTable, column: parentColumn } = splitResult;

  if (!existQualifiedColumn(schemaMap, parentTable, parentColumn)) {
    logger.warn(`ParentQualifiedColumn does not exist in Database schema: ${relationPattern.parentQualifiedColumn}. Skipping relation.`);
    return [];
  }

  const relations = extractRelationsFromChildQualifiedColumns(
    schemaMap,
    relationPattern.childQualifiedColumns,
    parentTable,
    parentColumn
  );

  const ignoreRelations = extractRelationsFromChildQualifiedColumns(
    schemaMap,
    relationPattern.ignoreChildQualifiedColumns || [],
    parentTable,
    parentColumn
  );

  ignoreRelations.push({
    parentTable,
    parentColumn,
    childTable: parentTable,
    childColumn: parentColumn
  });

  return relations.filter(relation => {
    return !isIgnoredRelation(relation, ignoreRelations);
  });
}

function findRelations(schemaMap: DatabaseSchemaMap, relationPatterns: RelationPattern[]): Relation[] {
  return relationPatterns.flatMap(relationPattern =>
    findRelation(schemaMap, relationPattern)
  );
}

export {
  findRelations
};
