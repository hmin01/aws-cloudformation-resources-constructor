import { Construct } from "constructs";
// Resources
import { Function } from "../resources/lambda";
// Util
import { getResource, storeResource } from "../utils/cache";
import { extractDataFromArn } from "../utils/util";

/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
export function createLambdaFunctions(scope: Construct, config: any): void {
  for (const functionName of Object.keys(config)) {
    // Get a configuration for function
    const elem: any = config[functionName];

    let alias: any = null;
    let version: any = null;
    let storedLocation: any = null;
    // Extract the most recent version number
    for (const obj of elem.Versions) {
      if (version === null && obj.Version !== "$LATEST") {
        version = obj;
      } else {
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
    } else {
      storedLocation = elem.StoredLocation;
    }

    // Create a function
    const lambdaFunction: Function = new Function(scope, elem.Configuration, storedLocation);
    // Store the resource
    storeResource("lambda", elem.Configuration.FunctionName, lambdaFunction);
    // If there's a recent version
    if (version !== null) {
      // Create a version
      lambdaFunction.createVersion(version)
      // Create an alias
      lambdaFunction.createAlias(alias);
    }
  }
}

/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
export function setEventSourceMappings(config: any): void {
  for (const eventSourceMappingId of Object.keys(config)) {
    // Get a configuration for event source mapping
    const elem: any = config[eventSourceMappingId];
    // Get a function
    const lambdaFunction = getResource("lambda", extractDataFromArn(elem.FunctionArn, "resource"));
    // Set the event source mapping
    lambdaFunction.setEventSourceMapping(elem);
  }
}