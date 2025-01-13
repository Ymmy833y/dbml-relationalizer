import { readFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { CommandOptions } from '../types.js';
import logger from './logger.js';

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

export {
  getVersion,
  getCommandOpt
};
