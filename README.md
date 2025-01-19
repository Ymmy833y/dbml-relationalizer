# @ymmy/dbml-relationalizer

`@ymmy/dbml-relationalizer` is a CLI tool that generates **DBML (Database Markup Language)** representations of table relationships based on **database schema information** and **relationship definition files**.

Key Features:
- Automatically generate DBML by fetching schema information from an existing database  
- Allow user-defined relationship additions through a `relations.yml` file  
- Provide an inference feature that infers relationships from table and column names  


## Installation

### Assuming it's published to the npm registry:

```bash
npm install -g @ymmy/dbml-relationalizer
```

### Or, clone the repository and install locally:

```bash
git clone https://github.com/Ymmy833y/dbml-relationalizer.git
cd dbml-relationalizer
npm install
npm run build
npm link  # Global installation
```

After installation, you can use the `relation2dbml` command in your terminal/command line.

---

## Usage

Follow the steps below to generate DBML from a database schema and a custom relationship definition file:

### 1. Create a `relations.yml` file

Refer to [relations.sample.yml](https://github.com/Ymmy833y/dbml-relationalizer/blob/master/relations.sample.yml) for an example (see [Relationship Definition File](#relationship-definition-file-relationsyml) for more details on how to write your own definitions).

### 2. Run the CLI command

For example:
```bash
relation2dbml mysql mysql://user:pass@localhost:3306/dbname -o schema.dbml
```
This connects to the specified MySQL database and processes the schema information along with any relationships defined in `relations.yml`.

### 3. Check the output

- If you specify an output file (e.g., `-o schema.dbml`), the resulting DBML is saved to that file.
- If you do not specify an output file, the DBML is printed to `stdout` (the console).

---

## Options

- `-o, --out-file <pathspec>`: Specify the output file path for the generated DBML. If omitted, the result is printed to stdout.  
- `-v, --verbose`: Set log level to `debug` for more detailed logs.  
- `-i, --input-file <pathspec>`: Specify the path to the relationship definition file (e.g., `relations.yml`). Defaults to `./relations.yml`.

---

## Inference Feature

The **inference** feature looks at **primary keys (PK)** and **unique keys** to guess which tables and columns may be related, and generates inferred relationships in the DBML output.

You can configure this in `relations.yml` like so:

```yaml
inference:
  enabled: true
  strategy: default  # 'default' (e.g., users.id), or 'identical' (e.g., users.user_id)
```

- `enabled`: Set to `true` to enable inference  
- `strategy`:
  - `default`: Uses `pluralize` to get the singular form of table names and looks for `<singularTableName>_<primaryKey>` columns
  - `identical`: Assumes child columns share the same name as the parent column (e.g., parent `users.user_id` → child `%.user_id`)

For instance, if the `users` table has a primary key `id`, the `default` strategy looks for child columns named `user_id`.

---

## Relationship Definition File (`relations.yml`)

If you want to define custom relationships, create a `relations.yml` file with the following structure:

```yaml
inference:
  enabled: true
  strategy: default

relations:
  - parentQualifiedColumn: "users.id"
    childQualifiedColumns:
      - "orders.user_id"
    ignoreChildQualifiedColumns:
      - "some_other_table.user_id"
  - parentQualifiedColumn: "products.id"
    childQualifiedColumns:
      - "orders.product_id"
```

### Fields Description

- `parentQualifiedColumn`: `tableName.columnName` of the parent table  
- `childQualifiedColumns`: A list of child columns to match (wildcard `%` is supported)  
- `ignoreChildQualifiedColumns`: A list of columns to ignore. Useful for excluding certain automatically inferred relationships  

Using this file, the tool will generate DBML relationships from both user-defined and inferred logic.

---

## License

This tool is released under the MIT License. See the [LICENSE](LICENSE) file for details.
