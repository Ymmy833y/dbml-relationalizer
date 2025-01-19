# @ymmy/dbml-relationalizer

`@ymmy/dbml-relationalizer` is a CLI tool that generates **DBML (Database Markup Language)** representations of table relationships based on **database schema information** and **relationship definition files**.

Key Features:
- Automatically generate DBML by fetching schema information from an existing database  
- Allow user-defined relationship additions through a `relations.yml` file  
- Provide an inference feature that infers relationships from table and column names  

---

## Installation

### From npm (recommended)

```bash
npm install -g @ymmy/dbml-relationalizer
```

### Or, clone the repository and install locally

```bash
git clone https://github.com/Ymmy833y/dbml-relationalizer.git
cd dbml-relationalizer
npm install
npm run build
npm link  # Global installation
```

After installation, you can use the `relation2dbml` command in your terminal or command line.

---

## Usage

Follow the steps below to generate DBML from a database schema and a custom relationship definition file:

### 1. Create a `relations.yml` file

Refer to [relations.sample.yml](https://github.com/Ymmy833y/dbml-relationalizer/blob/master/relations.sample.yml) for an example. For more details on how to write your own definitions, see [Relationship Definition File](#relationship-definition-file-relationsyml).

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
      
ignoreSelfReferences: false
```

### Inference Feature

The **inference** feature looks at **primary keys (PK)** and **unique keys** to guess which tables and columns may be related, and generates inferred relationships in the DBML output. You can configure this in `relations.yml` under the `inference` section:

```yaml
inference:
  enabled: true
  strategy: default  # 'default' (e.g., users.id), or 'identical' (e.g., users.user_id)
```

- `enabled` (boolean):  
  Set to `true` to enable inference.  

- `strategy` (string):
  - `default`: Uses `pluralize` to get the singular form of table names and looks for `<singularTableName>_<primaryKey>` columns (e.g., for `users.id`, look for `user_id`).  
  - `identical`: Assumes child columns share the same name as the parent column (e.g., if the parent is `users.user_id`, the child is also `%.user_id`).  

### Defining Relationships Manually

Within the relations block, you can define relationships manually:

- `parentQualifiedColumn` (Required): Specifies the parent table’s column (wildcards not supported).
- `childQualifiedColumns` (Optional): Specifies the child table’s columns (% wildcard supported).
- `ignoreChildQualifiedColumns` (Optional): Specifies any child columns to exclude (% wildcard supported).

When entering values, please use the **`tableName.columnName`** format.

#### Wildcard Examples

- `%.item_id`: Matches any `item_id` column in all tables (e.g., `foo.item_id`)  
- `%.order_%date`: Matches any column in all tables that starts with `order_` and ends with `date` (e.g., `foo.order_created_date`, `foo.order_date`)

---

### About Self-Referencing Relationships

Although rare, **self-referencing** relationships are also supported.

- By default, `ignoreSelfReferences` is set to `true`, so self-referencing relationships are excluded without additional configuration.  
- To include self-referencing relationships, set `ignoreSelfReferences: false`.

#### Example of Self-Referencing

When `ignoreSelfReferences: false` is specified, a self-referencing relationship such as the following may be generated:
```dbml
Ref "infer_fk_user_user_user_id":"user"."user_id" < "user"."user_id"
```

---

## License

This tool is released under the MIT License. See the [LICENSE](LICENSE) file for details.
