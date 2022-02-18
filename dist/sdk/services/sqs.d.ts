export declare class SQSSdk {
    private _client;
    /**
     * Create a sdk object for amazon sqs
     * @param config configuration for client
     */
    constructor(config: any);
    /**
     * Destroy a client for amazon sqs
     */
    destroy(): void;
    /**
     * Get a queue arn
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/getqueueattributescommandinput.html
     * @param queueUrl queue url
     * @returns queue arn
     */
    getQueueArn(queueUrl: string): Promise<string>;
    /**
     * Get a queue url
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/getqueueurlcommandinput.html
     * @param queueName queue name
     * @param accountId account id of queue owner
     * @returns queue url
     */
    getQueueUrl(queueName: string, accountId?: string): Promise<string>;
}
