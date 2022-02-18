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
exports.publishLambdaVersions = exports.createEventSourceMappings = exports.createAliases = exports.createCognitoUserPoolClients = exports.setCognitoUserPool = exports.deployAPIGatewayStage = exports.configureAPIGatewayMethods = exports.initSdkClients = exports.destroySdkClients = void 0;
const path_1 = require("path");
// Services (SDK)
const SDKCognito = __importStar(require("./services/cognito"));
// Services (SDK) - new
const apigateway_1 = require("./services/apigateway");
const lambda_1 = require("./services/lambda");
// Utile
const util_1 = require("../utils/util");
// Set the directory for stored lambda function codes
const CODE_DIR = (0, path_1.join)(__dirname, "../../resources/code");
/** For Util */
/**
 * Destroy the sdk clients
 */
function destroySdkClients() {
    SDKCognito.destroyCognitoClient();
}
exports.destroySdkClients = destroySdkClients;
/**
 * Init the sdk clients
 */
function initSdkClients() {
    SDKCognito.initCognitoClient();
}
exports.initSdkClients = initSdkClients;
/** For APIGateway */
/**
 * Configure the methods in rest api
 * @param restApiName rest api name
 * @param config configuration for methods
 */
async function configureAPIGatewayMethods(restApiName, config) {
    // Create a sdk object for amazon apigateway
    const apigateway = new apigateway_1.APIGatewaySdk({ region: process.env.REGION });
    // Get a rest api id
    const restApiId = await apigateway.getRestApiId(restApiName);
    // Catch error
    if (restApiId === "") {
        console.error(`[ERROR] Not found rest api id (target: ${restApiName})`);
        process.exit(47);
    }
    // Configure the methods
    for (const elem of config) {
        // Get a resource id
        const resourceId = await apigateway.getResouceId(restApiId, elem.path);
        // Catch error
        if (resourceId === "") {
            console.error(`[ERROR] Not found resource id (taget ${elem.path})`);
            break;
        }
        // Configure a method
        if (elem.resourceMethods) {
            for (const method of Object.keys(elem.resourceMethods)) {
                // Extrac the configurations
                const configForIntegration = elem.resourceMethods[method].methodIntegration;
                const configForResponse = elem.resourceMethods[method].methodResponses;
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
exports.configureAPIGatewayMethods = configureAPIGatewayMethods;
/**
 * Deploy a stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
async function deployAPIGatewayStage(restApiName, config) {
    // Create a sdk object for amazon apigateway
    const apigateway = new apigateway_1.APIGatewaySdk({ region: process.env.REGION });
    // Get a rest api id
    const restApiId = await apigateway.getRestApiId(restApiName);
    // Catch error
    if (restApiId === "") {
        console.error(`[ERROR] Not found rest api id (target: ${restApiName})`);
        process.exit(47);
    }
    // Create the deployments and stages
    for (const elem of config) {
        // Create a deployment
        const deployment = await apigateway.createDeployment(restApiId);
        // Create a stage
        await apigateway.createStage(restApiId, deployment, elem);
        // Print message
        console.info(`[NOTICE] Deploy the stage (for ${restApiName})`);
    }
    // Destroy a sdk object for amazon apigateway
    apigateway.destroy();
}
exports.deployAPIGatewayStage = deployAPIGatewayStage;
/** For Cognito */
/**
 * Set a cognito user pool configuration
 * @param name user pool name
 * @param config configuration for user pool
 */
async function setCognitoUserPool(name, config) {
    // Create an sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.REGION });
    // Get a user pool id for name
    const userPoolId = await SDKCognito.getUserPoolId(name);
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
        const emailConfig = JSON.parse(JSON.stringify(config.EmailConfiguration));
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
        const lambdaConfig = JSON.parse(JSON.stringify(config.LambdaConfig));
        // Re-processing
        for (const key of Object.keys(lambdaConfig)) {
            // Extract a function name and qualifier
            const functionName = (0, util_1.extractDataFromArn)(lambdaConfig[key], "resource");
            const qualifier = (0, util_1.extractDataFromArn)(lambdaConfig[key], "qualifier");
            // Get a lambda arn
            const lambdaArn = await lambda.getFunctionArn(functionName, qualifier);
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
exports.setCognitoUserPool = setCognitoUserPool;
/**
 * Create the cognito user pool clients
 * @param name user pool name
 * @param config configuration for user pool clients
 */
async function createCognitoUserPoolClients(name, clientConfigs, uiConfigs) {
    // Get a user pool id for name
    const userPoolId = await SDKCognito.getUserPoolId(name);
    if (userPoolId === "") {
        console.error(`[ERROR] Not found user pool id (for ${name})`);
        process.exit(1);
    }
    // Create the user pool clients
    for (const elem of clientConfigs) {
        // Extract the ui customization data
        let uiData = undefined;
        for (const data of uiConfigs) {
            if (data.ClientId === elem.ClientId) {
                uiData = data;
                break;
            }
        }
        // Create the user pool client
        const clientId = await SDKCognito.createUserPoolClient(userPoolId, elem);
        // Set the ui customization
        if (clientId && uiData) {
            await SDKCognito.setUICustomization(userPoolId, clientId, uiData);
        }
        // Print message
        console.info(`[NOTICE] Create the user pool client (for ${elem.ClientName})`);
    }
}
exports.createCognitoUserPoolClients = createCognitoUserPoolClients;
/** For Lambda */
/**
 * Create the lambda function aliases
 * @param functionName function name
 * @param config configuration for aliases
 * @param mapVersion mapping data for version
 */
async function createAliases(functionName, config, mapVersion) {
    // Create a sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.REGION });
    // Create the lambda function aliases
    for (const elem of config) {
        // Set a function version
        const functionVersion = mapVersion ? mapVersion[elem.FunctionVersion] : elem.FunctionVersion;
        // Create the alias for function
        await lambda.createAlias(functionName, functionVersion, elem.Name, elem.Description !== "" ? elem.Description : undefined);
    }
    // Destroy a sdk object for lambda
    lambda.destroy();
}
exports.createAliases = createAliases;
/**
 * Create the event source mappings
 * @param config configuration for event source mappings
 */
async function createEventSourceMappings(config) {
    // Create a sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.REGION });
    // Create the event source mappings
    for (const mappingId of Object.keys(config)) {
        await lambda.createEventSourceMapping(config[mappingId]);
    }
    // Destroy a sdk object for lambda
    lambda.destroy();
}
exports.createEventSourceMappings = createEventSourceMappings;
/**
 * Publish the lambda function versions
 * @param functionName function name
 * @param config configuration for versions
 * @returns mapping data for version
 */
async function publishLambdaVersions(functionName, config) {
    // Create a sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.REGION });
    // Set a version mapping data
    const mapVersion = {};
    // Publish the lambda function versions
    for (const elem of config) {
        if (elem.Version !== "$LATEST" && elem.StoredLocation && new RegExp("^s3://").test(elem.StoredLocation)) {
            // Extract a file name from s3 url
            const temp = elem.StoredLocation.replace(/^s3:\/\//, "").split("/").slice(1).join("/").split("/");
            const filename = temp[temp.length - 1];
            // Update the function code
            await lambda.updateCode(functionName, (0, path_1.join)(CODE_DIR, filename));
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
exports.publishLambdaVersions = publishLambdaVersions;
