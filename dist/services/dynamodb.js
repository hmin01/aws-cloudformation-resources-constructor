"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = void 0;
// Resources
const dynamodb_1 = require("../resources/dynamodb");
// Util
const cache_1 = require("../utils/cache");
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
function createTables(scope, config) {
    for (const tableName of Object.keys(config)) {
        // Get a configuration for table
        const elem = config[tableName];
        // Create a table
        const table = new dynamodb_1.Table(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("dynamodb", tableName, table);
    }
}
exports.createTables = createTables;
