import * as dynamodb from "@aws-sdk/client-dynamodb";

// Set a client for dynamodb
let client: dynamodb.DynamoDBClient;

/**
 * Destroy a client for dynamodb
 */
export function destroyDyanmoDBClient(): void {
  client.destroy();
}

/**
 * Get an arn for dynamodb table
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/describetablecommand.html
 * @param tableName name for dynamodb table
 * @returns arn for dynamodb table
 */
export async function getDynamoDBTableArn(tableName: string): Promise<string> {
  // Create the input to get arn for dynamodb table
  const input: dynamodb.DescribeTableCommandInput = {
    TableName: tableName
  };
  // Create the command to get arn for dynamodb table
  const command: dynamodb.DescribeTableCommand = new dynamodb.DescribeTableCommand(input);
  // Send the command to get url for dynamodb table
  const response: dynamodb.DescribeTableCommandOutput = await client.send(command);
  // Result
  if (response.Table !== undefined && response.Table.TableArn !== undefined) {
    return response.Table.TableArn;
  } else {
    console.error(`[WARNING] Not found dynamodb table (for ${tableName})`);
    return "";
  }
}

/**
 * Init a client for dynamodb
 */
export function initDynamoDBClient(): void {
  client = new dynamodb.DynamoDBClient({ region: process.env.REGION });
}