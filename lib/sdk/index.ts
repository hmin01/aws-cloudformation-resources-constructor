import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
// Responses
import { CODE, catchError } from "../models/response";
// Services (SDK) - new
import { APIGatewaySdk } from "./services/apigateway";
import { CognitoSdk } from "./services/cognito";
import { LambdaSdk } from "./services/lambda";
import { S3Object, S3Sdk } from "./services/s3";
import { STSSdk } from "./services/sts";
// Util
import { extractDataFromArn } from "../utils/util";

// Set the directory for stored lambda function codes
const CODE_DIR: string = join(__dirname, "../../resources/code");

// /** For APIGateway */
/**
 * Configure the authorizers
 * @param restApiName rest api name
 * @param config configuration for authorizers
 * @returns mapping data for authorizer 
 */
export async function configeAPIGatewayAuthorizers(restApiName: string, config: any[]): Promise<any> {
  // Create a sdk object for amazon apigateway
  const apigateway: APIGatewaySdk = new APIGatewaySdk({ region: process.env.TARGET_REGION });

  // Get a rest api id
  const restApiId: string = await apigateway.getRestApiId(restApiName);
  // Catch error
  if (restApiId === "") {
    catchError(CODE.ERROR.COMMON.NOT_FOUND_ID, true, restApiName);
  }

  // Create a sdk object for amazon sts
  const sts: STSSdk = new STSSdk({ region: process.env.TARGET_REGION });
  // Get a credentials for origin account
  let credentials: any = undefined;
  if (process.env.ASSUME_ROLE_ARN) {
    credentials = await sts.assumeRole("describeOriginAccountServices", process.env.ASSUME_ROLE_ARN);
  }
  // Destory a sdk object for amazon sts
  sts.destroy();

  // Create a sdk object for amazon cognito
  const cognito: CognitoSdk = new CognitoSdk({ region: process.env.TARGET_REGION });
  // Create a sdk object for aws lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });

  // Set a mapping data for authorizer
  const mapping: any = {};
  // Create the authorizers
  for (const elem of config) {
    // Copy a configuration for authorizer
    const authConfig: any = JSON.parse(JSON.stringify(elem));
    // Extract an authorizer uri or provider arns by auth type
    if (authConfig.type.includes("COGNITO")) {
      if (authConfig.providerARNs) {
        const providerARNs: string[] = [];
        for (const arn of authConfig.providerARNs) {
          if (credentials) {
            // Extract a region from arn
            const region: string = extractDataFromArn(arn, "region");
            // Create a params for sdk client
            const params: any = {
              credentials: credentials,
              region: region
            };
            
            // Create a sdk object for amazon cognito (temporary)
            const tempCognito: CognitoSdk = new CognitoSdk(params);
            // Extract a user pool id
            const prevUserPoolId: string = extractDataFromArn(arn, "resource");
            if (prevUserPoolId === "") {
              catchError(CODE.ERROR.COMMON.NOT_FOUND_ID, true, arn);
            }
            // Get a user pool name
            const userPoolName: string = await tempCognito.getUserPoolName(prevUserPoolId);
            if (userPoolName === "") {
              catchError(CODE.ERROR.COMMON.NOT_FOUND_NAME, true, prevUserPoolId);
            }
            // Get a user pool id
            const userPoolId: string = await cognito.getUserPoolId(userPoolName);
            if (userPoolId === "") {
              catchError(CODE.ERROR.COMMON.NOT_FOUND_ID, true, userPoolName);
            }
            // Get a user pool arn
            let userPoolArn: string = await cognito.getUserPoolArn(userPoolId);
            if (userPoolArn === "") {
              catchError(CODE.ERROR.COMMON.NOT_FOUND_ID, false, userPoolId);
              // Set a previouse user pool arn
              userPoolArn = arn;
            }
            // Set a provider arns
            providerARNs.push(userPoolArn);
            // Destroy a sdk object for amazon cognito (temporary)
            tempCognito.destroy();
          } else {
            providerARNs.push(arn);
          }
        }
        // Set a provider arns
        authConfig.providerARNs = providerARNs.length > 0 ? providerARNs : undefined;
      }
    } else {
      // Extract a lambda function name and qualifier(version or alias) from arn
      const functionName: string = extractDataFromArn(authConfig.authorizerUri, "resource");
      const qualifier: string = extractDataFromArn(authConfig.authorizerUri, "qualifier");
      // Get a function arn
      const functionArn: string = await lambda.getFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
      // Set a authorizer uri
      if (functionArn !== "") {
        authConfig.authorizerUri = `arn:aws:apigateway:${process.env.TARGET_REGION}:lambda:path/2015-03-31/functions/${functionArn}/invocations`;
      }
    }
    // Create an authorizer
    mapping[elem.id] = await apigateway.createAuthorizer(restApiId, authConfig);
  }

  // Destroy a sdk object for amazon apigateway, amazon cognito, aws lambda
  apigateway.destroy();
  cognito.destroy();
  lambda.destroy();
  // Return
  return mapping;
}
/**
 * Configure the methods in rest api
 * @param restApiName rest api name
 * @param config configuration for methods
 */
