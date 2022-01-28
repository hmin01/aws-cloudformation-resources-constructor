import { Construct } from "constructs";
import { readFileSync } from "fs";
// Resources
import { Table } from "./resources/dynamodb";
import { Policy, Role } from "./resources/iam";
import { Function } from "./resources/lambda";
import { Topic } from "./resources/sns";
import { Queue } from "./resources/sqs";
// Util
import { getResource, storeResource } from "./utils/cache";
import { extractDataFromArn } from "./utils/util";

/** For Util */
/**
 * Load a json data (configuration)
 * @param filePath file path
 * @returns loaded data
 */
 export function loadJsonFile(filePath: string) {
  try {
    // Read a file ata
    const data = readFileSync(filePath).toString();
    // Transform to json and return data
    return JSON.parse(data);
  } catch (err) {
    // Print error message
    if (typeof err === "string" || err instanceof Error) {
      console.error(`[ERROR] ${err}`);
    }
    // Exit
    process.exit(1);
  }
}

/** For Amazon DynamoDB */
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
 export function createTables(scope: Construct, config: any) {
  for (const tableName of Object.keys(config)) {
    // Get a configuration for table
    const elem: any = config[tableName];
    // Create a table
    const table: Table = new Table(scope, elem);
    // Store the resource
    storeResource("dynamodb", tableName, table);
  }
}

/** For Amazon IAM */
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
 export function createPolicies(scope: Construct, config: any) {
  for (const policyArn of Object.keys(config)) {
    // Get an account id from arn
    const accountId: string = extractDataFromArn(policyArn, "account");
    // Create policies that are not managed by aws.
    if (accountId !== "aws") {
      // Get a configuration for policy
      const elem: any = config[policyArn];
      // Create a policy
      const policy: Policy = new Policy(scope, elem);
      // Store the resource
      storeResource("policy", elem.PolicyName, policy);
    }
  }
}
/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
export function createRoles(scope: Construct, config: any) {
  for (const roleId of Object.keys(config)) {
    // Get a configuration for role
    const elem: any = config[roleId];
    // Create a role
    const role = new Role(scope, elem.Role);
    // Store the resource
    storeResource("role", elem.Role.RoleName, role);

    // Associate the managed policies
    role.associateManagedPolicies(elem.AttachedPolicies);
    // Set the inline policies
    for (const policyName of Object.keys(elem.Policies)) {
      role.setInlinePolicy(policyName, elem.Policies[policyName]);
    }
  }
}

/** For AWS Lambda */
/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
 export function createLambdaFunctions(scope: Construct, config: any): void {
  for (const functionName of Object.keys(config)) {
    // Get a configuration for function
    const elem: any = config[functionName];

    let alias: any = null;
    let version: any = null;
    let storedLocation: any = null;
    // Extract the most recent version number
    for (const obj of elem.Versions) {
      if (version === null && obj.Version !== "$LATEST") {
        version = obj;
      } else {
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
    } else {
      storedLocation = elem.StoredLocation;
    }

    // Create a function
    const lambdaFunction: Function = new Function(scope, elem.Configuration, storedLocation);
    // Store the resource
    storeResource("lambda", elem.Configuration.FunctionName, lambdaFunction);
    // If there's a recent version
    if (version !== null) {
      // Create a version
      lambdaFunction.createVersion(version)
      // Create an alias
      lambdaFunction.createAlias(alias);
    }
  }
}
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
export function setEventSourceMappings(config: any): void {
  for (const eventSourceMappingId of Object.keys(config)) {
    // Get a configuration for event source mapping
    const elem: any = config[eventSourceMappingId];
    // Get a function
    const lambdaFunction = getResource("lambda", extractDataFromArn(elem.FunctionArn, "resource"));
    // Set the event source mapping
    lambdaFunction.setEventSourceMapping(elem);
  }
}

/** For Amazon SNS */
/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
 export function createTopics(scope: Construct, config: any) {
  for (const topicArn of Object.keys(config)) {
    // Extract a name from arn
    const topicName: string = extractDataFromArn(topicArn, "resource");
    // Get a configuration for topic
    const elem: any = config[topicArn];
    // Create a topic
    const topic: Topic = new Topic(scope, elem.Attributes);
    // Store the resource
    storeResource("sns", topicName, topic);

    // Set the tags
    if (elem.Tags !== undefined && elem.Tags !== null && Object.keys(elem.Tags).length > 0) {
      topic.setTags(elem.Tags);
    }
  }
}

/** For Amazonz SQS */
/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
 export function createQueues(scope: Construct, config: any) {
  for (const queueArn of Object.keys(config)) {
    // Extract a name from arn
    const queueName: string = extractDataFromArn(queueArn, "resource");
    // Get a configuration for queue
    const elem: any = config[queueArn];
    // Create a queue
    const queue: Queue = new Queue(scope, elem.Attributes);
    // Store the resource
    storeResource("sqs", queueName, queue);

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
