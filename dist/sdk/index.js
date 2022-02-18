"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishLambdaVersions = exports.downloadLambdaCodeFromS3 = exports.createEventSourceMappings = exports.createAliases = exports.createCognitoUserPoolClients = exports.setCognitoUserPool = exports.deployAPIGatewayStage = exports.configureAPIGatewayMethods = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
// Services (SDK) - new
const apigateway_1 = require("./services/apigateway");
const cognito_1 = require("./services/cognito");
const lambda_1 = require("./services/lambda");
const s3_1 = require("./services/s3");
// Set the directory for stored lambda function codes
const CODE_DIR = (0, path_1.join)(__dirname, "../../resources/code");
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
    // Creaet a sdk object for cognito
    const cognito = new cognito_1.CognitoSdk({ region: process.env.REGION });
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
    const cognito = new cognito_1.CognitoSdk({ region: process.env.REGION });
    // Get a user pool id for name
    const userPoolId = await cognito.getUserPoolId(name);
    if (userPoolId === "") {
        console.error(`[ERROR] Not found a user pool id (for ${name})`);
        process.exit(55);
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
        // Create a user pool client
        const clientId = await cognito.createUserPoolClient(userPoolId, elem);
        // Set a ui customization
        if (clientId && uiData) {
            await cognito.setUICustomization(userPoolId, clientId, uiData);
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
 * Download a lambda code from s3
 * @param region region to create a s3 client
 * @param s3Url s3 url
 * @param outputDir output directory path
 */
async function downloadLambdaCodeFromS3(region, s3Url, outputDir) {
    // Create a sdk object for s3
    const s3 = new s3_1.S3Sdk({ region });
    // Get a s3 object
    const obj = await s3.getObjectByUrl(s3Url);
    // Checking the existence of a directory (if there's none, create it)
    if ((0, fs_1.existsSync)(outputDir)) {
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
    }
    // Create a code file path
    const filePath = (0, path_1.join)(outputDir, obj.filename);
    // Create a code file
    (0, fs_1.openSync)(filePath, "w");
    // Write data
    obj.data.pipe((0, fs_1.createWriteStream)(filePath), { end: true });
    // Destroy a sdk object for s3
    s3.destroy();
}
exports.downloadLambdaCodeFromS3 = downloadLambdaCodeFromS3;
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
