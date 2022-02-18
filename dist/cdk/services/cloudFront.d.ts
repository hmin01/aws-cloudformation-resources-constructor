import { Construct } from "constructs";
export declare class CachePolicy {
    private _policy;
    private _scope;
    /**
     * Create a cloudfront cache policy
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-cachepolicy-cachepolicyconfig.html
     * @param scope scope context
     * @param config configuration for cache policy
     */
    constructor(scope: Construct, config: any);
    /**
     * Get a cache policy id
     * @returns cache policy id
     */
    getId(): string;
}
export declare class Distribution {
    private _distribution;
    private _scope;
    /**
     * Create a cloudfront distribution
     * @description
     * @param scope scope context
     * @param config configuration for distribution
     */
    constructor(scope: Construct, config: any);
    /**
     * Get a distribution id
     * @returns distribution id
     */
    getId(): string;
}
export declare class Function {
    private _function;
    private _scope;
    /**
     * Create a cloudfront function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-function.html
     * @param scope scope context
     * @param config configuration for function
     */
    constructor(scope: Construct, config: any);
    /**
     * Get a function arn
     * @returns function arn
     */
    getArn(): string;
}
export declare class OriginAccessIdentity {
    private _identiry;
    private _scope;
    /**
     * Create a cloudfront origin access identity
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-cloudfrontoriginaccessidentity-cloudfrontoriginaccessidentityconfig.html
     * @param scope scope context
     * @param config configuration for origin access identity
     */
    constructor(scope: Construct, config: any);
    /**
     * Get a origin access identity id
     * @returns origin access identity id
     */
    getId(): string;
}
export declare class OriginRequestPolicy {
    private _policy;
    private _scope;
    /**
     * Create a cloudfront origin request policy
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-originrequestpolicy-originrequestpolicyconfig.html
     * @param scope scope context
     * @param config configuration for origin request policy
     */
    constructor(scope: Construct, config: any);
    /**
     * Get a origin request policy id
     * @returns origin request policy id
     */
    getId(): string;
}
export declare class ResponseHeadersPolicy {
    private _policy;
    private _scope;
    /**
     * Create a cloudfront response headers policy
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-responseheaderspolicy-responseheaderspolicyconfig.html
     * @param scope scope context
     * @param config configuration for response headers policy
     */
    constructor(scope: Construct, config: any);
    /**
     * Get a response headers policy id
     * @returns response headers policy id
     */
    getId(): string;
}
