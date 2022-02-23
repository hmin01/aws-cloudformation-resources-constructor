"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishLambdaVersions = exports.downloadLambdaCodeFromS3 = exports.createLambdaEventSourceMappings = exports.createLambdaAliases = exports.createCognitoUserPoolClients = exports.setCognitoUserPool = exports.deployAPIGatewayStage = exports.configureAPIGatewayMethods = exports.configeAPIGatewayAuthorizers = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
// Responses
const response_1 = require("../models/response");
// Services (SDK) - new
const apigateway_1 = require("./services/apigateway");
const cognito_1 = require("./services/cognito");
const lambda_1 = require("./services/lambda");
const s3_1 = require("./services/s3");
const sts_1 = require("./services/sts");
// Util
const util_1 = require("../utils/util");
// Set the directory for stored lambda function codes
const CODE_DIR = (0, path_1.join)(__dirname, "../../resources/code");
// /** For APIGateway */
/**
 * Configure the authorizers
 * @param restApiName rest api name
 * @param config configuration for authorizers
 * @returns mapping data for authorizer
 */
async function configeAPIGatewayAuthorizers(restApiName, config) {
    // Create a sdk object for amazon apigateway
    const apigateway = new apigateway_1.APIGatewaySdk({ region: process.env.TARGET_REGION });
    // Get a rest api id
    const restApiId = await apigateway.getRestApiId(restApiName);
    // Catch error
    if (restApiId === "") {
        (0, response_1.catchError)(response_1.CODE.ERROR.COMMON.NOT_FOUND_ID, true, restApiName);
    }
    // Create a sdk object for amazon sts
    const sts = new sts_1.STSSdk({ region: process.env.TARGET_REGION });
    // Get a credentials for origin account
    let credentials = undefined;
    if (process.env.ASSUME_ROLE_ARN) {
        credentials = await sts.assumeRole("describeOriginAccountServices", process.env.ASSUME_ROLE_ARN);
    }
    // Destory a sdk object for amazon sts
    sts.destroy();
    // Create a sdk object for amazon cognito
    const cognito = new cognito_1.CognitoSdk({ region: process.env.TARGET_REGION });
    // Create a sdk object for aws lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.TARGET_REGION });
    // Set a mapping data for authorizer
    const mapping = {};
    // Create the authorizers
    for (const elem of config) {
        // Copy a configuration for authorizer
        const authConfig = JSON.parse(JSON.stringify(elem));
        // Extract an authorizer uri or provider arns by auth type
        if (authConfig.type.includes("COGNITO")) {
            if (authConfig.providerARNs) {
                const providerARNs = [];
                for (const arn of authConfig.providerARNs) {
                    if (credentials) {
                        // Extract a region from arn
                        const region = (0, util_1.extractDataFromArn)(arn, "region");
                        // Create a params for sdk client
                        const params = {
                            credentials: credentials,
                            region: region
                        };
                        // Create a sdk object for amazon cognito (temporary)
                        const tempCognito = new cognito_1.CognitoSdk(params);
                        // Extract a user pool id
                        const prevUserPoolId = (0, util_1.extractDataFromArn)(arn, "resource");
                        if (prevUserPoolId === "") {
                            (0, response_1.catchError)(response_1.CODE.ERROR.COMMON.NOT_FOUND_ID, true, arn);
                        }
                        // Get a user pool name
                        const userPoolName = await tempCognito.getUserPoolName(prevUserPoolId);
                        if (userPoolName === "") {
                            (0, response_1.catchError)(response_1.CODE.ERROR.COMMON.NOT_FOUND_NAME, true, prevUserPoolId);
                        }
                        // Get a user pool id
                        const userPoolId = await cognito.getUserPoolId(userPoolName);
                        if (userPoolId === "") {
                            (0, response_1.catchError)(response_1.CODE.ERROR.COMMON.NOT_FOUND_ID, true, userPoolName);
                        }
                        // Get a user pool arn
                        let userPoolArn = await cognito.getUserPoolArn(userPoolId);
                        if (userPoolArn === "") {
                            (0, response_1.catchError)(response_1.CODE.ERROR.COMMON.NOT_FOUND_ID, false, userPoolId);
                            // Set a previouse user pool arn
                            userPoolArn = arn;
                        }
                        // Set a provider arns
                        providerARNs.push(userPoolArn);
                        // Destroy a sdk object for amazon cognito (temporary)
                        tempCognito.destroy();
                    }
                    else {
                        providerARNs.push(arn);
                    }
                }
                // Set a provider arns
                authConfig.providerARNs = providerARNs.length > 0 ? providerARNs : undefined;
            }
        }
        else {
            // Extract a lambda function name and qualifier(version or alias) from arn
            const functionName = (0, util_1.extractDataFromArn)(authConfig.authorizerUri, "resource");
            const qualifier = (0, util_1.extractDataFromArn)(authConfig.authorizerUri, "qualifier");
            // Get a function arn
            const functionArn = await lambda.getFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
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
exports.configeAPIGatewayAuthorizers = configeAPIGatewayAuthorizers;
/**
 * Configure the methods in rest api
 * @param restApiName rest api name
 * @param config configuration for methods
 */
async function configureAPIGatewayMethods(restApiName, config, authMapping) {
    // Create a sdk object for amazon apigateway
    const apigateway = new apigateway_1.APIGatewaySdk({ region: process.env.TARGET_REGION });
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
                // Extract a configuration for method
                const methodConfig = elem.resourceMethods[method];
                // Extrac the configurations
                const configForIntegration = methodConfig.methodIntegration;
                const configForResponse = methodConfig.methodResponses;
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
                    methodConfig.authorizerId = authMapping[methodConfig.authorizerId];
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
exports.configureAPIGatewayMethods = configureAPIGatewayMethods;
/**
 * Deploy a stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
async function deployAPIGatewayStage(restApiName, config) {
    // Create a sdk object for amazon apigateway
    const apigateway = new apigateway_1.APIGatewaySdk({ region: process.env.TARGET_REGION });
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
    // Creaet a sdk object for cognito
    const cognito = new cognito_1.CognitoSdk({ region: process.env.TARGET_REGION });
    // Get a user pool id for name
    const userPoolId = await cognito.getUserPoolId(name);
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
        const emailConfig = JSON.parse(JSON.stringify(config.EmailConfiguration));
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
exports.setCognitoUserPool = setCognitoUserPool;
/**
 * Create the cognito user pool clients
 * @param name user pool name
 * @param config configuration for user pool clients
 */
async function createCognitoUserPoolClients(name, clientConfigs, uiConfigs) {
    // Creaet a sdk object for cognito
    const cognito = new cognito_1.CognitoSdk({ region: process.env.TARGET_REGION });
    // Get a user pool id for name
    const userPoolId = await cognito.getUserPoolId(name);
    if (userPoolId === "") {
        console.error(`[ERROR] Not found a user pool id (for ${name})`);
        process.exit(55);
    }
    // Create the user pool clients
    for (const elem of clientConfigs) {
        // Create a user pool client
        const clientId = await cognito.createUserPoolClient(userPoolId, elem);
        // Set a ui customization
        if (clientId && uiConfigs) {
            // Extract the ui customization data
            let uiData = undefined;
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
exports.createCognitoUserPoolClients = createCognitoUserPoolClients;
/** For Lambda */
/**
 * Create the lambda function aliases
 * @param functionName function name
 * @param config configuration for aliases
 * @param mapVersion mapping data for version
 */
async function createLambdaAliases(functionName, config, mapVersion) {
    // Create a sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.TARGET_REGION });
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
exports.createLambdaAliases = createLambdaAliases;
/**
 * Create the event source mappings
 * @param config configuration for event source mappings
 */
async function createLambdaEventSourceMappings(config) {
    // Create a sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.TARGET_REGION });
    // Create the event source mappings
    for (const mappingId of Object.keys(config)) {
        await lambda.createEventSourceMapping(config[mappingId]);
    }
    // Destroy a sdk object for lambda
    lambda.destroy();
}
exports.createLambdaEventSourceMappings = createLambdaEventSourceMappings;
/**
 * Download a lambda code from s3
 * @param region region to create a s3 client
 * @param s3Url s3 url
 * @param outputDir output directory path (default: /resources/code)
 */
async function downloadLambdaCodeFromS3(region, s3Url, outputDir) {
    // Check a url format
    if (!new RegExp("^s3://").test(s3Url)) {
        console.warn("[WARNING] Not match the s3 url format");
        return false;
    }
    // Create a sdk object for s3
    const s3 = new s3_1.S3Sdk({ region });
    // Get a s3 object
    const obj = await s3.getObjectByUrl(s3Url);
    // Checking the existence of a directory (if there's none, create it)
    const oPath = outputDir ? outputDir : CODE_DIR;
    if (!(0, fs_1.existsSync)(oPath)) {
        (0, fs_1.mkdirSync)(oPath, { recursive: true });
    }
    // Write data
    obj.data.pipe((0, fs_1.createWriteStream)((0, path_1.join)(oPath, obj.filename))).on("close", () => s3.destroy());
    // Return
    return true;
}
exports.downloadLambdaCodeFromS3 = downloadLambdaCodeFromS3;
/**
 * Publish the lambda function versions
 * @param functionName function name
 * @param config configuration for versions
 * @param dirPath path to the directory where the code is stored (default /resources/code)
 * @returns mapping data for version
 */
async function publishLambdaVersions(functionName, config, dirPath) {
    // Create a sdk object for lambda
    const lambda = new lambda_1.LambdaSdk({ region: process.env.TARGET_REGION });
    // Set a version mapping data
    const mapVersion = {};
    // Publish the lambda function versions
    for (const elem of config) {
        if (elem.Version !== "$LATEST" && elem.StoredLocation && new RegExp("^s3://").test(elem.StoredLocation)) {
            // Extract a file name from s3 url
            const temp = elem.StoredLocation.replace(/^s3:\/\//, "").split("/").slice(1).join("/").split("/");
            const filename = temp[temp.length - 1];
            // Update the function code
            await lambda.updateCode(functionName, (0, path_1.join)(dirPath ? dirPath : CODE_DIR, filename));
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
