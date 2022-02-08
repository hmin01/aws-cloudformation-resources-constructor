/**
 * Destroy a client for dynamodb
 */
export declare function destroyDyanmoDBClient(): void;
/**
 * Get an arn for dynamodb table
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/describetablecommand.html
 * @param tableName name for dynamodb table
 * @returns arn for dynamodb table
 */
export declare function getDynamoDBTableArn(tableName: string): Promise<string>;
/**
 * Init a client for dynamodb
 */
export declare function initDynamoDBClient(): void;
