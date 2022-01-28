import { Construct } from "constructs";
export declare class Topic {
    private _topic;
    private _scope;
    /**
     * Create the sns topic
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html
     * @param scope scope context
     * @param config configuration for sns topic
     */
    constructor(scope: Construct, config: any);
    /**
     * Get an arn for topic
     * @returns arn for topic
     */
    getArn(): string;
    /**
     * Get a name for topic
     * @returns name for topic
     */
    getName(): string;
    /**
     * Get a ref for topic
     * @returns ref for topic
     */
    getRef(): string;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
}
