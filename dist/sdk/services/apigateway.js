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
// AWS SDK
const apigateway = __importStar(require("@aws-sdk/client-api-gateway"));
// Response
const response_1 = require("../../models/response");
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
        // Create the params for client
        const params = {
            credentials: config.credentials ? {
                accessKeyId: config.credentials.AccessKeyId,
                expiration: config.credentials.Expiration ? new Date(config.credentials.Expiration) : undefined,
                secretAccessKey: config.credentials.SecretAccessKey,
                sessionToken: config.credentials.SessionToken
            } : undefined,
            region: config.region
        };
        // Create a client for amazon apigateway
        this._client = new apigateway.APIGatewayClient(params);
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
                        const lambda = new lambda_1.LambdaSdk({ region: process.env.TARGET_REGION });
                        const lambdaArn = await lambda.getFunctionArn(functionName, qualifier);
                        lambda.destroy();
                        // Reprocessing uri and return
                        if (lambdaArn === "") {
                            return uri;
                        }
                        else {
                            return `arn:aws:apigateway:${process.env.TARGET_REGION}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`;
                        }
                    case "s3":
                        const uriPaths = uri.split(":");
                        // Change the region for uri
                        uriPaths[3] = process.env.TARGET_REGION;
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
     * Add an authorizer for method
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/updatemethodcommandinput.html#patchoperations
     * @param restApiId rest api id
     * @param resourceId resource id
     * @param httpMethod http method
     * @param config configuration for method
     */
    async addAuthorizerForMethod(restApiId, resourceId, httpMethod, config) {
        try {
            // Create an array to store the patch operations
            let patchOperations = [];
            // Append the options for authorizer id
            if (config.authorizationType) {
                patchOperations.push({
                    op: "replace",
                    path: "/authorizationType",
                    value: config.authorizationType
                });
            }
            // Append the options for authorizer id
            if (config.authorizerId) {
                patchOperations.push({
                    op: "replace",
                    path: "/authorizerId",
                    value: config.authorizerId
                });
            }
            // Append the options for authorization scope
            if (config.authorizationScopes) {
                for (const elem of config.authorizationScopes) {
                    patchOperations.push({
                        op: "add",
                        path: "/authorizationScopes",
                        value: elem
                    });
                }
            }
            // Create an input to add an authorizer for resource
            const input = {
                httpMethod: httpMethod,
                patchOperations: patchOperations.length > 0 ? patchOperations : undefined,
                resourceId: resourceId,
                restApiId: restApiId
            };
            // Create a command to add an authorizer for resource
            const command = new apigateway.UpdateMethodCommand(input);
            // Send a command to add an authorizer for resource
            await this._client.send(command);
        }
        catch (err) {
            console.warn(`[WARNING] Failed to add an authorizer for resource (target: ${resourceId})\n-> ${err}`);
        }
    }
    /**
     * Create an authorizer
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createauthorizercommandinput.html
     * @param restApiId rest api id
     * @param config configuration for authorizer
     * @returns authorizer id
     */
    async createAuthorizer(restApiId, config) {
        try {
            // Create an input to create an authorizer
            const input = {
                authType: config.authType,
                authorizerCredentials: config.authorizerCredentials,
                authorizerResultTtlInSeconds: config.authorizerResultTtlInSeconds,
                authorizerUri: config.authorizerUri,
                identitySource: config.identitySource,
                identityValidationExpression: config.identityValidationExpression,
                name: config.name,
                providerARNs: config.providerARNs,
                restApiId: restApiId,
                type: config.type
            };
            // Create a command to create an authorizer
            const command = new apigateway.CreateAuthorizerCommand(input);
            // Send a command to create an authorizer
            const response = await this._client.send(command);
            // Return
            return response.id;
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.CREATE_AUTHORIZER, true, restApiId, err);
        }
    }
    /**
     * Create a deployment
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createstagecommandinput.html
     * @param restApiId rest api id
     * @returns deployment id
     */
    async createDeployment(restApiId) {
        try {
            // Create an input to create a stage
            const input = {
                restApiId: restApiId,
            };
            // Create a command to create a stage
            const command = new apigateway.CreateDeploymentCommand(input);
            // Send a command to create a stage
            const response = await this._client.send(command);
            // Return
            return response.id;
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.CREATE_STAGE, false, restApiId, err);
            // Return
            return "";
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
            (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.CREATE_STAGE, false, restApiId, err);
        }
    }
    /**
     * Get an authorizer id
     * @param restApiId rest api id
     * @param authorizerName authorizer name
     * @returns authorizer id
     */
    async getAuthorizerId(restApiId, authorizerName) {
        try {
            // Create an input to get a list of authorizer 
            const input = {
                limit: 500,
                restApiId: restApiId,
            };
            // Create a command to get a list of authorizer
            const command = new apigateway.GetAuthorizersCommand(input);
            // Send a command to get a list of authorizer
            const response = await this._client.send(command);
            // Process a result
            if (response.items) {
                for (const elem of response.items) {
                    if (elem.name === authorizerName) {
                        return elem.id;
                    }
                }
            }
            // Return
            return "";
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.GET_AUTHORIZER_ID, false, authorizerName, err);
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
            return (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.GET_RESOURCE_ID, false, `${restApiId} ${path}`, err);
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
            return (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.GET_RESTAPI_ID, false, name, err);
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
            (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.PUT_METHOD_INTEGRATION, false, `${resourceId} ${httpMethod} in ${restApiId}`, err);
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
            (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.PUT_METHOD_INTEGRATION_RESPONSES, false, `${resourceId} ${httpMethod} in ${restApiId}`, err);
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
            (0, response_1.catchError)(response_1.CODE.ERROR.APIGATEWAY.RESTAPI.PUT_METHOD_RESPONSES, false, `${resourceId} ${httpMethod} in ${restApiId}`, err);
        }
    }
}
exports.APIGatewaySdk = APIGatewaySdk;
