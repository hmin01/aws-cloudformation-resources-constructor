import { Construct } from "constructs";
/** For Amazon APIGateway */
/**
 * Create an amazon apigateway rest api
 * @param scope scope context
 * @param config configuration for apigateway rest api
 */
export declare function createAPIGatewayRestApi(scope: Construct, config: any): void;
/**
 * Create the amazon apigateway rest apis
 * @param scope scope context
 * @param config configuration for apigateway rest apis
 */
export declare function createAPIGatewayRestApis(scope: Construct, config: any): void;
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
/**
 * Create the origin access identity
 * @param scope scope context
 * @param config configuration for origin access identity
 */
export declare function createCloudFrontOAI(scope: Construct, config: any): void;
/** For Amazon Cognito */
/**
 * Create an amazon cognito user pool
 * @param scope scope context
 * @param config configuration for cognito user pool
 */
export declare function createCognitoUserPool(scope: Construct, config: any): void;
/**
 * Create the amazon cognito user pools
 * @param scope scope context
 * @param config configuration for cognito user pools {"userPoolId": data}
 */
export declare function createCognitoUserPools(scope: Construct, config: any): void;
/** For Amazon DynamoDB */
/**
 * Create an amazon dynamodb table
 * @param scope scope context
 * @param config configuration for dynamodb table
 */
export declare function createDynamoDBTable(scope: Construct, config: any): void;
/**
 * Create the amazon dynamodb tables
 * @param scope scope context
 * @param config configuration for dynamodb tables {"tableName": data}
 */
export declare function createDynamoDBTables(scope: Construct, config: any): void;
/** For Amazon IAM */
/**
 * Create an amazon iam policy
 * @param scope scope context
 * @param config configuration for iam policy
 */
export declare function createIAMPolicy(scope: Construct, config: any): void;
/**
 * Create the amazon iam policies
 * @param scope scope context
 * @param config configuration for iam policies {"policyArn": data}
 */
export declare function createIAMPolicies(scope: Construct, config: any): void;
/**
 * Create an amazon iam role
 * @param scope scope context
 * @param config configuration for iam role {AttachedPolicies: data, Policies: data, Role: data}
 */
export declare function createIAMRole(scope: Construct, config: any): void;
/**
 * Create the amazon iam roles
 * @param scope scope context
 * @param config configuration for iam roles {"roleId": data}
 */
export declare function createIAMRoles(scope: Construct, config: any): void;
/** For AWS Lambda */
/**
 * Create an aws lambda function
 * @param scope scope context
 * @param config configuration for lambda function
 */
export declare function createLambdaFunction(scope: Construct, config: any): void;
/**
 * Create the aws lambda functions
 * @param scope scope context
 * @param config configuration for functions {"functionName": data}
 */
export declare function createLambdaFunctions(scope: Construct, config: any): void;
/** For Amazon SNS */
/**
 * Create an amazon sns topic
 * @param scope scope context
 * @param config configuration for topic {Attributes: data, Tags: data}
 */
export declare function createSNSTopic(scope: Construct, config: any): void;
/**
 * Create the amazon sns topics
 * @param scope scope context
 * @param config configuration for topics {"topicArn": data}
 */
export declare function createSNSTopics(scope: Construct, config: any): void;
/** For Amazonz SQS */
/**
 * Create an amazon queue
 * @param scope scope context
 * @param config configuration for queue {Attributes: data, Tags: data}
 */
export declare function createSQSQueue(scope: Construct, config: any): void;
/**
 * Create the amazon queues
 * @param scope scope context
 * @param config configuration for queues {"queueUrl": data}
 */
export declare function createSQSQueues(scope: Construct, config: any): void;
