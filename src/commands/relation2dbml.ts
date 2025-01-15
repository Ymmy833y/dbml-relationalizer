import { Command } from 'commander';
import { loadRelationDefinitions, fetchSchema, generateInferredRelationPattern, findRelations, generate } from '../services/index.js';
import { DatabaseSchemaJson, DatabaseSchemaMap } from '../types.js';
import { getVersion, getCommandOpt } from '../utils/utils.js';
import logger from '../utils/logger.js';

export default async function generateDBML(
  program: Command
): Promise<void> {
  try {
    logger.info(`Starting relation2dbml script (Version: ${getVersion()})`);
    const { databaseType, connection, options } = getCommandOpt(program);

    const relationDefinitions = loadRelationDefinitions(options.inputFile);

    const schemaJson = await fetchSchema(databaseType, connection);
    const schemaMap = convertToSchemaMap(schemaJson);

    const inferredRelations = generateInferredRelationPattern(schemaMap, relationDefinitions.inference);

    const relations = findRelations(schemaMap, relationDefinitions, inferredRelations);

    generate(schemaJson, relations, options.outFile);
    logger.info('DBML generation completed successfully.');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`${error.name}: ${error.message}`);
      logger.debug(`Stack trace: ${error.stack}`);
    } else {
      logger.error(`Unexpected error: ${String(error)}`);
    }
    process.exit(1);
  }
}

function convertToSchemaMap(schemaJson: DatabaseSchemaJson): DatabaseSchemaMap {
  const schemaMap: DatabaseSchemaMap = {};

  for (const [_, tableValue] of Object.entries(schemaJson.tables)) {
    const table = tableValue.name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns = schemaJson.fields[table]?.map((field: any) => field.name) || [];
    const constraints = schemaJson.tableConstraints[table] || {};
    const primaryKeys = Object.entries(constraints)
      .filter(([_, constraint]) => constraint.pk)
      .map(([column, _]) => column);
    const uniqueKeys = Object.entries(constraints)
      .filter(([_, constraint]) => constraint.unique)
      .map(([column, _]) => column);

    schemaMap[table] = { columns, primaryKeys, uniqueKeys };
  };
  return schemaMap;
}
