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
/** For APIGateway */
/**
 * Set the method integrations
 * @param name api name
 * @param config configuration for api
 */
export async function setAPIGatewayMethods(name: string, config: any[]): Promise<void> {
  // Get an api id
  const restApiId: string = await SDKAPIGateway.getRestApiId(name);
  if (restApiId === "") {
    console.error(`[ERROR] Not found api id (for ${name})`);
    process.exit(1);
  }
  // Set the methods
  for (const elem of config) {
    // Get a resource id
    const resourceId: string = await SDKAPIGateway.getResourceId(restApiId, elem.path);
    if (resourceId === "") {
      console.error(`[ERROR] Not found resource id (for ${elem.path})`);
      break;
    }
    // Set a method
    if (elem.resourceMethods !== undefined) {
      for (const method of Object.keys(elem.resourceMethods)) {
        const configForIntegration: any = elem.resourceMethods[method].methodIntegration;
        const configForResponse: any = elem.resourceMethods[method].methodResponses;
        // Put the method integration
        await SDKAPIGateway.putMethodIntegration(restApiId, resourceId, method, configForIntegration);
        // Put the method response
        await SDKAPIGateway.putMethodResponse(restApiId, resourceId, method, configForResponse);
        // Put the method integration response
        await SDKAPIGateway.putMethodIntegrationResponse(restApiId, resourceId, method, configForIntegration !== undefined ? configForIntegration.integrationResponses : undefined);
        // Print console
        console.info(`[NOTICE] Put the method (for ${method} ${elem.path})`);
      }
    } 
  }
}
/**
 * Deploy the API Gateway stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
export async function deployAPIGatewayStage(name: string, config: any[]): Promise<void> {
  // Get an api id
  const restApiId: string = await SDKAPIGateway.getRestApiId(name);
  if (restApiId === "") {
    console.error(`[ERROR] Not found api id (for ${name})`);
    process.exit(1);
  }
  // Process
  for (const elem of config) {
    // Create the deployment
    const deployment: string = await SDKAPIGateway.createDeployment(restApiId);
    // Create the stage
    await SDKAPIGateway.createStage(restApiId, deployment, elem);
    // Print message
    console.info(`[NOTICE] Deploy the stage (for ${name})`);
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