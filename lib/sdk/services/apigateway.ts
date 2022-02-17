import * as apigateway from "@aws-sdk/client-api-gateway";
// Service
import { LambdaSdk } from "./lambda";
// Util
import { extractDataFromArn } from "../../utils/util";

export class APIGatewaySdk {
  private _client: apigateway.APIGatewayClient;
  private _resources: any;

  /**
   * Create a sdk object for amazon apigateway
   * @param config configuration for amzon apigateway
   */
  constructor(config: any) {
    // Create a client for amazon apigateway
    this._client = new apigateway.APIGatewayClient(config);
    // Set a mapping data for resources
    this._resources = {};
  }

  /**
   * Destroy a client for amazon apigateway
   */
  public destroy(): void {
    this._client.destroy();
  }

  /**
   * Re-processing uri
   * @description https://docs.aws.amazon.com/apigateway/api-reference/resource/integration/#uri
   * @param type type for integration [HTTP|HTTP_PROXY|AWS|AWS_PROXY|MOCK]
   * @param uri uri
   * @returns re-processed uri
   */
  private async _reProcessingUri(type: string, uri: string): Promise<string> {
    try {
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
            const lambda: LambdaSdk = new LambdaSdk({ region: process.env.RESION });
            const lambdaArn: string = await lambda.getFunctionArn(functionName, qualifier);
            lambda.destroy();
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
    } catch (err) {
      console.warn(`[WARNING] Failed to re-processing for uri (target: ${uri})\n-> ${err}`);
      return "";
    }
  }

  /**
   * Create a deployment
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createdeploymentcommandinput.html
   * @param restApiId rest api id
   * @returns deployment id
   */
  public async createDeployment(restApiId: string): Promise<string> {
    try {
      // Create an input to create a deployment
      const input: apigateway.CreateDeploymentCommandInput = {
        restApiId: restApiId
      };
      // Create a command to create a deployment
      const command: apigateway.CreateDeploymentCommand = new apigateway.CreateDeploymentCommand(input);
      // Send a command to create a deployment
      const response: apigateway.CreateDeploymentCommandOutput = await this._client.send(command);
      // Return
      return response.id as string;
    } catch (err) {
      console.error(`[ERROR] Failed to create a deployment (target: ${restApiId})\n-> ${err}`);
      process.exit(40);
    }
  }

  /**
   * Creat a stage
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createstagecommandinput.html
   * @param restApiId rest api id
   * @param deploymentId deployment id
   * @param config configuration for stage
   */
  public async createStage(restApiId: string, deploymentId: string, config: any): Promise<void> {
    try {
      // Create an input to create a stage
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
      // Create a command to create a stage
      const command: apigateway.CreateStageCommand = new apigateway.CreateStageCommand(input);
      // Send a command to create a stage
      await this._client.send(command);
    } catch (err) {
      console.error(`[ERROR] Failed to create a stage (target: ${restApiId})\n-> ${err}`);
      process.exit(41);
    }
  }

  /**
   * Get a resource id
   * @param restApiId rest api id
   * @param path resource path
   * @returns resource id
   */
  public async getResouceId(restApiId: string, path: string): Promise<string> {
    try {
      // Create an input to get a resource id
      const input: apigateway.GetResourcesCommandInput = {
        limit: 500,
        restApiId: restApiId
      };
      // Create a paginater
      const paginator = apigateway.paginateGetResources({ client: this._client }, input);
      // Process a result
      for await (const page of paginator) {
        if (page.items) {
          for (const elem of page.items) {
            if (elem.path && elem.path === path) {
              return elem.id as string;
            }
          }
        }
      }
      // Return
      return "";
    } catch (err) {
      console.error(`[ERROR] Failed to get a resource id (target: ${path})\n-> ${err}`);
      process.exit(42);
    }
  }

  /**
   * Get a rest api id
   * @param name rest api name
   * @returns rest api id
   */
  public async getRestApiId(name: string): Promise<string> {
    try {
      // Create an input to get a rest api id
      const input: apigateway.GetRestApisCommandInput = {
        limit: 500
      };
      // Create a paginator
      const paginator = apigateway.paginateGetRestApis({ client: this._client }, input);
      // Process a result
      for await (const page of paginator) {
        if (page.items) {
          for (const elem of page.items) {
            if (elem.name && elem.name === name) {
              return elem.id as string;
            }
          }
        }
      }
      // Return
      return "";
    } catch (err) {
      console.error(`[ERROR] Failed to get a rest api id (target: ${name})\n-> ${err}`);
      process.exit(43);
    }
  }

  /**
   * Put a method integration
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/putintegrationcommandinput.html
   * @param restApiId rest api id
   * @param resourceId resource id
   * @param httpMethod http method
   * @param config configuration for method integration
   */
  public async putMethodIntegration(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void> {
    try {
      // Re-processing a uri
      const uri: string = config.uri ? await this._reProcessingUri(config.type, config.uri) : "";
      // Create an input to put a method integration
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
      }
      // Create a command to put a method integration
      const command: apigateway.PutIntegrationCommand = new apigateway.PutIntegrationCommand(input);
      // Send a command to put a method integration
      await this._client.send(command);
    } catch (err) {
      console.error(`[ERROR] Failed to put a method integration (target: ${resourceId}, ${httpMethod})\n-> ${err}`);
      process.exit(44);
    }
  }

  /**
   * Put a method integration response
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/putintegrationresponsecommandinput.html
   * @param restApiId rest api id
   * @param resourceId resource id
   * @param httpMethod http method
   * @param config configuration for method integration response
   */
  public async putMethodIntegrationResponses(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void> {
    try {
      for (const statusCode of Object.keys(config)) {
        // Extract a configuration for status code
        const elem: any = config[statusCode];
        // Create an input to put a method integration response
        const input: apigateway.PutIntegrationResponseCommandInput = {
          httpMethod: httpMethod,
          restApiId: restApiId,
          resourceId: resourceId,
          statusCode: statusCode,
          // Optional
          contentHandling: elem.contentHandling,
          responseParameters: elem.responseParameters,
          responseTemplates: elem.responseTemplates
        };
        // Create a command to put a method integration response
        const command: apigateway.PutIntegrationResponseCommand = new apigateway.PutIntegrationResponseCommand(input);
        // Send a command to put a method integration response
        await this._client.send(command);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to put a method integration response (target: ${resourceId}, ${httpMethod})\n-> ${err}`);
      process.exit(45);
    }
  }

  /**
   * Put a method response
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/putmethodresponsecommandinput.html
   * @param restApiId rest api id
   * @param resourceId resourceId
   * @param httpMethod http method
   * @param config configuration for method response
   */
  public async putMethodResponses(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void> {
    try {
      for (const statusCode of Object.keys(config)) {
        // Create an input to put a method response
        const input: apigateway.PutMethodResponseCommandInput = {
          httpMethod: httpMethod,
          resourceId: resourceId,
          restApiId: restApiId,
          statusCode: statusCode,
          // Optional
          responseModels: config[statusCode].responseModels,
          responseParameters: config[statusCode].responseParameters
        };
        // Create a command to put a method response
        const command: apigateway.PutMethodResponseCommand = new apigateway.PutMethodResponseCommand(input);
        // Send a command to put a method response
        await this._client.send(command);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to put a method response (target: ${resourceId}, ${httpMethod})\n-> ${err}`);
      process.exit(46);
    }
  }
}