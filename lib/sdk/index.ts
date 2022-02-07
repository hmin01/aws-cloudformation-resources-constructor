// Services (SDK)
import * as SDKDynomoDB from "./services/dynamodb";
import * as SDKLambda from "./services/lambda";
import * as SDKSqs from "./services/sqs";

/** For Util */
/**
 * Destroy the sdk clients
 */
 export function destroySdkClients() {
  SDKDynomoDB.destroyDyanmoDBClient();
  SDKLambda.destroyLambdaClient();
  SDKSqs.destroySqsClient();
}
/**
 * Init the sdk clients
 */
export function initSdkClients() {
  SDKDynomoDB.initDynamoDBClient();
  SDKLambda.initLambdaClient();
  SDKSqs.initSqsClient();
}

/** For Lambda */
/**
 * Create the versions and aliases for lambda
 * @param config configuration for versions and aliases for lambda
 */
 export async function createLambdaVersionsAndAliases(config: any): Promise<void> {
  // Update function code and publish versions
  for (const elem of config.Versions) {
    await SDKLambda.publishVersion(elem);
  }
  // Create the aliases
  for (const elem of config.Aliases) {
    await SDKLambda.createAlias(elem);
  }
}
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
 export async function setEventSourceMappings(config: any): Promise<void> {
  for (const mappingId of Object.keys(config)) {
    await SDKLambda.setEventSourceMapping(config[mappingId]);
  }
}