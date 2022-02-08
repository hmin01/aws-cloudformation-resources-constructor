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
exports.initAPIGatewayClient = exports.putMethodIntegration = exports.getRestApiId = exports.getResourceId = exports.destroyAPIGatewayClient = void 0;
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
        // Return
        return resourcesByApi[apiId][path] !== undefined ? resourcesByApi[apiId][path] : "";
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
    return "";
}
exports.getRestApiId = getRestApiId;
/**
 * Put the method integration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationcommand.html
 * @param name name for rest api
 * @param path path
 * @param httpMethod http method
 * @param config configuration for method integration
 */
async function putMethodIntegration(name, path, httpMethod, config) {
    // Get a rest api id
    const apiId = await getRestApiId(name);
    if (apiId === "") {
        console.error(`[ERROR] Not found id for rest api (for ${name})`);
        process.exit(1);
    }
    // Get a resource id
    const resourceId = await getResourceId(apiId, path);
    if (resourceId === "") {
        console.error(`[ERROR] Not found id for resource (for ${path})`);
        process.exit(1);
    }
    // Re-processing a uri
    const uri = config.uri !== undefined ? await reprocessingUri(config.type, config.uri) : "";
    // Creaet the input to put method integration
    const input = {
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
    const command = new apigateway.PutIntegrationCommand(input);
    // Send the command to put method integration
    const response = await client.send(command);
    // Result
    if (response.type !== undefined) {
        console.info(`[NOTICE] Put the method integration (for ${httpMethod} ${path})`);
    }
    else {
        console.error(`[ERROR] Failed to put method integration`);
        process.exit(1);
    }
}
exports.putMethodIntegration = putMethodIntegration;
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
