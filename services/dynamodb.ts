import { Construct } from "constructs";
// Resources
import { Table } from "../resources/dynamodb";
// Util
import { storeResource } from "../utils/cache";

/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
export function createTables(scope: Construct, config: any) {
  for (const tableName of Object.keys(config)) {
    // Get a configuration for table
    const elem: any = config[tableName];
    // Create a table
    const table: Table = new Table(scope, elem);
    // Store the resource
    storeResource("dynamodb", tableName, table);
  }
}