import { Construct } from "constructs";
export declare class Queue {
    private _scope;
    private _queue;
    /**
     * Create the sqs queue
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html
     * @param scope scope context
     * @param config configuration for queue
     */
    constructor(scope: Construct, config: any);
    /**
     * Get an arn for queue
     * @returns arn for queue
     */
    getArn(): string;
    /**
     * Get a name for queue
     * @returns name for queue
     */
    getName(): string;
    /**
     * Get an url for queue
     * @returns url for queue
     */
    getUrl(): string;
    /**
     * Set the policy
     * @param config configuration for policy
     */
    setPolicy(config: any): void;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
}
