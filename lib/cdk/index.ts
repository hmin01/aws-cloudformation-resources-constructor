import { Construct } from "constructs";
// Resources (CDK)
import { RestApi } from "./services/apigateway ";
import { CachePolicy, Distribution, OriginAccessIdentity, OriginRequestPolicy, ResponseHeadersPolicy } from "./services/cloudFront";
import { UserPool } from "./services/cognito";
import { Table } from "./services/dynamodb";
import { Policy, Role } from "./services/iam";
import { Function } from "./services/lambda";
import { Topic } from "./services/sns";
import { Queue } from "./services/sqs";
// Util
import { storeResource } from "../utils/cache";
import { extractDataFromArn } from "../utils/util";

/** For Amazon APIGateway */
/**
 * Create an amazon apigateway rest api
 * @param scope scope context
 * @param config configuration for apigateway rest api
 */
export function createAPIGatewayRestApi(scope: Construct, config: any) {
  // Create a cloud formation resource for rest api
  const restApi: RestApi = new RestApi(scope, config);

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
/**
 * Create the amazon apigateway rest apis
 * @param scope scope context
 * @param config configuration for apigateway rest apis
 */
export function createAPIGatewayRestApis(scope: Construct, config: any) {
  for (const elem of config) {
    // Create an apigateway rest api
    createAPIGatewayRestApi(scope, elem);
  }
}

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
      // Create a cache policy
      const policy: CachePolicy = new CachePolicy(scope, elem.CachePolicy.CachePolicyConfig);
      // Set the resource
      storeResource("cloudfront-cachepolicy", elem.CachePolicy.Id, policy);
    }
  }
  // Create the origin request policies
  for (const elem of config.OriginRequestPolicy) {
    if (elem.Type !== "managed") {
      // Create a cache policy
      const policy: OriginRequestPolicy = new OriginRequestPolicy(scope, elem.OriginRequestPolicy.OriginRequestPolicyConfig);
      // Set the resource
      storeResource("cloudfront-originrequestpolicy", elem.OriginRequestPolicy.Id, policy);
    }
  }
  // Create the response header policies
  for (const elem of config.ResponseHeadersPolicy) {
    if (elem. Type !== "managed") {
      // Create a cache policy
      const policy: ResponseHeadersPolicy = new ResponseHeadersPolicy(scope, elem.ResponseHeadersPolicy.ResponseHeadersPolicyConfig);;
      // Set the resource
      storeResource("cloudfront-responseheaderspolicy", elem.ResponseHeadersPolicy.Id, policy);
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
    const distribution: Distribution = new Distribution(scope, elem.DistributionConfig);
    // Store the resource
    storeResource("cloudfront-distribution", distributionId, distribution);
  }
}
/**
 * Create the origin access identity
 * @param scope scope context
 * @param config configuration for origin access identity
 */
export function createCloudFrontOAI(scope: Construct, config: any) {
  // Create a origin access identiry
  const oai: OriginAccessIdentity = new OriginAccessIdentity(scope, config);
  // Store the resource
  storeResource("cloudfront-oai", config, oai);
}

/** For Amazon Cognito */
/**
 * Create an amazon cognito user pool
 * @param scope scope context
 * @param config configuration for cognito user pool
 */
