import * as apigateway from "@aws-sdk/client-api-gateway";
// Service
import { getLambdaFunctionArn } from "./lambda";
// Util
import { extractDataFromArn } from "../../utils/util";

// Set a client for api gateway
let client: apigateway.APIGatewayClient;
// Set resources by api
const resourcesByApi: any = {};

/**
 * Destroy a client for api gateway
 */
export function destroyAPIGatewayClient(): void {
  client.destroy();
}

/**
 * Create the deployment for rest api
 * @param restApiId rest api id
 * @param config configuration for deployment
 * @returns created deployment id
 */
export async function createDeployment(restApiId: string): Promise<string> {
  try {
    // Create the input to create the deployment
    const input: apigateway.CreateDeploymentCommandInput = {
      restApiId: restApiId,
    };
    // Create the command to create the deployment
    const command: apigateway.CreateDeploymentCommand = new apigateway.CreateDeploymentCommand(input);
    // Send the command to create the deployment
    const response: apigateway.CreateDeploymentCommandOutput = await client.send(command);
    // Result
    if (response.id !== undefined) {
      return response.id;
    } else {
      console.error(`[ERROR] Failed to create deployment (for ${restApiId})`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to create deployment\n${err}`);
    process.exit(1);
  }
}

/**
 * Create the stage for rest api
 * @param restApiId rest api id
 * @param deploymentId deployment id
 * @param config configuration for stage
 */
export async function createStage(restApiId: string, deploymentId: string, config: any): Promise<void> {
  try {
    // Create the input to create the stage
    const input: apigateway.CreateStageCommandInput = {
      deploymentId: deploymentId,
      restApiId: restApiId,
      stageName: config.stageName,
      // Opitonal
      cacheClusterEnabled: config.cacheClusterEnabled,
      cacheClusterSize: config.cacheClusterSize,
      canarySettings: config.canarySettings,
      description: config.description,
      documentationVersion: config.documentationVersion,
      tags: config.tags,
      tracingEnabled: config.tracingEnabled,
      variables: config.variables
    };
    // Create the command to create the stage
    const command: apigateway.CreateStageCommand = new apigateway.CreateStageCommand(input);
    // Send the command to create the stage
    await client.send(command);
  } catch (err) {
    console.error(`[ERROR] Failed to create stage\n${err}`);
    process.exit(1);
  }
}

/**
 * Get resource id according to path
 * @param apiId api id
 * @param path path
 * @returns resource id
 */
export async function getResourceId(apiId: string, path: string): Promise<string> {
  if (resourcesByApi[apiId] !== undefined) {
    return resourcesByApi[apiId][path] !== undefined ? resourcesByApi[apiId][path] : "";
  } else {
    // Create the input to get a list of resource id
    const input: apigateway.GetResourcesCommandInput = {
      limit: 500,
      restApiId: apiId
    };
    // Create the command to get a list of resource id
    const command: apigateway.GetResourcesCommand = new apigateway.GetResourcesCommand(input);
    // Send the command to get a list of resource id
    const response: apigateway.GetResourcesCommandOutput = await client.send(command);
    // Result
    if (response.items === undefined || response.items.length === 0) {
      console.error(`[ERROR] Failed to get a list of resource id (for ${apiId})`);
      process.exit(1);
    }

    // Re-processing for response
    const resources: any = {};
    for (const elem of response.items) {
      resources[elem.path as string] = elem.id;
    }
    // Store
    resourcesByApi[apiId] = resources;
    // Return result and print warning message
    if (resourcesByApi[apiId][path] !== undefined) {
      return resourcesByApi[apiId][path];
    } else {
      console.warn(`[WARNING] Not found resource id in rest api (for ${path})`);
      return "";
    }
  }  
}

/**
 * Get a rest api id
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/getrestapiscommand.html
 * @param name name for rest api
 * @returns rest api id
 */
export async function getRestApiId(name: string): Promise<string> {
  // Create the input to get rest apis
  const input: apigateway.GetRestApisCommandInput = {
    limit: 500,
  };
  // Create the command to get rest apis
  const command: apigateway.GetRestApisCommand = new apigateway.GetRestApisCommand(input);
  // Send the command to get rest apis
  const response: apigateway.GetRestApisCommandOutput = await client.send(command);
  // Result
  if (response.items === undefined || response.items.length === 0) {
    console.error(`[ERROR] Failed to get rest apis`);
    process.exit(1);
  }

  // Find resource id
  for (const elem of response.items) {
    if (elem.name === name && elem.id) {
      return elem.id;
    }
  }
  // Print warning message
  console.warn(`[WARNING] Not found rest api id (for ${name})`);
  // Return
  return "";
}

/**
 * Put the method integration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationcommand.html
 * @param restApiId id for rest api
 * @param resourceId id for resource in api
 * @param httpMethod http method
 * @param config configuration for method integration
 */
export async function putMethodIntegration(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void> {
  try {
    if (config !== undefined) {
      // Re-processing a uri
      const uri: string = config.uri !== undefined ? await reprocessingUri(config.type, config.uri) : "";
      // Creaet the input to put method integration
      const input: apigateway.PutIntegrationCommandInput = {
        httpMethod: httpMethod,
        resourceId: resourceId,
        restApiId: restApiId,
        type: config.type,
        // Optional
        cacheKeyParameters: config.cacheKeyParameters !== undefined && config.cacheKeyParameters.length > 0 ? config.cacheKeyParameters : undefined,
        contentHandling: config.contentHandling,
        credentials: config.credentials,
        integrationHttpMethod: config.type !== "MOCK" ? config.httpMethod : undefined,
        passthroughBehavior: config.passthroughBehavior,
        requestParameters: config.requestParameters,
        requestTemplates: config.requestTemplates,
        timeoutInMillis: config.timeoutInMillis,
        tlsConfig: config.tlsConfig,
        uri: uri !== "" ? uri : undefined,
      };
      // Create the command to put method integration
      const command: apigateway.PutIntegrationCommand = new apigateway.PutIntegrationCommand(input);
      // Send the command to put method integration
      await client.send(command);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to put method integration\n${err}`);
    process.exit(1);
  }
}

/**
 * Put the method integration reesponse
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationresponsecommand.html
 * @param restApiId rest api id
 * @param resourceId resource id
 * @param httpMethod http method
 * @param config configuration for method integration response
 */
export async function putMethodIntegrationResponse(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void> {
  try {
    if (config !== undefined) {
      for (const statusCode of Object.keys(config)) {
        // Extract the configuration for status code
        const data: any = config[statusCode];
        // Create the input for put method integration response
        const input: apigateway.PutIntegrationResponseCommandInput = {
          httpMethod: httpMethod,
          restApiId: restApiId,
          resourceId: resourceId,
          statusCode: statusCode,
          // Optional
          contentHandling: data.contentHandling,
          responseParameters: data.responseParameters,
          responseTemplates: data.responseTemplates
        };
        // Create the command to put method integration response
        const command: apigateway.PutIntegrationResponseCommand = new apigateway.PutIntegrationResponseCommand(input);
        // Send the command to put method integration response
        await client.send(command);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Failed to put method integration response\n${err}`);
    process.exit(1);
  }
}

/**
 * Put the method response
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putmethodresponsecommand.html
 * @param restApiId rest api id
 * @param resourceId resource id
 * @param httpMethod http method
 * @param config configuration for method response
 */
export async function putMethodResponse(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void> {
  try {
    if (config !== undefined) {
      for (const statusCode of Object.keys(config)) {
        // Create the input to put method response
        const input: apigateway.PutMethodResponseCommandInput = {
          httpMethod: httpMethod,
          resourceId: resourceId,
          restApiId: restApiId,
          statusCode: statusCode,
          // Optional
          responseModels: config[statusCode].responseModels,
          responseParameters: config[statusCode].responseParameters
        };
        // Create the command to put method response
        const command: apigateway.PutMethodResponseCommand = new apigateway.PutMethodResponseCommand(input);
        // Send the command to put method response
        await client.send(command);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Failed to put method response\n${err}`);
    process.exit(1);
  }
}

/**
 * Init a client for api gateway
 */
export function initAPIGatewayClient(): void {
  client = new apigateway.APIGatewayClient({ region: process.env.REGION });
}

/**
 * Re-processing uri
 * @description https://docs.aws.amazon.com/apigateway/api-reference/resource/integration/#uri
 * @param type type for integration [HTTP|HTTP_PROXY|AWS|AWS_PROXY|MOCK]
 * @param uri uri
 * @returns re-processed uri
 */
async function reprocessingUri(type: string, uri: string): Promise<string> {
  if (type.includes("AWS")) {
    const service: string = uri.split(":")[4];
    switch (service) {
      case "lambda":
        // Extract a previous arn for aws resource
        const temp: string[] = uri.split(":").slice(5).join(":").split("/");
        const rawArn: string = temp[temp.length - 2];
        // Extract a lambda function name and qualifier from previous arn
        const functionName: string = extractDataFromArn(rawArn, "resource");
        const qualifier: string = extractDataFromArn(rawArn, "qualifier");
        // Get an arn for lambda function
        const lambdaArn: string = await getLambdaFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
        // Reprocessing uri and return
        if (lambdaArn === "") {
          return uri;
        } else {
          return `arn:aws:apigateway:${process.env.REGION}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`;
        }
      case "s3":
        const uriPaths: string[] = uri.split(":");
        // Change the region for uri
        uriPaths[3] = process.env.REGION as string;
        // Combine uri path and return
        return uriPaths.join(":");
      default:
        return "";
    }
  } else if (type.includes("HTTP")) {
    return uri;
  } else {
    return "";
  }
}