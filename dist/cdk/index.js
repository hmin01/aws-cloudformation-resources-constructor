"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSQSQueues = exports.createSQSQueue = exports.createSNSTopics = exports.createSNSTopic = exports.createLambdaFunctions = exports.createLambdaFunction = exports.createIAMRoles = exports.createIAMRole = exports.createIAMPolicies = exports.createIAMPolicy = exports.createDynamoDBTables = exports.createDynamoDBTable = exports.createCognitoUserPools = exports.createCognitoUserPool = exports.createCloudFrontOAI = exports.createCloudFrontDistributions = exports.createCloudFrontPolicies = exports.createRestApi = exports.createAPIGatewayRestApis = exports.createAPIGatewayRestApi = void 0;
// Resources (CDK)
const apigateway_1 = require("./services/apigateway ");
const cloudFront_1 = require("./services/cloudFront");
const cognito_1 = require("./services/cognito");
const dynamodb_1 = require("./services/dynamodb");
const iam_1 = require("./services/iam");
const lambda_1 = require("./services/lambda");
const sns_1 = require("./services/sns");
const sqs_1 = require("./services/sqs");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
/** For Amazon APIGateway */
/**
 * Create an amazon apigateway rest api
 * @param scope scope context
 * @param config configuration for apigateway rest api
 */
function createAPIGatewayRestApi(scope, config) {
    // Create a cloud formation resource for rest api
    const restApi = new apigateway_1.RestApi(scope, config);
    // Create the gateway responses
    if (config.GatewayResponses) {
        for (const elem of config.GatewayResponses) {
            restApi.createGatewayResponse(elem);
        }
    }
    // Create the models
    if (config.Models) {
        for (const elem of config.Models) {
            restApi.createModel(elem);
        }
    }
    // Create the request validators
    if (config.RequestValidators) {
        for (const elem of config.RequestValidators) {
            restApi.createRequestValidator(elem);
        }
    }
    // Create the resources
    if (config.Resources) {
        restApi.createResources(config.Resources);
        // Create the methods
        for (const elem of config.Resources) {
            if (elem.resourceMethods !== undefined) {
                restApi.createMethod(elem.path, elem.resourceMethods);
            }
        }
    }
}
exports.createAPIGatewayRestApi = createAPIGatewayRestApi;
/**
 * Create the amazon apigateway rest apis
 * @param scope scope context
 * @param config configuration for apigateway rest apis
 */
function createAPIGatewayRestApis(scope, config) {
    for (const elem of config) {
        // Create an apigateway rest api
        createAPIGatewayRestApi(scope, elem);
    }
}
exports.createAPIGatewayRestApis = createAPIGatewayRestApis;
/**
 * Create the rest api
 * @param scope scope context
 * @param config configuration for rest api
 */
