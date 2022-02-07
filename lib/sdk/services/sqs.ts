import * as sqs from "@aws-sdk/client-sqs";

// Set a client for sqs
let client: sqs.SQSClient;

/**
 * Destroy a client for sqs
 */
export function destroySqsClient(): void {
  client.destroy();
}

/**
 * Get an arn for sqs queue
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/getqueueurlcommand.html
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/getqueueattributescommand.html
 * @param queueName name for sqs queue
 * @returns arn for sqs queue
 */
export async function getSqsQueueArn(queueName: string, accountId?: string): Promise<string> {
  // Create the input to get url for sqs queue
  const inputForUrl: sqs.GetQueueUrlCommandInput = {
    QueueName: queueName,
    QueueOwnerAWSAccountId: accountId
  };
  // Create the command to get url for sqs queue
  const cmdForUrl: sqs.GetQueueUrlCommand = new sqs.GetQueueUrlCommand(inputForUrl);
  // Send the command to get url for sqs queue
  const resForUrl: sqs.GetQueueUrlCommandOutput = await client.send(cmdForUrl);
  // Result
  const queueUrl: string|undefined = resForUrl.QueueUrl;
  if (queueUrl === undefined) {
    console.error(`[ERROR] Failed to get url for sqs queue (for ${queueName})`);
    process.exit(1);
  }

  // Create the input to get arn for sqs queue
  const inputForArn: sqs.GetQueueAttributesCommandInput = {
    AttributeNames: ["QueueArn"],
    QueueUrl: queueUrl
  };
  // Create the command to get arn for sqs queue
  const cmdForArn: sqs.GetQueueAttributesCommand = new sqs.GetQueueAttributesCommand(inputForArn);
  // Send command to get arn for sqs queue
  const resForArn: sqs.GetQueueAttributesCommandOutput = await client.send(cmdForArn);
  // Result
  if (resForArn.Attributes !== undefined && resForArn.Attributes.QueueArn !== undefined) {
    return resForArn.Attributes.QueueArn;
  } else {
    console.error(`[ERROR] Failed to get arn for sqs queue (for ${queueName})`);
    process.exit(1);
  }
}

/**
 * Init a client for sqs
 */
export function initSqsClient(): void {
  client = new sqs.SQSClient({ region: process.env.REGION });
}