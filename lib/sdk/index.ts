// Services (SDK)
import * as SDKAPIGateway from "./services/apigateway";
import * as SDKDynomoDB from "./services/dynamodb";
import * as SDKLambda from "./services/lambda";
import * as SDKSqs from "./services/sqs";

/** For Util */
/**
 * Destroy the sdk clients
 */
export function destroySdkClients() {
  SDKAPIGateway.destroyAPIGatewayClient();
  SDKDynomoDB.destroyDyanmoDBClient();
  SDKLambda.destroyLambdaClient();
  SDKSqs.destroySqsClient();
}
/**
 * Init the sdk clients
 */
export function initSdkClients() {
  SDKAPIGateway.initAPIGatewayClient();
  SDKDynomoDB.initDynamoDBClient();
  SDKLambda.initLambdaClient();
  SDKSqs.initSqsClient();
}

/** For APIGateway */
/**
 * Set the method integrations
 * @param name api name
 * @param config configuration for api
 */
export async function setAPIGatewayMethodIntegrations(name: string, config: any[]): Promise<void> {
  for (const elem of config) {
    if (elem.resourceMethods !== undefined) {
      for (const method of Object.keys(elem.resourceMethods)) {
        if (elem.resourceMethods[method].methodIntegration !== undefined) {
          await SDKAPIGateway.putMethodIntegration(name, elem.path, method, elem.resourceMethods[method].methodIntegration);
        }
      }
    } 
  }
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