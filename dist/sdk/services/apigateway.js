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
exports.initAPIGatewayClient = exports.putMethodResponse = exports.putMethodIntegrationResponse = exports.putMethodIntegration = exports.getRestApiId = exports.getResourceId = exports.createStage = exports.createDeployment = exports.destroyAPIGatewayClient = void 0;
const apigateway = __importStar(require("@aws-sdk/client-api-gateway"));
// Service
const lambda_1 = require("./lambda");
// Util
const util_1 = require("../../utils/util");
// Set a client for api gateway
let client;
// Set resources by api
const resourcesByApi = {};
/**
 * Destroy a client for api gateway
 */
function destroyAPIGatewayClient() {
    client.destroy();
}
exports.destroyAPIGatewayClient = destroyAPIGatewayClient;
/**
 * Create the deployment for rest api
 * @param restApiId rest api id
 * @param config configuration for deployment
 * @returns created deployment id
 */
async function createDeployment(restApiId) {
    try {
        // Create the input to create the deployment
        const input = {
            restApiId: restApiId,
        };
        // Create the command to create the deployment
        const command = new apigateway.CreateDeploymentCommand(input);
        // Send the command to create the deployment
        const response = await client.send(command);
        // Result
        if (response.id !== undefined) {
            return response.id;
        }
        else {
            console.error(`[ERROR] Failed to create deployment (for ${restApiId})`);
            process.exit(1);
        }
    }
    catch (err) {
        console.error(`[ERROR] Failed to create deployment\n${err}`);
        process.exit(1);
    }
}
exports.createDeployment = createDeployment;
/**
 * Create the stage for rest api
 * @param restApiId rest api id
 * @param deploymentId deployment id
 * @param config configuration for stage
 */
async function createStage(restApiId, deploymentId, config) {
    try {
        // Create the input to create the stage
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
        // Create the command to create the stage
        const command = new apigateway.CreateStageCommand(input);
        // Send the command to create the stage
        await client.send(command);
    }
    catch (err) {
        console.error(`[ERROR] Failed to create stage\n${err}`);
        process.exit(1);
    }
}
exports.createStage = createStage;
/**
 * Get resource id according to path
 * @param apiId api id
 * @param path path
 * @returns resource id
 */
async function getResourceId(apiId, path) {
    if (resourcesByApi[apiId] !== undefined) {
        return resourcesByApi[apiId][path] !== undefined ? resourcesByApi[apiId][path] : "";
    }
    else {
        // Create the input to get a list of resource id
        const input = {
            limit: 500,
            restApiId: apiId
        };
        // Create the command to get a list of resource id
        const command = new apigateway.GetResourcesCommand(input);
        // Send the command to get a list of resource id
        const response = await client.send(command);
        // Result
        if (response.items === undefined || response.items.length === 0) {
            console.error(`[ERROR] Failed to get a list of resource id (for ${apiId})`);
            process.exit(1);
        }
        // Re-processing for response
        const resources = {};
        for (const elem of response.items) {
            resources[elem.path] = elem.id;
        }
        // Store
        resourcesByApi[apiId] = resources;
        // Return result and print warning message
        if (resourcesByApi[apiId][path] !== undefined) {
            return resourcesByApi[apiId][path];
        }
        else {
            console.warn(`[WARNING] Not found resource id in rest api (for ${path})`);
            return "";
        }
    }
}
exports.getResourceId = getResourceId;
/**
 * Get a rest api id
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/getrestapiscommand.html
 * @param name name for rest api
 * @returns rest api id
 */
async function getRestApiId(name) {
    try {
        // Create the input to get rest apis
        const input = {
            limit: 500,
        };
        // Create the command to get rest apis
        const command = new apigateway.GetRestApisCommand(input);
        // Send the command to get rest apis
        const response = await client.send(command);
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
        console.warn(`[WARNING] Not found rest api id (for ${name})`);
        return "";
    }
    catch (err) {
        console.warn(`[WARNING] Not found rest api id (for ${name})`);
        return "";
    }
}
exports.getRestApiId = getRestApiId;
/**
 * Put the method integration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationcommand.html
 * @param restApiId id for rest api
 * @param resourceId id for resource in api
 * @param httpMethod http method
 * @param config configuration for method integration
 */
async function putMethodIntegration(restApiId, resourceId, httpMethod, config) {
    try {
        if (config !== undefined) {
            // Re-processing a uri
            const uri = config.uri !== undefined ? await reprocessingUri(config.type, config.uri) : "";
            // Creaet the input to put method integration
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
            // Create the command to put method integration
            const command = new apigateway.PutIntegrationCommand(input);
            // Send the command to put method integration
            await client.send(command);
        }
    }
    catch (err) {
        console.error(`[ERROR] Failed to put method integration\n${err}`);
        process.exit(1);
    }
}
exports.putMethodIntegration = putMethodIntegration;
/**
 * Put the method integration reesponse
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationresponsecommand.html
 * @param restApiId rest api id
 * @param resourceId resource id
 * @param httpMethod http method
 * @param config configuration for method integration response
 */
async function putMethodIntegrationResponse(restApiId, resourceId, httpMethod, config) {
    try {
        if (config !== undefined) {
            for (const statusCode of Object.keys(config)) {
                // Extract the configuration for status code
                const data = config[statusCode];
                // Create the input for put method integration response
                const input = {
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
                const command = new apigateway.PutIntegrationResponseCommand(input);
                // Send the command to put method integration response
                await client.send(command);
            }
        }
    }
    catch (err) {
        console.error(`[ERROR] Failed to put method integration response\n${err}`);
        process.exit(1);
    }
}
exports.putMethodIntegrationResponse = putMethodIntegrationResponse;
/**
 * Put the method response
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putmethodresponsecommand.html
 * @param restApiId rest api id
 * @param resourceId resource id
 * @param httpMethod http method
 * @param config configuration for method response
 */
async function putMethodResponse(restApiId, resourceId, httpMethod, config) {
    try {
        if (config !== undefined) {
            for (const statusCode of Object.keys(config)) {
                // Create the input to put method response
                const input = {
                    httpMethod: httpMethod,
                    resourceId: resourceId,
                    restApiId: restApiId,
                    statusCode: statusCode,
                    // Optional
                    responseModels: config[statusCode].responseModels,
                    responseParameters: config[statusCode].responseParameters
                };
                // Create the command to put method response
                const command = new apigateway.PutMethodResponseCommand(input);
                // Send the command to put method response
                await client.send(command);
            }
        }
    }
    catch (err) {
        console.error(`[ERROR] Failed to put method response\n${err}`);
        process.exit(1);
    }
}
exports.putMethodResponse = putMethodResponse;
/**
 * Init a client for api gateway
 */
function initAPIGatewayClient() {
    client = new apigateway.APIGatewayClient({ region: process.env.REGION });
}
exports.initAPIGatewayClient = initAPIGatewayClient;
/**
 * Re-processing uri
 * @description https://docs.aws.amazon.com/apigateway/api-reference/resource/integration/#uri
 * @param type type for integration [HTTP|HTTP_PROXY|AWS|AWS_PROXY|MOCK]
 * @param uri uri
 * @returns re-processed uri
 */
async function reprocessingUri(type, uri) {
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
                const lambdaArn = await (0, lambda_1.getLambdaFunctionArn)(functionName, qualifier !== "" ? qualifier : undefined);
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
