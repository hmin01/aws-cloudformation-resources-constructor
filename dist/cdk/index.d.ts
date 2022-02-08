import { Construct } from "constructs";
/** For Amazon APIGateway */
/**
 * Create the rest api
 * @param scope scope context
 * @param config configuration for rest api
 */
export declare function createRestApi(scope: Construct, config: any): void;
/** For Amazon CloudFront */
/**
 * Create the policies for cloudFront
 * @param scope scope context
 * @param config configuration for each policies
 */
export declare function createCloudFrontPolicies(scope: Construct, config: any): void;
/**
 * Create the distributions
 * @param scope scope context
 * @param config configuration for distributions
 */
export declare function createCloudFrontDistributions(scope: Construct, config: any): void;
/** For Amazon Cognito */
/**
 * Create the cognito user pool
 * @param scope scope context
 * @param config configuration for user pool
 */
export declare function createCognitoUserPool(scope: Construct, config: any): void;
/** For Amazon DynamoDB */
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
export declare function createDynamoDBTables(scope: Construct, config: any): void;
/** For Amazon IAM */
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
export declare function createIAMPolicies(scope: Construct, config: any): void;
/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
export declare function createIAMRoles(scope: Construct, config: any): void;
/** For AWS Lambda */
/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
export declare function createLambdaFunctions(scope: Construct, config: any): void;
/** For Amazon SNS */
/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
export declare function createSNSTopics(scope: Construct, config: any): void;
/** For Amazonz SQS */
/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
export declare function createSQSQueues(scope: Construct, config: any): void;
