import { Construct } from "constructs";
import { readFileSync } from "fs";
// Resources (CDK)
import { RestApi } from "./services/apigateway ";
import { CachePolicy, Distribution, OriginRequestPolicy, ResponseHeadersPolicy } from "./services/cloudFront";
import { UserPool } from "./services/cognito";
import { Table } from "./services/dynamodb";
import { Policy, Role } from "./services/iam";
import { Function } from "./services/lambda";
import { Topic } from "./services/sns";
import { Queue } from "./services/sqs";
// Util
import { getResource, storeResource } from "../utils/cache";
import { extractDataFromArn } from "../utils/util";

/** For Amazon APIGateway */
/**
 * Create the rest api
 * @param scope scope context
 * @param config configuration for rest api
 */
export function createRestApi(scope: Construct, config: any) {
  for (const elem of config) {
    // Create a rest api
    const restApi: RestApi = new RestApi(scope, elem);
    // Store the resource
    storeResource("restApi", elem.name, restApi);

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

/** For Amazon CloudFront */
/**
 * Create the policies for cloudFront
 * @param scope scope context
 * @param config configuration for each policies
 */
export function createCloudFrontPolicies(scope: Construct, config: any) {
  // Create the cache policies
  for (const elem of config.CachePolicy) {
    if (elem.Type !== "managed") {
      // Get an id for policy
      const id: string = elem.CachePolicy.Id;
      // Create a cache policy
      const policy: CachePolicy = new CachePolicy(scope, id, elem.CachePolicy.CachePolicyConfig);
      // Set the resource
      storeResource("cloudfront-cachepolicy", id, policy);
    }
  }
  // Create the origin request policies
  for (const elem of config.OriginRequestPolicy) {
    if (elem.Type !== "managed") {
      // Get an id for policy
      const id: string = elem.CachePolicy.Id;
      // Create a cache policy
      const policy: OriginRequestPolicy = new OriginRequestPolicy(scope, id, elem.OriginRequestPolicy.OriginRequestPolicyConfig);
      // Set the resource
      storeResource("cloudfront-originrequestpolicy", id, policy);
    }
  }
  // Create the response header policies
  for (const elem of config.ResponseHeadersPolicy) {
    if (elem. Type !== "managed") {
      // Get an id for policy
      const id: string = elem.CachePolicy.Id;
      // Create a cache policy
      const policy: ResponseHeadersPolicy = new ResponseHeadersPolicy(scope, id, elem.ResponseHeadersPolicy.ResponseHeadersPolicyConfig);;
      // Set the resource
      storeResource("cloudfront-responseheaderspolicy", id, policy);
    }
  }
}
/**
 * Create the distributions
 * @param scope scope context
 * @param config configuration for distributions
 */
export function createCloudFrontDistributions(scope: Construct, config: any) {
  for (const distributionId of Object.keys(config)) {
    // Get a configuration for distribution
    const elem: any = config[distributionId];
    // Create a distribution
    const distribution: Distribution = new Distribution(scope, elem.DistributionConfig, "arn:aws:acm:us-east-1:395824177941:certificate/fd729d07-657c-4b43-b17a-1035e5489f56");
    // Store the resource
    storeResource("cloudfront-distribution", distributionId, distribution);
  }
}

/** For Amazon Cognito */
/**
 * Create the cognito user pool
 * @param scope scope context
 * @param config configuration for user pool
 */
export function createCognitoUserPool(scope: Construct, config: any) {
  for (const userPoolId of Object.keys(config)) {
    // Get a configuration for user pool
    const elem: any = config[userPoolId];
    // Create a user pool
    const userPool: UserPool = new UserPool(scope, elem);
    // Store the resource
    storeResource("userpool", userPoolId, userPool);

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

/** For Amazon DynamoDB */
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
 export function createDynamoDBTables(scope: Construct, config: any) {
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
 export function createIAMPolicies(scope: Construct, config: any) {
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
export function createIAMRoles(scope: Construct, config: any) {
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

    // Create a function
    const lambdaFunction: Function = new Function(scope, elem.Configuration, elem.StoredLocation);
    // Store the resource
    storeResource("lambda", elem.Configuration.FunctionName, lambdaFunction);
  }
}
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
 export function createSNSTopics(scope: Construct, config: any) {
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
 export function createSQSQueues(scope: Construct, config: any) {
  for (const queueUrl of Object.keys(config)) {
    // Extract a name from url
    const split: string[] = queueUrl.split("/");
    const queueName: string = split[split.length - 1];
    // Get a configuration for queue
    const elem: any = config[queueUrl];
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