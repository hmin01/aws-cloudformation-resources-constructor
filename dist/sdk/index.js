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
exports.setEventSourceMappings = exports.createLambdaVersionsAndAliases = exports.createCognitoUserPoolClients = exports.setCognitoUserPool = exports.deployAPIGatewayStage = exports.setAPIGatewayMethods = exports.initSdkClients = exports.destroySdkClients = void 0;
// Services (SDK)
const SDKAPIGateway = __importStar(require("./services/apigateway"));
const SDKCognito = __importStar(require("./services/cognito"));
const SDKDynomoDB = __importStar(require("./services/dynamodb"));
const SDKLambda = __importStar(require("./services/lambda"));
const SDKSqs = __importStar(require("./services/sqs"));
// Utile
const util_1 = require("../utils/util");
/** For Util */
/**
 * Destroy the sdk clients
 */
function destroySdkClients() {
    SDKAPIGateway.destroyAPIGatewayClient();
    SDKCognito.destroyCognitoClient();
    SDKDynomoDB.destroyDyanmoDBClient();
    SDKLambda.destroyLambdaClient();
    SDKSqs.destroySqsClient();
}
exports.destroySdkClients = destroySdkClients;
/**
 * Init the sdk clients
 */
function initSdkClients() {
    SDKAPIGateway.initAPIGatewayClient();
    SDKCognito.initCognitoClient();
    SDKDynomoDB.initDynamoDBClient();
    SDKLambda.initLambdaClient();
    SDKSqs.initSqsClient();
}
exports.initSdkClients = initSdkClients;
/** For APIGateway */
/**
 * Set the method integrations
 * @param name api name
 * @param config configuration for api
 */
async function setAPIGatewayMethods(name, config) {
    // Get an api id
    const restApiId = await SDKAPIGateway.getRestApiId(name);
    if (restApiId === "") {
        console.error(`[ERROR] Not found api id (for ${name})`);
        process.exit(1);
    }
    // Set the methods
    for (const elem of config) {
        // Get a resource id
        const resourceId = await SDKAPIGateway.getResourceId(restApiId, elem.path);
        if (resourceId === "") {
            console.error(`[ERROR] Not found resource id (for ${elem.path})`);
            break;
        }
        // Set a method
        if (elem.resourceMethods !== undefined) {
            for (const method of Object.keys(elem.resourceMethods)) {
                const configForIntegration = elem.resourceMethods[method].methodIntegration;
                const configForResponse = elem.resourceMethods[method].methodResponses;
                // Put the method integration
                await SDKAPIGateway.putMethodIntegration(restApiId, resourceId, method, configForIntegration);
                // Put the method response
                await SDKAPIGateway.putMethodResponse(restApiId, resourceId, method, configForResponse);
                // Put the method integration response
                await SDKAPIGateway.putMethodIntegrationResponse(restApiId, resourceId, method, configForIntegration !== undefined ? configForIntegration.integrationResponses : undefined);
                // Print console
                console.info(`[NOTICE] Put the method (for ${method} ${elem.path})`);
            }
        }
    }
}
exports.setAPIGatewayMethods = setAPIGatewayMethods;
/**
 * Deploy the API Gateway stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
async function deployAPIGatewayStage(name, config) {
    // Get an api id
    const restApiId = await SDKAPIGateway.getRestApiId(name);
    if (restApiId === "") {
        console.error(`[ERROR] Not found api id (for ${name})`);
        process.exit(1);
    }
    // Process
    for (const elem of config) {
        // Create the deployment
        const deployment = await SDKAPIGateway.createDeployment(restApiId);
        // Create the stage
        await SDKAPIGateway.createStage(restApiId, deployment, elem);
        // Print message
        console.info(`[NOTICE] Deploy the stage (for ${name})`);
    }
}
exports.deployAPIGatewayStage = deployAPIGatewayStage;
/** For Cognito */
/**
 * Set a cognito user pool configuration
 * @param name user pool name
 * @param config configuration for user pool
 */
async function setCognitoUserPool(name, config) {
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
            const lambdaArn = await SDKLambda.getLambdaFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
            // Set the lambda configuration
            if (lambdaArn !== "") {
                lambdaConfig[key] = lambdaArn;
            }
        }
        // Update
        await SDKCognito.updateLambdaConfiguration(userPoolId, lambdaConfig);
        console.info(`[NOTICE] Set the lambda configuration for user pool (for ${name})`);
    }
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
 * Create the versions and aliases for lambda
 * @param config configuration for versions and aliases for lambda
 */
async function createLambdaVersionsAndAliases(config) {
    // Update function code and publish versions
    for (const elem of config.Versions) {
        await SDKLambda.publishVersion(elem);
    }
    // Create the aliases
    for (const elem of config.Aliases) {
        await SDKLambda.createAlias(elem);
    }
}
exports.createLambdaVersionsAndAliases = createLambdaVersionsAndAliases;
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
async function setEventSourceMappings(config) {
    for (const mappingId of Object.keys(config)) {
        await SDKLambda.setEventSourceMapping(config[mappingId]);
    }
}
exports.setEventSourceMappings = setEventSourceMappings;
