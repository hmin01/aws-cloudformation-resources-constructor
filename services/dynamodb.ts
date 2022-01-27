import { Construct } from "constructs";
// Resources
import { Table } from "../resources/dynamodb";

/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
export function createTables(scope: Construct, config: any) {
  for (const tableName of config) {
    // Get a configuration for table
    const elem: any = config[tableName];
    // Create a table
    new Table(scope, elem);
  }
}