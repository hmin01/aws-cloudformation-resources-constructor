import { Construct } from "constructs";
/** For Util */
/**
 * Load a json data (configuration)
 * @param filePath file path
 * @returns loaded data
 */
export declare function loadJsonFile(filePath: string): any;
/** For Amazon DynamoDB */
/**
 * Create the dynamodb tables
 * @param scope scope context
 * @param config configuration for tables
 */
export declare function createTables(scope: Construct, config: any): void;
/** For Amazon IAM */
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
export declare function createPolicies(scope: Construct, config: any): void;
/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
export declare function createRoles(scope: Construct, config: any): void;
/** For AWS Lambda */
/**
 * Create the lambda functions
 * @param scope scope context
 * @param config configuration for functions
 */
export declare function createLambdaFunctions(scope: Construct, config: any): void;
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
export declare function setEventSourceMappings(config: any): void;
/** For Amazon SNS */
/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
export declare function createTopics(scope: Construct, config: any): void;
/** For Amazonz SQS */
/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
export declare function createQueues(scope: Construct, config: any): void;
