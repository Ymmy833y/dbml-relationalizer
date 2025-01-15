import { RelationDefinitions, RelationPattern, Relation, DatabaseSchemaMap } from '../types.js';
import { splitQualifiedColumn, matchesWildcardPattern, addUniqueItems } from '../utils/utils.js';
import logger from '../utils/logger.js';

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
 * @param relation
 * @param ignoreRelations
 * @returns True if it is included in the ignore relation, False if it is not.
 */
function isIgnoredRelation(relation: Relation, ignoreRelations: Relation[]): boolean {
  return ignoreRelations.some(ignoreRelation =>
    relation.parentTable === ignoreRelation.parentTable &&
    relation.parentColumn === ignoreRelation.parentColumn &&
    relation.childTable === ignoreRelation.childTable &&
    relation.childColumn === ignoreRelation.childColumn
  );
}

function findRelation(
  schemaMap: DatabaseSchemaMap,
  relationPattern: RelationPattern,
  relations: Relation[],
  ignoreRelations: Relation[]
) {
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

  addUniqueItems(relations, extractRelationsFromChildQualifiedColumns(
    schemaMap,
    relationPattern.childQualifiedColumns || [],
    parentTable,
    parentColumn
  ));

  addUniqueItems(ignoreRelations, extractRelationsFromChildQualifiedColumns(
    schemaMap,
    relationPattern.ignoreChildQualifiedColumns || [],
    parentTable,
    parentColumn
  ));

  ignoreRelations.push({
    parentTable,
    parentColumn,
    childTable: parentTable,
    childColumn: parentColumn
  });
}

function findRelations(
  schemaMap: DatabaseSchemaMap,
  relationDefinitions: RelationDefinitions,
  inferredRelations: RelationPattern[]
): Relation[] {
  const relations: Relation[] = [];
  const ignoreRelations: Relation[] = [];

  inferredRelations.forEach(relationPattern =>
    findRelation(schemaMap, relationPattern, relations, ignoreRelations)
  );

  relationDefinitions.relations?.forEach(relationPattern =>
    findRelation(schemaMap, relationPattern, relations, ignoreRelations)
  );

  return relations.filter(relation => {
    return !isIgnoredRelation(relation, ignoreRelations);
  });
}

export {
  findRelations
};
