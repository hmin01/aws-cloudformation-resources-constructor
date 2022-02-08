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
    // Return
    return resourcesByApi[apiId][path] !== undefined ? resourcesByApi[apiId][path] : "";
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
  // Return
  return "";
}

/**
 * Put the method integration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationcommand.html
 * @param name name for rest api
 * @param path path
 * @param httpMethod http method
 * @param config configuration for method integration
 */
export async function putMethodIntegration(name: string, path: string, httpMethod: string, config: any): Promise<void> {
  // Get a rest api id
  const apiId: string = await getRestApiId(name);
  if (apiId === "") {
    console.error(`[ERROR] Not found id for rest api (for ${name})`);
    process.exit(1);
  }
  // Get a resource id
  const resourceId: string = await getResourceId(apiId, path);
  if (resourceId === "") {
    console.error(`[ERROR] Not found id for resource (for ${path})`);
    process.exit(1);
  }
  // Re-processing a uri
  const uri: string = config.uri !== undefined ? await reprocessingUri(config.type, config.uri) : "";

  // Creaet the input to put method integration
  const input: apigateway.PutIntegrationCommandInput = {
    cacheKeyParameters: config.cacheKeyParameters !== undefined && config.cacheKeyParameters.length > 0 ? config.cacheKeyParameters : undefined,
    contentHandling: config.contentHandling,
    credentials: config.credentials,
    httpMethod: httpMethod,
    integrationHttpMethod: config.type !== "MOCK" ? config.httpMethod : undefined,
    passthroughBehavior: config.passthroughBehavior,
    requestParameters: config.requestParameters,
    requestTemplates: config.requestTemplates,
    resourceId: resourceId,
    restApiId: apiId,
    timeoutInMillis: config.timeoutInMillis,
    type: config.type,
    uri: uri !== "" ? uri : undefined,
  };
  // Create the command to put method integration
  const command: apigateway.PutIntegrationCommand = new apigateway.PutIntegrationCommand(input);
  // Send the command to put method integration
  const response: apigateway.PutIntegrationCommandOutput = await client.send(command);
  // Result
  if (response.type !== undefined) {
    console.info(`[NOTICE] Put the method integration (for ${httpMethod} ${path})`);
  } else {
    console.error(`[ERROR] Failed to put method integration`);
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