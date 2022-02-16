import { Construct } from "constructs";
export declare class Bucket {
    private _bucket;
    private _scope;
    /**
     * Create the s3 bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-s3-bucket.html
     * @param scope scope context
     * @param config configuration for s3 bucket
     */
    constructor(scope: Construct, config: any);
    /**
     * Extract the notification filter rules
     * @param config configuration for notification filter rules
     * @returns notification filter rules
     */
    private extractNotificationFilterRules;
    /**
     * Get an arn for bucket
     * @returns arn for bucket
     */
    private getArn;
    /**
     * Get a mapping arn for lambda function
     * @param prevArn previous arn for lambda function
     * @returns arn for lambda function
     */
    private getMappingLambdaFunctionArn;
    /**
     * Get a mapping arn for topic
     * @param prevArn previous arn for topic
     * @returns arn for topic
     */
    private getMappingTopicArn;
    /**
     * Get a mapping arn for queue
     * @param prevArn previous arn for queue
     * @returns arn for queue
     */
    private getMappingQueueArn;
    /**
     * Get a name for bucket
     * @returns name for bucket
     */
    private getName;
    /**
     * Set the CORS for bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-corsrule.html
     * @param config configuration for CORS
     */
    setCorsConfiguration(config: any): void;
    /**
     * Set the logging for bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-loggingconfiguration.html
     * @param config configuration for logging
     */
    setLogging(config: any): void;
    /**
     * Set the notifications for bucket
     * @param config configuration for notifications
     */
    setNotifications(config: any): void;
    /**
     * Set the ownership controls for bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-ownershipcontrols.html
     * @param config configuration for ownership controls
     */
    setOwnershipControls(config: any): void;
    /**
     * Set the public access block for bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-publicaccessblockconfiguration.html
     * @param config configuration for public access block
     */
    setPublicAccessBlock(config: any): void;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
    /**
     * Set the website for bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-websiteconfiguration.html
     * @param config configuration for website
     */
    setWebsite(config: any): void;
}
