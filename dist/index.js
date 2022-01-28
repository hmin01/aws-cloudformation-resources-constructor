"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueues = exports.createTopics = exports.setEventSourceMappings = exports.createLambdaFunctions = exports.createRoles = exports.createPolicies = exports.createTables = exports.loadJsonFile = void 0;
const fs_1 = require("fs");
// Resources
const dynamodb_1 = require("./resources/dynamodb");
const iam_1 = require("./resources/iam");
const lambda_1 = require("./resources/lambda");
const sns_1 = require("./resources/sns");
const sqs_1 = require("./resources/sqs");
// Util
const cache_1 = require("./utils/cache");
const util_1 = require("./utils/util");
/** For Util */
/**
 * Load a json data (configuration)
 * @param filePath file path
 * @returns loaded data
 */
function loadJsonFile(filePath) {
    try {
        // Read a file ata
        const data = (0, fs_1.readFileSync)(filePath).toString();
        // Transform to json and return data
        return JSON.parse(data);
    }
    catch (err) {
        // Print error message
        if (typeof err === "string" || err instanceof Error) {
            console.error(`[ERROR] ${err}`);
        }
        // Exit
        process.exit(1);
    }
}
exports.loadJsonFile = loadJsonFile;
/** For Amazon DynamoDB */
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
function createTables(scope, config) {
    for (const tableName of Object.keys(config)) {
        // Get a configuration for table
        const elem = config[tableName];
        // Create a table
        const table = new dynamodb_1.Table(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("dynamodb", tableName, table);
    }
}
exports.createTables = createTables;
/** For Amazon IAM */
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
function createPolicies(scope, config) {
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
exports.createPolicies = createPolicies;
/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
function createRoles(scope, config) {
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
exports.createRoles = createRoles;
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
        let alias = null;
        let version = null;
        let storedLocation = null;
        // Extract the most recent version number
        for (const obj of elem.Versions) {
            if (version === null && obj.Version !== "$LATEST") {
                version = obj;
            }
            else {
                obj.Version !== "$LATEST" && Number(version.Version) < Number(obj.Version) ? version = obj : null;
            }
        }
        // Extract a configuration for alias that refer to the version
        if (version !== null) {
            for (const obj of elem.Aliases) {
                if (Number(obj.FunctionVersion) === Number(version.Version)) {
                    alias = obj;
                    break;
                }
            }
        }
        // Set a code for function
        if (version !== null) {
            storedLocation = version.StoredLocation;
        }
        else {
            storedLocation = elem.StoredLocation;
        }
        // Create a function
        const lambdaFunction = new lambda_1.Function(scope, elem.Configuration, storedLocation);
        // Store the resource
        (0, cache_1.storeResource)("lambda", elem.Configuration.FunctionName, lambdaFunction);
        // If there's a recent version
        if (version !== null) {
            // Create a version
            lambdaFunction.createVersion(version);
            // Create an alias
            lambdaFunction.createAlias(alias);
        }
    }
}
exports.createLambdaFunctions = createLambdaFunctions;
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
function setEventSourceMappings(config) {
    for (const eventSourceMappingId of Object.keys(config)) {
        // Get a configuration for event source mapping
        const elem = config[eventSourceMappingId];
        // Get a function
        const lambdaFunction = (0, cache_1.getResource)("lambda", (0, util_1.extractDataFromArn)(elem.FunctionArn, "resource"));
        // Set the event source mapping
        lambdaFunction.setEventSourceMapping(elem);
    }
}
exports.setEventSourceMappings = setEventSourceMappings;
/** For Amazon SNS */
/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
function createTopics(scope, config) {
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
exports.createTopics = createTopics;
/** For Amazonz SQS */
/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
function createQueues(scope, config) {
    for (const queueArn of Object.keys(config)) {
        // Extract a name from arn
        const queueName = (0, util_1.extractDataFromArn)(queueArn, "resource");
        // Get a configuration for queue
        const elem = config[queueArn];
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
exports.createQueues = createQueues;
