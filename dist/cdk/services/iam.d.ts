import { Construct } from "constructs";
export declare class Role {
    private _role;
    private _scope;
    /**
     * Create the iam role
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html
     * @param scope scope context
     * @param config configuration for iam role
     */
    constructor(scope: Construct, config: any);
    /**
     * Attache a managed policy
     * @param policyArn arn for policy
     */
    attachManagePolicy(policyArn: string): void;
    /**
     * Associate the managed policies
     * @param policies a list of managed policies info
     */
    associateManagedPolicies(policies: any[]): void;
    /**
     * Get an arn for role
     * @returns arn for role
     */
    getArn(): string;
    /**
     * Get an id for role
     * @returns id for role
     */
    getId(): string;
    /**
     * Get a name for role
     * @returns name for role
     */
    getName(): string;
    /**
     * Get a ref for role
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html#aws-resource-iam-role-return-values
     * @returns ref for role
     */
    getRef(): string;
    /**
     * Set an inline policy
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-policy.html
     * @param name policy name
     * @param document policy document
     */
    setInlinePolicy(name: string, document: any): void;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
}
export declare class Policy {
    private _policy;
    private _scope;
    /**
     * Create the iam policy
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-managedpolicy.html
     * @param scope scope context
     * @param config configuration for iam managed policy
     */
    constructor(scope: Construct, config: any);
    /**
     * Get an arn for policy
     * @returns arn for policy
     */
    getArn(): string;
}