export async function configureAPIGatewayMethods(restApiName: string, config: any[], authMapping?: any): Promise<void> {
  // Create a sdk object for amazon apigateway
  const apigateway: APIGatewaySdk = new APIGatewaySdk({ region: process.env.TARGET_REGION });

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
        // Extract a configuration for method
        const methodConfig: any = elem.resourceMethods[method];
        // Extrac the configurations
        const configForIntegration: any = methodConfig.methodIntegration;
        const configForResponse: any = methodConfig.methodResponses;
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
        // Update a method to add an authorizer
        if (authMapping && authMapping[methodConfig.authorizerId]) {
          // Set a authorizer id
          methodConfig.authorizerId = authMapping[methodConfig.authorizerId]
          // Add an authorization options for method
          await apigateway.addAuthorizerForMethod(restApiId, resourceId, method, methodConfig);
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
  const apigateway: APIGatewaySdk = new APIGatewaySdk({ region: process.env.TARGET_REGION });

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
export async function setCognitoUserPool(name: string, config: any): Promise<void> {
  // Creaet a sdk object for cognito
  const cognito: CognitoSdk = new CognitoSdk({ region: process.env.TARGET_REGION });

  // Get a user pool id for name
  const userPoolId: string = await cognito.getUserPoolId(name);
  if (userPoolId === "") {
    console.error(`[ERROR] Not found a user pool id (for ${name})`);
    process.exit(55);
  }

  // Set a MFA configuration
  if (config.MFAConfig) {
    await cognito.setMFAConfiguration(userPoolId, config.MFAConfig);
    console.info(`[NOTICE] Set the MFA configuration for user pool (for ${name})`);
  }
  // Update a email configuration
  if (config.EmailConfiguration) {
    // Copy a configuration
    const emailConfig: any = JSON.parse(JSON.stringify(config.EmailConfiguration));
    // Re-processing
    if (emailConfig.EmailSendingAccount !== undefined && emailConfig.EmailSendingAccount === "DEVELOPER") {
      // Get and set arn (for sns)
    }
    // Update a email configuration
    await cognito.updateEmailConfiguration(userPoolId, emailConfig);
    console.info(`[NOTICE] Update the email configuration for user pool (for ${name})`);
  }
  // Update a lambda configuration
  if (config.LambdaConfig) {
    await cognito.updateLambdaConfiguration(userPoolId, config.LambdaConfig);
    console.info(`[NOTICE] Set the lambda configuration for user pool (for ${name})`);
  }
  
  // Destory a sdk object for cognito
  cognito.destroy();
}
/**
 * Create the cognito user pool clients
 * @param name user pool name
 * @param config configuration for user pool clients
 */
export async function createCognitoUserPoolClients(name: string, clientConfigs: any[], uiConfigs?: any[]): Promise<void> {
  // Creaet a sdk object for cognito
  const cognito: CognitoSdk = new CognitoSdk({ region: process.env.TARGET_REGION });

  // Get a user pool id for name
  const userPoolId: string = await cognito.getUserPoolId(name);
  if (userPoolId === "") {
    console.error(`[ERROR] Not found a user pool id (for ${name})`);
    process.exit(55);
  }

  // Create the user pool clients
  for (const elem of clientConfigs) {
    // Create a user pool client
    const clientId: string = await cognito.createUserPoolClient(userPoolId, elem);
    // Set a ui customization
    if (clientId && uiConfigs) {
      // Extract the ui customization data
      let uiData: any = undefined;
      for (const data of uiConfigs) {
        if (data.ClientId === elem.ClientId) {
          await cognito.setUICustomization(userPoolId, clientId, uiData);
          break;
        }
      }
    }
    // Print message
    console.info(`[NOTICE] Create the user pool client (for ${elem.ClientName})`);
  }

  // Destory a sdk object for cognito
  cognito.destroy();
}

/** For Lambda */
/**
 * Create a lambda function alias
 * @param functionName function name
 * @param functionVersion function version
 * @param name name for alias
 * @param description alias description
 */
export async function createLambdaAlias(functionName: string, functionVersion: string, name: string, description?: string): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
  // Create the alias for function
  await lambda.createAlias(functionName, functionVersion, name, description);
  // Destroy a sdk object for lambda
  lambda.destroy();
}
/**
 * Create the lambda function aliases
 * @param functionName function name
 * @param config configuration for aliases
 * @param mapVersion mapping data for version
 */
export async function createLambdaAliases(functionName: string, config: any, mapVersion?: any): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
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
 * Create an event source mapping
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/createeventsourcemappingcommandinput.html
 * @param config configuration for event source mapping
 */
export async function createLambdaEventSourceMapping(config: any): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
  // Create the event source mapping
  await lambda.createEventSourceMapping(config);
  // Destroy a sdk object for lambda
  lambda.destroy();
}
/**
 * Create the event source mappings
 * @param config configuration for event source mappings
 */
