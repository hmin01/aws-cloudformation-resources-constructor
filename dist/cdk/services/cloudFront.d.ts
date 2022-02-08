import { Construct } from "constructs";
export declare class Distribution {
    private _distribution;
    private _scope;
    /**
     * Create the cloudFront distribution
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-distribution.html
     * @param scope scope context
     * @param config configuration for distribution
     */
    constructor(scope: Construct, config: any, acmCertArn: string);
    /**
     * Create the format for cache behavior
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-cachebehavior.html
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-defaultcachebehavior.html
     * @param config configuration for cache behavior
     * @returns format for cache behavior
     */
    createCacheBehaviorFormat(config: any): any;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
}
export declare class Function {
    private _function;
    private _scope;
    /**
     * Create the function for cloudfront
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-function.html
     * @param scope scope context
     * @param config configuration for function
     */
    constructor(scope: Construct, config: any);
    /**
     * Get an arn for function
     * @returns arn for function
     */
    getArn(): string;
}
export declare class CachePolicy {
    private _policy;
    private _scope;
    /**
     * Create the cache policy for cloudfront
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-cachepolicy.html
     * @param scope scope context
     * @param prevId previous resource id
     * @param config configuration for cache policy
     */
    constructor(scope: Construct, prevId: string, config: any);
    /**
     * Get id for cache policy
     * @returns id for cache policy
     */
    getId(): string;
}
export declare class OriginRequestPolicy {
    private _policy;
    private _scope;
    /**
     * Create the origin request policy for cloudfront
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-originrequestpolicy.html
     * @param scope scope context
     * @param prevId previous resource id
     * @param config configuration for orgin request policy
     */
    constructor(scope: Construct, prevId: string, config: any);
    /**
     * Get an id for response headers policy
     * @returns id for response headers policy
     */
    getId(): string;
}
export declare class ResponseHeadersPolicy {
    private _policy;
    private _scope;
    /**
     * Create the response header policy for cloudfront
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-responseheaderspolicy.html
     * @param scope scope context
     * @param prevId previous resource id
     * @param config configuration for response header policy
     */
    constructor(scope: Construct, prevId: string, config: any);
    /**
     * Get an id for response headers policy
     * @returns id for response headers policy
     */
    getId(): string;
}
