import { Construct } from "constructs";
// Resources
import { Function } from "../resources/lambda";

/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
export function createLambdaFunctions(scope: Construct, config: any) {
  for (const functionName of Object.keys(config)) {
    // Get a configuration for function
    const elem: any = config[functionName];

    let alias: any = null;
    let version: any = null;
    let storedLocation: any = null;
    // Extract the most recent version number
    for (const obj of elem.Versions) {
      obj.Version !== "$LATEST" && Number(version.Version) < Number(obj.Version) ? version = obj : null;
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
    const lambdaFunction = new Function(scope, elem.Configuration, storedLocation);
    // If there's a recent version
    if (version !== null) {
      // Create a version
      lambdaFunction.createVersion(version)
      // Create an alias
      lambdaFunction.createAlias(alias);
    }
  }
}