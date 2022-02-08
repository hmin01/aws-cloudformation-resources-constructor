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
exports.setEventSourceMappings = exports.createLambdaVersionsAndAliases = exports.setAPIGatewayMethodIntegrations = exports.initSdkClients = exports.destroySdkClients = void 0;
// Services (SDK)
const SDKAPIGateway = __importStar(require("./services/apigateway"));
const SDKDynomoDB = __importStar(require("./services/dynamodb"));
const SDKLambda = __importStar(require("./services/lambda"));
const SDKSqs = __importStar(require("./services/sqs"));
/** For Util */
/**
 * Destroy the sdk clients
 */
function destroySdkClients() {
    SDKAPIGateway.destroyAPIGatewayClient();
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
async function setAPIGatewayMethodIntegrations(name, config) {
    for (const elem of config) {
        if (elem.resourceMethods !== undefined) {
            for (const method of Object.keys(elem.resourceMethods)) {
                if (elem.resourceMethods[method].methodIntegration !== undefined) {
                    await SDKAPIGateway.putMethodIntegration(name, elem.path, method, elem.resourceMethods[method].methodIntegration);
                }
            }
        }
    }
}
exports.setAPIGatewayMethodIntegrations = setAPIGatewayMethodIntegrations;
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
