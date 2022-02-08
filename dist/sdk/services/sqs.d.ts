/**
 * Destroy a client for sqs
 */
export declare function destroySqsClient(): void;
/**
 * Get an arn for sqs queue
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/getqueueurlcommand.html
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/getqueueattributescommand.html
 * @param queueName name for sqs queue
 * @returns arn for sqs queue
 */
export declare function getSqsQueueArn(queueName: string, accountId?: string): Promise<string>;
/**
 * Init a client for sqs
 */
export declare function initSqsClient(): void;
