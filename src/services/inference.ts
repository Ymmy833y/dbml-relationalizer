import pluralize from 'pluralize';
import { RelationPattern, InferenceDefinitions, InferenceStrategy, DatabaseSchemaMap } from '../types.js';
import logger from '../utils/logger.js';

/**
 * Generates a qualified column pattern for child tables based on the inference strategy.
 */
function getChildQualifiedColumnPattern(
  table: string,
  primaryKey: string,
  strategy: InferenceStrategy = 'default',
): string {
  if (strategy === 'identical') {
    return `%.${primaryKey}`;
  }
  return `%.${pluralize.singular(table)}_${primaryKey}`;
}

/**
 * Processes a list of keys (primary or unique) and generates inferred relation patterns.
 */
function processKeys(
  table: string,
  keys: string[],
  inference: InferenceDefinitions,
  inferredRelationPatterns: RelationPattern[]
) {
  keys.forEach(key => {
    const childQualifiedColumns = getChildQualifiedColumnPattern(table, key, inference.strategy);

    inferredRelationPatterns.push({
      parentQualifiedColumn: `${table}.${key}`,
      childQualifiedColumns: [childQualifiedColumns],
    });
  });
}

/**
 * Generates inferred relation patterns between parent and child tables.
 * @param schemaMap - The schema map of the database.
 * @param inference - The inference definitions for generating patterns.
 * @returns A list of inferred relation patterns.
 */
function generateInferredRelationPattern(
  schemaMap: DatabaseSchemaMap,
  inference: InferenceDefinitions
): RelationPattern[] {
  if (!inference.enabled) {
    logger.debug('Implicit relationship inference is disabled.');
    return [];
  }

  const inferredRelationPatterns: RelationPattern[] = [];
  for (const [table, tableSchema] of Object.entries(schemaMap)) {
    processKeys(table, tableSchema.primaryKeys, inference, inferredRelationPatterns);
    processKeys(table, tableSchema.uniqueKeys, inference, inferredRelationPatterns);
  }

  logger.debug(`Inferred Relation were generated successfully. Inferred Relation Pattern: ${JSON.stringify(inferredRelationPatterns)}`);
  return inferredRelationPatterns;
}

export {
  generateInferredRelationPattern
};
