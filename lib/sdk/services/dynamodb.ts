// AWS SDK
import * as dynamodb from "@aws-sdk/client-dynamodb";

export class DynamoDBSdk {
  private _client: dynamodb.DynamoDBClient;

  /**
   * Create a sdk object for amazon dynamodb
   * @param config configuration for amazon dynamodb
   */
  constructor(config: any) {
    // Create a client for amazon dynamodb
    this._client = new dynamodb.DynamoDBClient(config);
  }

  /**
   * Destroy a client for amazon dynamodb
   */
  public destroy(): void {
    this._client.destroy();
  }

  /**
   * Get a table arn
   * @param tableName table name 
   * @returns arn for table
   */
  public async getTableArn(tableName: string): Promise<string> {
    try {
      // Create an input to get a table arn
      const input: dynamodb.DescribeTableCommandInput = {
        TableName: tableName
      };
      // Create a command to get a table arn
      const command: dynamodb.DescribeTableCommand = new dynamodb.DescribeTableCommand(input);
      // Send a command to get a table arn
      const response: dynamodb.DescribeTableCommandOutput = await this._client.send(command);
      // Return
      return response.Table ? response.Table.TableArn as string : "";
    } catch (err) {
      console.error(`[ERROR] Failed to get a table arn (target: ${tableName})\n-> ${err}`);
      process.exit(30);
    }
  }
}