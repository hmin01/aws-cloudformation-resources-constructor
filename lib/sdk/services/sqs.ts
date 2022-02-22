// AWS SDK
import * as sqs from "@aws-sdk/client-sqs";
// Response
import { CODE, catchError } from "../../models/response";

export class SQSSdk {
  private _client: sqs.SQSClient;

  /**
   * Create a sdk object for amazon sqs
   * @param config configuration for client
   */
  constructor(config: any) {
    // Create the params for client
    const params: sqs.SQSClientConfig = {
      credentials: config.credentials ? {
        accessKeyId: config.credentials.AccessKeyId,
        expiration: config.credentials.Expiration ? new Date(config.credentials.Expiration) : undefined,
        secretAccessKey: config.credentials.SecretAccessKey,
        sessionToken: config.credentials.SessionToken
      } : undefined,
      region: config.region
    };
    // Create a client for amazon sqs
    this._client = new sqs.SQSClient(params);
  }

  /**
   * Destroy a client for amazon sqs
   */
  public destroy(): void {
    this._client.destroy();
  }

  /**
   * Get a queue arn
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/getqueueattributescommandinput.html
   * @param queueUrl queue url
   * @returns queue arn
   */
  public async getQueueArn(queueUrl: string): Promise<string> {
    try {
      // Create an input to get a queue arn
      const input: sqs.GetQueueAttributesCommandInput = {
        AttributeNames: ["QueueArn"],
        QueueUrl: queueUrl
      };
      // Create a command to get a queue arn
      const command: sqs.GetQueueAttributesCommand = new sqs.GetQueueAttributesCommand(input);
      // Send a command to get a queue arn
      const response: sqs.GetQueueAttributesCommandOutput = await this._client.send(command);
      // Return
      return response.Attributes ? response.Attributes.QueueArn as string : "";
    } catch (err) {
      return catchError(CODE.ERROR.SQS.QUEUE.GET_ARN, false, queueUrl, err as Error);
    }
  }

  /**
   * Get a queue url
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/getqueueurlcommandinput.html
   * @param queueName queue name
   * @param accountId account id of queue owner
   * @returns queue url
   */
  public async getQueueUrl(queueName: string, accountId?: string): Promise<string> {
    try {
      // Create an input to get a queue url
      const input: sqs.GetQueueUrlCommandInput = {
        QueueName: queueName,
        QueueOwnerAWSAccountId: accountId
      };
      // Create a command to get a queue url
      const command: sqs.GetQueueUrlCommand = new sqs.GetQueueUrlCommand(input);
      // Send a command to get a queue url
      const response: sqs.GetQueueUrlCommandOutput = await this._client.send(command);
      // Return
      return response.QueueUrl as string;
    } catch (err) {
      return catchError(CODE.ERROR.SQS.QUEUE.GET_URL, false, queueName, err as Error);
    }
  }
}