// Services (SDK)
import * as SDKAPIGateway from "./services/apigateway";
import * as SDKCognito from "./services/cognito";
import * as SDKDynomoDB from "./services/dynamodb";
import * as SDKLambda from "./services/lambda";
import * as SDKSqs from "./services/sqs";
// Utile
import { extractDataFromArn } from "../utils/util";

/** For Util */
/**
 * Destroy the sdk clients
 */
export function destroySdkClients() {
  SDKAPIGateway.destroyAPIGatewayClient();
  SDKCognito.destroyCognitoClient();
  SDKDynomoDB.destroyDyanmoDBClient();
  SDKLambda.destroyLambdaClient();
  SDKSqs.destroySqsClient();
}
/**
 * Init the sdk clients
 */
export function initSdkClients() {
  SDKAPIGateway.initAPIGatewayClient();
  SDKCognito.initCognitoClient();
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

/** For Cognito */
/**
 * Set a cognito user pool configuration
 * @param name user pool name
 * @param config configuration for user pool
 */
export async function setCognitoUserPool(name: string, config: any) {
  // Get a user pool id for name
  const userPoolId: string = await SDKCognito.getUserPoolId(name);
  if (userPoolId === "") {
    console.error(`[ERROR] Not found user pool id (for ${name})`);
    process.exit(1);
  }

  // // Create the user pool custom domain
  // await SDKCognito.createUserPoolDomain(userPoolId, config.CustomDomainDescription.Domain, config.CustomDomainDescription.CustomDomainConfig.CertificateArn);
  console.info(`[NOTICE] Set the custom domain for user pool (for ${name})`);

  // Set the MFA configuration
  if (config.MFAConfig) {
    await SDKCognito.setMfaConfiguration(userPoolId, config.MFAConfig, undefined, undefined);
    console.info(`[NOTICE] Set the MFA configuration for user pool (for ${name})`);
  }
  // Update the email configuration
  if (config.EmailConfiguration) {
    // Copy the configuration
    const emailConfig: any = JSON.parse(JSON.stringify(config.EmailConfiguration));
    // Re-processing
    if (emailConfig.EmailSendingAccount !== undefined && emailConfig.EmailSendingAccount === "DEVELOPER") {
      // Get and set arn (for sns)
    }
    // Update
    await SDKCognito.updateEmailConfiguration(userPoolId, emailConfig);
    console.info(`[NOTICE] Update the email configuration for user pool (for ${name})`);
  }
  // Update the lambda configuration
  if (config.LambdaConfig) {
    // Copy the configuration
    const lambdaConfig: any = JSON.parse(JSON.stringify(config.LambdaConfig));
    // Re-processing
    for (const key of Object.keys(lambdaConfig)) {
      // Extract a function name and qualifier
      const functionName: string = extractDataFromArn(lambdaConfig[key], "resource");
      const qualifier: string = extractDataFromArn(lambdaConfig[key], "qualifier");
      // Get a lambda arn
      const lambdaArn: string = await SDKLambda.getLambdaFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
      // Set the lambda configuration
      if (lambdaArn !== "") {
        lambdaConfig[key] = lambdaArn;
      }
    }
    // Update
    await SDKCognito.updateLambdaConfiguration(userPoolId, lambdaConfig);
    console.info(`[NOTICE] Set the lambda configuration for user pool (for ${name})`);
  }
}
/**
 * Create the cognito user pool clients
 * @param name user pool name
 * @param config configuration for user pool clients
 */
export async function createCognitoUserPoolClients(name: string, clientConfigs: any[], uiConfigs: any[]): Promise<void> {
  // Get a user pool id for name
  const userPoolId: string = await SDKCognito.getUserPoolId(name);
  if (userPoolId === "") {
    console.error(`[ERROR] Not found user pool id (for ${name})`);
    process.exit(1);
  }

  // Create the user pool clients
  for (const elem of clientConfigs) {
    // Extract the ui customization data
    let uiData: any = undefined;
    for (const data of uiConfigs) {
      if (data.ClientId === elem.ClientId) {
        uiData = data;
        break;
      }
    } 
    // Create the user pool client
    const clientId: string = await SDKCognito.createUserPoolClient(userPoolId, elem);
    // Set the ui customization
    if (clientId && uiData) {
      await SDKCognito.setUICustomization(userPoolId, clientId, uiData);
    }
    // Print message
    console.info(`[NOTICE] Create the user pool client (for ${elem.ClientName})`);
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