export async function createLambdaEventSourceMappings(config: any): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
  // Create the event source mappings
  for (const mappingId of Object.keys(config)) {
    await lambda.createEventSourceMapping(config[mappingId]);
  }
  // Destroy a sdk object for lambda
  lambda.destroy();
}
/**
 * Download a lambda code from s3
 * @param region region to create a s3 client
 * @param s3Url s3 url
 * @param outputDir output directory path (default: /resources/code)
 */
export async function downloadLambdaCodeFromS3(region: string, s3Url: string, outputDir?: string): Promise<boolean> {
  // Check a url format
  if (!new RegExp("^s3://").test(s3Url)) {
    console.warn("[WARNING] Not match the s3 url format");
    return false;
  }

  // Create a sdk object for s3
  const s3: S3Sdk = new S3Sdk({ region });
  // Get a s3 object
  const obj:S3Object = await s3.getObjectByUrl(s3Url);
  // Checking the existence of a directory (if there's none, create it)
  const oPath: string = outputDir ? outputDir : CODE_DIR;
  if (!existsSync(oPath)) {
    mkdirSync(oPath, { recursive: true });
  } 
  // Write data
  obj.data.pipe(createWriteStream(join(oPath, obj.filename))).on("close", () => s3.destroy());
  // Return
  return true;
}
/**
 * Publish the lambda function version
 * @param functionName function name
 * @param config configuration for version
 * @param dirPath path to the directory where the code is stored (default /resources/code)
 * @returns version value
 */
export async function publishLambdaVersion(functionName: string, config: any, dirPath?: string): Promise<string> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
  // Set a version value variable
  let strVersion: string = "";

  // Publish the lambda function version
  if (config.Version !== "$LATEST" && config.StoredLocation && new RegExp("^s3://").test(config.StoredLocation)) {
    // Extract a file name from s3 url
    const temp:string[] = config.StoredLocation.replace(/^s3:\/\//, "").split("/").slice(1).join("/").split("/");
    const filename: string = temp[temp.length - 1];
    // Update the function code
    await lambda.updateCode(functionName, join(dirPath ? dirPath : CODE_DIR, filename));
    // Publish the version
    strVersion = await lambda.publishVersion(functionName, config.Description);
  }

  // Destroy a sdk object for lambda
  lambda.destroy();
  // Return
  return strVersion;
}
/**
 * Publish the lambda function versions
 * @param functionName function name
 * @param config configuration for versions
 * @param dirPath path to the directory where the code is stored (default /resources/code)
 * @returns mapping data for version
 */
export async function publishLambdaVersions(functionName: string, config: any[], dirPath?: string): Promise<any> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
  // Set a version mapping data
  const mapVersion: any = {};

  // Publish the lambda function versions
  for (const elem of config) {
    if (elem.Version !== "$LATEST" && elem.StoredLocation && new RegExp("^s3://").test(elem.StoredLocation)) {
      // Extract a file name from s3 url
      const temp:string[] = elem.StoredLocation.replace(/^s3:\/\//, "").split("/").slice(1).join("/").split("/");
      const filename: string = temp[temp.length - 1];
      // Update the function code
      await lambda.updateCode(functionName, join(dirPath ? dirPath : CODE_DIR, filename));
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
/**
 * Upload a lambda function code
 * @param functionName function name
 * @param location code stored location value
 * @param dirPath path to the directory where the code is stored (default /resources/code)
 */
export async function uploadLambdaInitCode(functionName: string, location: string, dirPath?: string): Promise<void> {
  // Create a sdk object for lambda
  const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
  // Extract a file name from s3 url
  const temp: string[] = location.replace(/^s3:\/\//, "").split("/").slice(1).join("/").split("/");
  const filename: string = temp[temp.length - 1];
  // Update a code
  await lambda.updateCode(functionName, join(dirPath ? dirPath : CODE_DIR, filename));
  // Destroy a sdk object for lambda
  lambda.destroy();
}