function createRestApi(scope, config) {
    for (const elem of config) {
        // Create a rest api
        const restApi = new apigateway_1.RestApi(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("restApi", elem.name, restApi);
        // Create the gateway responses
        for (const data of elem.GatewayResponses) {
            restApi.createGatewayResponse(data);
        }
        // Create the models
        for (const data of elem.Models) {
            restApi.createModel(data);
        }
        // Create the request validators
        for (const data of elem.RequestValidators) {
            restApi.createRequestValidator(data);
        }
        // Create the resources
        restApi.createResources(elem.Resources);
        // Create the mothods
        for (const data of elem.Resources) {
            if (data.resourceMethods !== undefined) {
                restApi.createMethod(data.path, data.resourceMethods);
            }
        }
    }
}
exports.createRestApi = createRestApi;
/** For Amazon CloudFront */
/**
 * Create the policies for cloudFront
 * @param scope scope context
 * @param config configuration for each policies
 */
function createCloudFrontPolicies(scope, config) {
    // Create the cache policies
    for (const elem of config.CachePolicy) {
        if (elem.Type !== "managed") {
            // Create a cache policy
            const policy = new cloudFront_1.CachePolicy(scope, elem.CachePolicy.CachePolicyConfig);
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-cachepolicy", elem.CachePolicy.Id, policy);
        }
    }
    // Create the origin request policies
    for (const elem of config.OriginRequestPolicy) {
        if (elem.Type !== "managed") {
            // Create a cache policy
            const policy = new cloudFront_1.OriginRequestPolicy(scope, elem.OriginRequestPolicy.OriginRequestPolicyConfig);
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-originrequestpolicy", elem.OriginRequestPolicy.Id, policy);
        }
    }
    // Create the response header policies
    for (const elem of config.ResponseHeadersPolicy) {
        if (elem.Type !== "managed") {
            // Create a cache policy
            const policy = new cloudFront_1.ResponseHeadersPolicy(scope, elem.ResponseHeadersPolicy.ResponseHeadersPolicyConfig);
            ;
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-responseheaderspolicy", elem.ResponseHeadersPolicy.Id, policy);
        }
    }
}
exports.createCloudFrontPolicies = createCloudFrontPolicies;
/**
 * Create the distributions
 * @param scope scope context
 * @param config configuration for distributions
 */
function createCloudFrontDistributions(scope, config) {
    for (const distributionId of Object.keys(config)) {
        // Get a configuration for distribution
        const elem = config[distributionId];
        // Create a distribution
        const distribution = new cloudFront_1.Distribution(scope, elem.DistributionConfig);
        // Store the resource
        (0, cache_1.storeResource)("cloudfront-distribution", distributionId, distribution);
    }
}
exports.createCloudFrontDistributions = createCloudFrontDistributions;
/**
 * Create the origin access identity
 * @param scope scope context
 * @param config configuration for origin access identity
 */
function createCloudFrontOAI(scope, config) {
    // Create a origin access identiry
    const oai = new cloudFront_1.OriginAccessIdentity(scope, config);
    // Store the resource
    (0, cache_1.storeResource)("cloudfront-oai", config, oai);
}
exports.createCloudFrontOAI = createCloudFrontOAI;
/** For Amazon Cognito */
/**
 * Create an amazon cognito user pool
 * @param scope scope context
 * @param config configuration for cognito user pool
 */
function createCognitoUserPool(scope, config) {
    // Create a cloud formation resource for cognito user pool
    const userPool = new cognito_1.UserPool(scope, config);
    // Create a default domain
    if (config.Domain) {
        userPool.createDefaultDomain(config.Domain);
    }
    // Create the resource servers for user pool
    if (config.ResourceServers) {
        for (const server of config.ResourceServers) {
            userPool.createResourceServer(server);
        }
    }
}
exports.createCognitoUserPool = createCognitoUserPool;
/**
 * Create the amazon cognito user pools
 * @param scope scope context
 * @param config configuration for cognito user pools {"userPoolId": data}
 */
function createCognitoUserPools(scope, config) {
    for (const userPoolId of Object.keys(config)) {
        // Create a cognito user pool
        createCognitoUserPool(scope, config[userPoolId]);
    }
}
exports.createCognitoUserPools = createCognitoUserPools;
/** For Amazon DynamoDB */
/**
 * Create an amazon dynamodb table
 * @param scope scope context
 * @param config configuration for dynamodb table
 */
function createDynamoDBTable(scope, config) {
    // Create a cloud formation resource for dynamodb table
    new dynamodb_1.Table(scope, config);
}
exports.createDynamoDBTable = createDynamoDBTable;
/**
 * Create the amazon dynamodb tables
 * @param scope scope context
 * @param config configuration for dynamodb tables {"tableName": data}
 */
function createDynamoDBTables(scope, config) {
    for (const tableName of Object.keys(config)) {
        // Create a table
        createDynamoDBTable(scope, config[tableName]);
    }
}
exports.createDynamoDBTables = createDynamoDBTables;
/** For Amazon IAM */
/**
 * Create an amazon iam policy
 * @param scope scope context
 * @param config configuration for iam policy
 */
function createIAMPolicy(scope, config) {
    // Create a cloud formation resource for iam policy
    const policy = new iam_1.Policy(scope, config);
    // Store a resource for iam policy
    (0, cache_1.storeResource)("policy", config.PolicyName, policy);
}
exports.createIAMPolicy = createIAMPolicy;
/**
 * Create the amazon iam policies
 * @param scope scope context
 * @param config configuration for iam policies {"policyArn": data}
 */
function createIAMPolicies(scope, config) {
    for (const policyArn of Object.keys(config)) {
        // Extract an account id from arn
        const accountId = (0, util_1.extractDataFromArn)(policyArn, "account");
        // Create the policies that are not managed by aws
        if (accountId === process.env.ORIGIN_ACCOUNT) {
            // Create an iam policy
            createIAMPolicy(scope, config[policyArn]);
        }
    }
}
exports.createIAMPolicies = createIAMPolicies;
/**
 * Create an amazon iam role
 * @param scope scope context
 * @param config configuration for iam role {AttachedPolicies: data, Policies: data, Role: data}
 */
function createIAMRole(scope, config) {
    // Create a cloud formation resource for iam role
    const role = new iam_1.Role(scope, config.Role);
    // Store a resource for iam role
    (0, cache_1.storeResource)("role", config.Role.RoleName, role);
    // Associate the managed policies
    role.associateManagedPolicies(config.AttachedPolicies);
    // Set the inline policies
    if (config.Policies) {
        for (const policyName of Object.keys(config.Policies)) {
            role.setInlinePolicy(policyName, config.Policies[policyName]);
        }
    }
}
exports.createIAMRole = createIAMRole;
/**
 * Create the amazon iam roles
 * @param scope scope context
 * @param config configuration for iam roles {"roleId": data}
 */
function createIAMRoles(scope, config) {
    for (const roleId of Object.keys(config)) {
        // Create an iam role
        createIAMRole(scope, config[roleId]);
    }
}
exports.createIAMRoles = createIAMRoles;
/** For AWS Lambda */
/**
 * Create an aws lambda function
 * @param scope scope context
 * @param config configuration for lambda function
 */
function createLambdaFunction(scope, config) {
    // Create a cloud formation resource for lambda function
    const lambdaFunction = new lambda_1.Function(scope, config);
    // Store a resource for lambda function
    (0, cache_1.storeResource)("lambda", config.FunctionName, lambdaFunction);
}
exports.createLambdaFunction = createLambdaFunction;
/**
 * Create the aws lambda functions
 * @param scope scope context
 * @param config configuration for functions {"functionName": data}
 */
function createLambdaFunctions(scope, config) {
    for (const functionName of Object.keys(config)) {
        // Create a lambda function
        createLambdaFunction(scope, config[functionName].Configuration);
    }
}
exports.createLambdaFunctions = createLambdaFunctions;
/** For Amazon SNS */
/**
 * Create an amazon sns topic
 * @param scope scope context
 * @param config configuration for topic {Attributes: data, Tags: data}
 */
function createSNSTopic(scope, config) {
    // Create a cloud formation resource for sns topic
    const topic = new sns_1.Topic(scope, config.Attributes);
    // Set the tags
    if (config.Tags && config.Tags !== null && Object.keys(config.Tags).length > 0) {
        topic.setTags(config.Tags);
    }
}
exports.createSNSTopic = createSNSTopic;
/**
 * Create the amazon sns topics
 * @param scope scope context
 * @param config configuration for topics {"topicArn": data}
 */
function createSNSTopics(scope, config) {
    for (const topicArn of Object.keys(config)) {
        // Create a sns topic
        createSNSTopic(scope, config[topicArn]);
    }
}
exports.createSNSTopics = createSNSTopics;
/** For Amazonz SQS */
/**
 * Create an amazon queue
 * @param scope scope context
 * @param config configuration for queue {Attributes: data, Tags: data}
 */
function createSQSQueue(scope, config) {
    // Create a cloud formation resource for sqs queue
    const queue = new sqs_1.Queue(scope, config.Attributes);
    // Set a policy
    if (config.Attributes.PolicyObject && config.Attributes.PolicyObject !== null) {
        queue.setPolicy(config.Attributes.PolicyObject);
    }
    // Set the tags
    if (config.Tags && config.Tags !== null && Object.keys(config.Tags).length > 0) {
        queue.setTags(config.Tags);
    }
}
exports.createSQSQueue = createSQSQueue;
/**
 * Create the amazon queues
 * @param scope scope context
 * @param config configuration for queues {"queueUrl": data}
 */
function createSQSQueues(scope, config) {
    for (const queueUrl of Object.keys(config)) {
        // Create a sqs queue
        createSQSQueue(scope, config[queueUrl]);
    }
}
exports.createSQSQueues = createSQSQueues;
