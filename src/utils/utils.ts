import { readFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { CommandOptions } from '../types.js';
import logger from './logger.js';

const regexCache: Record<string, RegExp> = {};

function getVersion(): string {
  const packageJsonPath = join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function getCommandOpt(program: Command): {
  databaseType: string;
  connection: string;
  options: CommandOptions;
} {
  const [databaseType, connection] = program.args;
  const options = program.opts<CommandOptions>();

  if (!databaseType || !connection) {
    throw new Error('Database type and connection string are required.');
  }

  if (options.verbose) logger.level = 'debug';
  logger.debug('Verbose mode enabled');
  logger.debug(`Database Type: ${databaseType}, Connection: ${connection}, Options: ${JSON.stringify(options)}`);

  return { databaseType, connection, options };
}

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

export {
  getVersion,
  getCommandOpt,
  splitQualifiedColumn,
  matchesWildcardPattern
};
