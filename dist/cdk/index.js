"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSQSQueues = exports.createSNSTopics = exports.createLambdaFunctions = exports.createIAMRoles = exports.createIAMPolicies = exports.createDynamoDBTables = exports.createCognitoUserPool = exports.createCloudFrontDistributions = exports.createCloudFrontPolicies = exports.createRestApi = void 0;
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
        // Create the authorizers
        for (const data of elem.Authorizers) {
            restApi.createAuthorizer(data);
        }
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
            // Get an id for policy
            const id = elem.CachePolicy.Id;
            // Create a cache policy
            const policy = new cloudFront_1.CachePolicy(scope, id, elem.CachePolicy.CachePolicyConfig);
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-cachepolicy", id, policy);
        }
    }
    // Create the origin request policies
    for (const elem of config.OriginRequestPolicy) {
        if (elem.Type !== "managed") {
            // Get an id for policy
            const id = elem.CachePolicy.Id;
            // Create a cache policy
            const policy = new cloudFront_1.OriginRequestPolicy(scope, id, elem.OriginRequestPolicy.OriginRequestPolicyConfig);
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-originrequestpolicy", id, policy);
        }
    }
    // Create the response header policies
    for (const elem of config.ResponseHeadersPolicy) {
        if (elem.Type !== "managed") {
            // Get an id for policy
            const id = elem.CachePolicy.Id;
            // Create a cache policy
            const policy = new cloudFront_1.ResponseHeadersPolicy(scope, id, elem.ResponseHeadersPolicy.ResponseHeadersPolicyConfig);
            ;
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-responseheaderspolicy", id, policy);
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
        const distribution = new cloudFront_1.Distribution(scope, elem.DistributionConfig, "arn:aws:acm:us-east-1:395824177941:certificate/fd729d07-657c-4b43-b17a-1035e5489f56");
        // Store the resource
        (0, cache_1.storeResource)("cloudfront-distribution", distributionId, distribution);
    }
}
exports.createCloudFrontDistributions = createCloudFrontDistributions;
/** For Amazon Cognito */
/**
 * Create the cognito user pool
 * @param scope scope context
 * @param config configuration for user pool
 */
function createCognitoUserPool(scope, config) {
    for (const userPoolId of Object.keys(config)) {
        // Get a configuration for user pool
        const elem = config[userPoolId];
        // Create a user pool
        const userPool = new cognito_1.UserPool(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("userpool", userPoolId, userPool);
        // Configurate the email
        userPool.configurateEmail(elem);
        // Configurate the schema
        userPool.configurateSchema(elem.SchemaAttributes);
        // Add the user pool clients
        for (const client of elem.UserPoolClients) {
            userPool.addClient(client);
        }
    }
}
exports.createCognitoUserPool = createCognitoUserPool;
/** For Amazon DynamoDB */
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
function createDynamoDBTables(scope, config) {
    for (const tableName of Object.keys(config)) {
        // Get a configuration for table
        const elem = config[tableName];
        // Create a table
        const table = new dynamodb_1.Table(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("dynamodb", tableName, table);
    }
}
exports.createDynamoDBTables = createDynamoDBTables;
/** For Amazon IAM */
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
function createIAMPolicies(scope, config) {
    for (const policyArn of Object.keys(config)) {
        // Get an account id from arn
        const accountId = (0, util_1.extractDataFromArn)(policyArn, "account");
        // Create policies that are not managed by aws.
        if (accountId !== "aws") {
            // Get a configuration for policy
            const elem = config[policyArn];
            // Create a policy
            const policy = new iam_1.Policy(scope, elem);
            // Store the resource
            (0, cache_1.storeResource)("policy", elem.PolicyName, policy);
        }
    }
}
exports.createIAMPolicies = createIAMPolicies;
/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
function createIAMRoles(scope, config) {
    for (const roleId of Object.keys(config)) {
        // Get a configuration for role
        const elem = config[roleId];
        // Create a role
        const role = new iam_1.Role(scope, elem.Role);
        // Store the resource
        (0, cache_1.storeResource)("role", elem.Role.RoleName, role);
        // Associate the managed policies
        role.associateManagedPolicies(elem.AttachedPolicies);
        // Set the inline policies
        for (const policyName of Object.keys(elem.Policies)) {
            role.setInlinePolicy(policyName, elem.Policies[policyName]);
        }
    }
}
exports.createIAMRoles = createIAMRoles;
/** For AWS Lambda */
/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
function createLambdaFunctions(scope, config) {
    for (const functionName of Object.keys(config)) {
        // Get a configuration for function
        const elem = config[functionName];
        // Create a function
        const lambdaFunction = new lambda_1.Function(scope, elem.Configuration, elem.StoredLocation);
        // Store the resource
        (0, cache_1.storeResource)("lambda", elem.Configuration.FunctionName, lambdaFunction);
    }
}
exports.createLambdaFunctions = createLambdaFunctions;
// /**
//  * Set the event source mappings
//  * @param config configuration for event source mappings
//  */
// export function setLambdaEventSourceMappings(config: any): void {
//   for (const eventSourceMappingId of Object.keys(config)) {
//     // Get a configuration for event source mapping
//     const elem: any = config[eventSourceMappingId];
//     // Get a function
//     const lambdaFunction = getResource("lambda", extractDataFromArn(elem.FunctionArn, "resource"));
//     // Set the event source mapping
//     lambdaFunction.setEventSourceMapping(elem);
//   }
// }
/** For Amazon SNS */
/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
function createSNSTopics(scope, config) {
    for (const topicArn of Object.keys(config)) {
        // Extract a name from arn
        const topicName = (0, util_1.extractDataFromArn)(topicArn, "resource");
        // Get a configuration for topic
        const elem = config[topicArn];
        // Create a topic
        const topic = new sns_1.Topic(scope, elem.Attributes);
        // Store the resource
        (0, cache_1.storeResource)("sns", topicName, topic);
        // Set the tags
        if (elem.Tags !== undefined && elem.Tags !== null && Object.keys(elem.Tags).length > 0) {
            topic.setTags(elem.Tags);
        }
    }
}
exports.createSNSTopics = createSNSTopics;
/** For Amazonz SQS */
/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
function createSQSQueues(scope, config) {
    for (const queueUrl of Object.keys(config)) {
        // Extract a name from url
        const split = queueUrl.split("/");
        const queueName = split[split.length - 1];
        // Get a configuration for queue
        const elem = config[queueUrl];
        // Create a queue
        const queue = new sqs_1.Queue(scope, elem.Attributes);
        // Store the resource
        (0, cache_1.storeResource)("sqs", queueName, queue);
        // Set the tags
        if (elem.Tags !== undefined && elem.Tags !== null && Object.keys(elem.Tags).length > 0) {
            queue.setTags(elem.Tags);
        }
        // Set a policy
        if (elem.PolicyObject !== undefined && elem.PolicyObject !== null && Object.keys(elem.PolicyOjbect).length > 0) {
            queue.setPolicy(elem.PolicyOjbect);
        }
    }
}
exports.createSQSQueues = createSQSQueues;
