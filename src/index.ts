import { Command } from 'commander';
import { getVersion } from './utils/utils.js';
import generateDBML from './commands/relation2dbml.js';

function relation2dbml(args: string[]) {
  const program = new Command();

  program
    .version(getVersion(), '-V, --version', 'Output the current version')
    .description(`Generate DBML directly from database and relation definitions.
      <database-type>     your database format (postgres, mysql, mssql, snowflake, bigquery)
      <connection-string> your database connection string:
        - postgres: 'postgresql://user:password@localhost:5432/dbname?schemas=schema1,schema2,schema3'
        - mysql: 'mysql://user:password@localhost:3306/dbname'
        - mssql: 'Server=localhost,1433;Database=master;User Id=sa;Password=your_password;Encrypt=true;TrustServerCertificate=true;Schemas=schema1,schema2,schema3;'
        - snowflake: 'SERVER=<account_identifier>.<region>;UID=<your_username>;PWD=<your_password>;DATABASE=<your_database>;WAREHOUSE=<your_warehouse>;ROLE=<your_role>;SCHEMAS=schema1,schema2,schema3;'
        - bigquery: /path_to_json_credential.json`)
    .usage('<database-type> <connection> [options]')
    .argument('<database-type>', 'Type of the database (postgres, mysql, etc.)')
    .argument('<connection>', 'Database connection string')
    .option('-o, --out-file <pathspec>', 'Specify the output file path for the generated DBML')
    .option('-i, --input-file <pathspec>', 'Specify the input file path to use for relation definition')
    .option('-v, --verbose', 'Enable verbose logging for debugging purposes');

  program.parse(args);

  generateDBML(program);
}

export {
  relation2dbml
};
