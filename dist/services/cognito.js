"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creaetUserPool = void 0;
// Resources
const cognito_1 = require("../resources/cognito");
// Util
const cache_1 = require("../utils/cache");
function creaetUserPool(scope, config) {
    for (const userPoolId of Object.keys(config)) {
        // Get a configuration for user pool
        const elem = config[userPoolId];
        // Create a user pool
        const userPool = new cognito_1.UserPool(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("userpool", userPoolId, userPool);
        // Configurate the email
        userPool.configurateEmail(elem);
        // Configurate the schema
        userPool.configurateSchema(elem.SchemaAttributes);
        // Add the user pool clients
        for (const client of elem.UserPoolClients) {
            userPool.addClient(client);
        }
    }
}
exports.creaetUserPool = creaetUserPool;