export function createCognitoUserPool(scope: Construct, config: any) {
  // Create a cloud formation resource for cognito user pool
  const userPool: UserPool = new UserPool(scope, config);
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
/**
 * Create the amazon cognito user pools
 * @param scope scope context
 * @param config configuration for cognito user pools {"userPoolId": data}
 */
export function createCognitoUserPools(scope: Construct, config: any) {
  for (const userPoolId of Object.keys(config)) {
    // Create a cognito user pool
    createCognitoUserPool(scope, config[userPoolId]);
  }
}

/** For Amazon DynamoDB */
/**
 * Create an amazon dynamodb table
 * @param scope scope context
 * @param config configuration for dynamodb table
 */
export function createDynamoDBTable(scope: Construct, config: any): void {
  // Create a cloud formation resource for dynamodb table
  new Table(scope, config);
}
/**
 * Create the amazon dynamodb tables
 * @param scope scope context
 * @param config configuration for dynamodb tables {"tableName": data}
 */
export function createDynamoDBTables(scope: Construct, config: any): void {
  for (const tableName of Object.keys(config)) {
    // Create a table
    createDynamoDBTable(scope, config[tableName]);
  }
}

/** For Amazon IAM */
/**
 * Create an amazon iam policy
 * @param scope scope context
 * @param config configuration for iam policy
 */
export function createIAMPolicy(scope: Construct, config: any): void {
  // Create a cloud formation resource for iam policy
  const policy: Policy = new Policy(scope, config);
  // Store a resource for iam policy
  storeResource("policy", config.PolicyName, policy);
}
/**
 * Create the amazon iam policies
 * @param scope scope context
 * @param config configuration for iam policies {"policyArn": data}
 */
export function createIAMPolicies(scope: Construct, config: any): void {
  for (const policyArn of Object.keys(config)) {
    // Extract an account id from arn
    const accountId: string = extractDataFromArn(policyArn, "account");
    // Create the policies that are not managed by aws
    if (accountId === process.env.ORIGIN_ACCOUNT) {
      // Create an iam policy
      createIAMPolicy(scope, config[policyArn]);
    }
  }
}
/**
 * Create an amazon iam role
 * @param scope scope context
 * @param config configuration for iam role {AttachedPolicies: data, Policies: data, Role: data}
 */
export function createIAMRole(scope: Construct, config: any): void {
  // Create a cloud formation resource for iam role
  const role: Role = new Role(scope, config.Role);
  // Store a resource for iam role
  storeResource("role", config.Role.RoleName, role);
  // Associate the managed policies
  role.associateManagedPolicies(config.AttachedPolicies);
  // Set the inline policies
  if (config.Policies) {
    for (const policyName of Object.keys(config.Policies)) {
      role.setInlinePolicy(policyName, config.Policies[policyName]);
    }
  }
}
/**
 * Create the amazon iam roles
 * @param scope scope context
 * @param config configuration for iam roles {"roleId": data}
 */
export function createIAMRoles(scope: Construct, config: any): void {
  for (const roleId of Object.keys(config)) {
    // Create an iam role
    createIAMRole(scope, config[roleId]);
  }
}

/** For AWS Lambda */
/**
 * Create an aws lambda function
 * @param scope scope context
 * @param config configuration for lambda function
 */
export function createLambdaFunction(scope: Construct, config: any): void {
  // Create a cloud formation resource for lambda function
  const lambdaFunction: Function = new Function(scope, config);
  // Store a resource for lambda function
  storeResource("lambda", config.FunctionName, lambdaFunction);
}
/**
 * Create the aws lambda functions
 * @param scope scope context
 * @param config configuration for functions {"functionName": data}
 */
export function createLambdaFunctions(scope: Construct, config: any): void {
  for (const functionName of Object.keys(config)) {
    // Create a lambda function
    createLambdaFunction(scope, config[functionName].Configuration);
  }
}

/** For Amazon SNS */
/**
 * Create an amazon sns topic
 * @param scope scope context
 * @param config configuration for topic {Attributes: data, Tags: data}
 */
export function createSNSTopic(scope: Construct, config: any): void {
  // Create a cloud formation resource for sns topic
  const topic: Topic = new Topic(scope, config.Attributes);
  // Set the tags
  if (config.Tags && config.Tags !== null && Object.keys(config.Tags).length > 0) {
    topic.setTags(config.Tags);
  }
}
/**
 * Create the amazon sns topics
 * @param scope scope context
 * @param config configuration for topics {"topicArn": data}
 */
export function createSNSTopics(scope: Construct, config: any): void {
  for (const topicArn of Object.keys(config)) {
    // Create a sns topic
    createSNSTopic(scope, config[topicArn]);
  }
}

/** For Amazonz SQS */
/**
 * Create an amazon queue
 * @param scope scope context
 * @param config configuration for queue {Attributes: data, Tags: data}
 */
export function createSQSQueue(scope: Construct, config: any): void {
  // Create a cloud formation resource for sqs queue
  const queue: Queue = new Queue(scope, config.Attributes);
  // Set a policy
  if (config.Attributes.PolicyObject && config.Attributes.PolicyObject !== null) {
    queue.setPolicy(config.Attributes.PolicyObject);
  }
  // Set the tags
  if (config.Tags && config.Tags !== null && Object.keys(config.Tags).length > 0) {
    queue.setTags(config.Tags)
  }
}
/**
 * Create the amazon queues
 * @param scope scope context
 * @param config configuration for queues {"queueUrl": data}
 */
export function createSQSQueues(scope: Construct, config: any): void {
  for (const queueUrl of Object.keys(config)) {
    // Create a sqs queue
    createSQSQueue(scope, config[queueUrl]);
  }
}

