"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIGatewaySdk = void 0;
const apigateway = __importStar(require("@aws-sdk/client-api-gateway"));
// Service
const lambda_1 = require("./lambda");
// Util
const util_1 = require("../../utils/util");
class APIGatewaySdk {
    /**
     * Create a sdk object for amazon apigateway
     * @param config configuration for amzon apigateway
     */
    constructor(config) {
        // Create a client for amazon apigateway
        this._client = new apigateway.APIGatewayClient(config);
        // Set a mapping data for resources
        this._resources = {};
    }
    /**
     * Destroy a client for amazon apigateway
     */
    destroy() {
        this._client.destroy();
    }
    /**
     * Re-processing uri
     * @description https://docs.aws.amazon.com/apigateway/api-reference/resource/integration/#uri
     * @param type type for integration [HTTP|HTTP_PROXY|AWS|AWS_PROXY|MOCK]
     * @param uri uri
     * @returns re-processed uri
     */
    async _reProcessingUri(type, uri) {
        try {
            if (type.includes("AWS")) {
                const service = uri.split(":")[4];
                switch (service) {
                    case "lambda":
                        // Extract a previous arn for aws resource
                        const temp = uri.split(":").slice(5).join(":").split("/");
                        const rawArn = temp[temp.length - 2];
                        // Extract a lambda function name and qualifier from previous arn
                        const functionName = (0, util_1.extractDataFromArn)(rawArn, "resource");
                        const qualifier = (0, util_1.extractDataFromArn)(rawArn, "qualifier");
                        // Get an arn for lambda function
                        const lambda = new lambda_1.LambdaSdk({ region: process.env.RESION });
                        const lambdaArn = await lambda.getFunctionArn(functionName, qualifier);
                        lambda.destroy();
                        // Reprocessing uri and return
                        if (lambdaArn === "") {
                            return uri;
                        }
                        else {
                            return `arn:aws:apigateway:${process.env.REGION}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`;
                        }
                    case "s3":
                        const uriPaths = uri.split(":");
                        // Change the region for uri
                        uriPaths[3] = process.env.REGION;
                        // Combine uri path and return
                        return uriPaths.join(":");
                    default:
                        return "";
                }
            }
            else if (type.includes("HTTP")) {
                return uri;
            }
            else {
                return "";
            }
        }
        catch (err) {
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
    async createDeployment(restApiId) {
        try {
            // Create an input to create a deployment
            const input = {
                restApiId: restApiId
            };
            // Create a command to create a deployment
            const command = new apigateway.CreateDeploymentCommand(input);
            // Send a command to create a deployment
            const response = await this._client.send(command);
            // Return
            return response.id;
        }
        catch (err) {
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
    async createStage(restApiId, deploymentId, config) {
        try {
            // Create an input to create a stage
            const input = {
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
            const command = new apigateway.CreateStageCommand(input);
            // Send a command to create a stage
            await this._client.send(command);
        }
        catch (err) {
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
    async getResouceId(restApiId, path) {
        try {
            // Create an input to get a resource id
            const input = {
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
                            return elem.id;
                        }
                    }
                }
            }
            // Return
            return "";
        }
        catch (err) {
            console.error(`[ERROR] Failed to get a resource id (target: ${path})\n-> ${err}`);
            process.exit(42);
        }
    }
    /**
     * Get a rest api id
     * @param name rest api name
     * @returns rest api id
     */
    async getRestApiId(name) {
        try {
            // Create an input to get a rest api id
            const input = {
                limit: 500
            };
            // Create a paginator
            const paginator = apigateway.paginateGetRestApis({ client: this._client }, input);
            // Process a result
            for await (const page of paginator) {
                if (page.items) {
                    for (const elem of page.items) {
                        if (elem.name && elem.name === name) {
                            return elem.id;
                        }
                    }
                }
            }
            // Return
            return "";
        }
        catch (err) {
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
    async putMethodIntegration(restApiId, resourceId, httpMethod, config) {
        try {
            // Re-processing a uri
            const uri = config.uri ? await this._reProcessingUri(config.type, config.uri) : "";
            // Create an input to put a method integration
            const input = {
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
            // Create a command to put a method integration
            const command = new apigateway.PutIntegrationCommand(input);
            // Send a command to put a method integration
            await this._client.send(command);
        }
        catch (err) {
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
    async putMethodIntegrationResponses(restApiId, resourceId, httpMethod, config) {
        try {
            for (const statusCode of Object.keys(config)) {
                // Extract a configuration for status code
                const elem = config[statusCode];
                // Create an input to put a method integration response
                const input = {
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
                const command = new apigateway.PutIntegrationResponseCommand(input);
                // Send a command to put a method integration response
                await this._client.send(command);
            }
        }
        catch (err) {
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
    async putMethodResponses(restApiId, resourceId, httpMethod, config) {
        try {
            for (const statusCode of Object.keys(config)) {
                // Create an input to put a method response
                const input = {
                    httpMethod: httpMethod,
                    resourceId: resourceId,
                    restApiId: restApiId,
                    statusCode: statusCode,
                    // Optional
                    responseModels: config[statusCode].responseModels,
                    responseParameters: config[statusCode].responseParameters
                };
                // Create a command to put a method response
                const command = new apigateway.PutMethodResponseCommand(input);
                // Send a command to put a method response
                await this._client.send(command);
            }
        }
        catch (err) {
            console.error(`[ERROR] Failed to put a method response (target: ${resourceId}, ${httpMethod})\n-> ${err}`);
            process.exit(46);
        }
    }
}
exports.APIGatewaySdk = APIGatewaySdk;
