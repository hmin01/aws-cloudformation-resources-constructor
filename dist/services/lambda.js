"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEventSourceMappings = exports.createLambdaFunctions = void 0;
// Resources
const lambda_1 = require("../resources/lambda");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
function createLambdaFunctions(scope, config) {
    for (const functionName of Object.keys(config)) {
        // Get a configuration for function
        const elem = config[functionName];
        let alias = null;
        let version = null;
        let storedLocation = null;
        // Extract the most recent version number
        for (const obj of elem.Versions) {
            if (version === null && obj.Version !== "$LATEST") {
                version = obj;
            }
            else {
                obj.Version !== "$LATEST" && Number(version.Version) < Number(obj.Version) ? version = obj : null;
            }
        }
        // Extract a configuration for alias that refer to the version
        if (version !== null) {
            for (const obj of elem.Aliases) {
                if (Number(obj.FunctionVersion) === Number(version.Version)) {
                    alias = obj;
                    break;
                }
            }
        }
        // Set a code for function
        if (version !== null) {
            storedLocation = version.StoredLocation;
        }
        else {
            storedLocation = elem.StoredLocation;
        }
        // Create a function
        const lambdaFunction = new lambda_1.Function(scope, elem.Configuration, storedLocation);
        // Store the resource
        (0, cache_1.storeResource)("lambda", elem.Configuration.FunctionName, lambdaFunction);
        // If there's a recent version
        if (version !== null) {
            // Create a version
            const functionVersion = lambdaFunction.createVersion(version);
            // Create an alias
            lambdaFunction.createAlias(alias, functionVersion);
        }
    }
}
exports.createLambdaFunctions = createLambdaFunctions;
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
function setEventSourceMappings(config) {
    for (const eventSourceMappingId of Object.keys(config)) {
        // Get a configuration for event source mapping
        const elem = config[eventSourceMappingId];
        // Get a function
        const lambdaFunction = (0, cache_1.getResource)("lambda", (0, util_1.extractDataFromArn)(elem.FunctionArn, "resource"));
        // Set the event source mapping
        lambdaFunction.setEventSourceMapping(elem);
    }
}
exports.setEventSourceMappings = setEventSourceMappings;
