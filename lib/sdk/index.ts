import { join } from "path";
// Services (SDK)
import * as SDKCognito from "./services/cognito";
// Services (SDK) - new
import { APIGatewaySdk } from "./services/apigateway";
import { LambdaSdk } from "./services/lambda";
// Utile
import { extractDataFromArn } from "../utils/util";

// Set the directory for stored lambda function codes
const CODE_DIR: string = join(__dirname, "../../resources/code");

/** For Util */
/**
 * Destroy the sdk clients
 */
export function destroySdkClients() {
  SDKCognito.destroyCognitoClient();
}
/**
 * Init the sdk clients
 */
export function initSdkClients() {
  SDKCognito.initCognitoClient();
}

/** For APIGateway */
/**
 * Configure the methods in rest api
 * @param restApiName rest api name
 * @param config configuration for methods
 */
export async function configureAPIGatewayMethods(restApiName: string, config: any[]): Promise<void> {
  // Create a sdk object for amazon apigateway
  const apigateway: APIGatewaySdk = new APIGatewaySdk({ region: process.env.REGION });

  // Get a rest api id
  const restApiId: string = await apigateway.getRestApiId(restApiName);
  // Catch error
  if (restApiId === "") {
    console.error(`[ERROR] Not found rest api id (target: ${restApiName})`);
    process.exit(47);
  }

  // Configure the methods
  for (const elem of config) {
    // Get a resource id
    const resourceId: string = await apigateway.getResouceId(restApiId, elem.path);
    // Catch error
    if (resourceId === "") {
      console.error(`[ERROR] Not found resource id (taget ${elem.path})`);
      break;
    }
    // Configure a method
    if (elem.resourceMethods) {
      for (const method of Object.keys(elem.resourceMethods)) {
        // Extrac the configurations
        const configForIntegration: any = elem.resourceMethods[method].methodIntegration;
        const configForResponse: any = elem.resourceMethods[method].methodResponses;
        // Put a method integration
        if (configForIntegration) {
          await apigateway.putMethodIntegration(restApiId, resourceId, method, configForIntegration);
        }
        // Put a method response
        if (configForResponse) {
          await apigateway.putMethodResponses(restApiId, resourceId, method, configForResponse);
        }
        // Put a method integration response
        if (configForIntegration && configForIntegration.integrationResponses) {
          await apigateway.putMethodIntegrationResponses(restApiId, resourceId, method, configForIntegration !== undefined ? configForIntegration.integrationResponses : undefined);
        }
        // Print console
        console.info(`[NOTICE] Put the method (for ${method} ${elem.path})`);
      }
    }
  }

  // Destroy a sdk object for amazon apigateway
  apigateway.destroy();
}
/**
 * Deploy a stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
export async function deployAPIGatewayStage(restApiName: string, config: any[]): Promise<void> {
  // Create a sdk object for amazon apigateway
  const apigateway: APIGatewaySdk = new APIGatewaySdk({ region: process.env.REGION });

  // Get a rest api id
  const restApiId: string = await apigateway.getRestApiId(restApiName);
  // Catch error
  if (restApiId === "") {
    console.error(`[ERROR] Not found rest api id (target: ${restApiName})`);
    process.exit(47);
  }

  // Create the deployments and stages
  for (const elem of config) {
    // Create a deployment
    const deployment: string = await apigateway.createDeployment(restApiId);
    // Create a stage
    await apigateway.createStage(restApiId, deployment, elem);
    // Print message
    console.info(`[NOTICE] Deploy the stage (for ${restApiName})`);
  }

  // Destroy a sdk object for amazon apigateway
  apigateway.destroy();
}


/** For Cognito */
/**
 * Set a cognito user pool configuration
 * @param name user pool name
 * @param config configuration for user pool
 */
export async function setCognitoUserPool(name: string, config: any) {
  // Create an sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.REGION });

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
      const lambdaArn: string = await lambda.getFunctionArn(functionName, qualifier);
      // Set the lambda configuration
      if (lambdaArn !== "") {
        lambdaConfig[key] = lambdaArn;
      }
    }
    // Update
    await SDKCognito.updateLambdaConfiguration(userPoolId, lambdaConfig);
    console.info(`[NOTICE] Set the lambda configuration for user pool (for ${name})`);
  }

  // Destroy an sdk object for lambda
  lambda.destroy();
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
 * Create the lambda function aliases
 * @param functionName function name
 * @param config configuration for aliases
 * @param mapVersion mapping data for version
 */
export async function createAliases(functionName: string, config: any, mapVersion?: any): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.REGION });

  // Create the lambda function aliases
  for (const elem of config) {
    // Set a function version
    const functionVersion: string = mapVersion ? mapVersion[elem.FunctionVersion] : elem.FunctionVersion;
    // Create the alias for function
    await lambda.createAlias(functionName, functionVersion, elem.Name, elem.Description !== "" ? elem.Description : undefined);
  }

  // Destroy a sdk object for lambda
  lambda.destroy();
}
/**
 * Create the event source mappings
 * @param config configuration for event source mappings
 */
export async function createEventSourceMappings(config: any): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.REGION });

  // Create the event source mappings
  for (const mappingId of Object.keys(config)) {
    await lambda.createEventSourceMapping(config[mappingId]);
  }

  // Destroy a sdk object for lambda
  lambda.destroy();
}
/**
 * Publish the lambda function versions
 * @param functionName function name
 * @param config configuration for versions
 * @returns mapping data for version
 */
export async function publishLambdaVersions(functionName: string, config: any): Promise<any> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.REGION });
  // Set a version mapping data
  const mapVersion: any = {};

  // Publish the lambda function versions
  for (const elem of config) {
    if (elem.Version !== "$LATEST" && elem.StoredLocation && new RegExp("^s3://").test(elem.StoredLocation)) {
      // Extract a file name from s3 url
      const temp:string = elem.StoredLocation.replace(/^s3:\/\//, "").split("/").slice(1).join("/").split("/");
      const filename: string = temp[temp.length - 1];
      // Update the function code
      await lambda.updateCode(functionName, join(CODE_DIR, filename));
      // Publish the version
      const version = await lambda.publishVersion(functionName, elem.Description);
      // Mapping version
      mapVersion[elem.Version] = version;
    }
  }

  // Destroy a sdk object for lambda
  lambda.destroy();
  // Return
  return mapVersion;
}