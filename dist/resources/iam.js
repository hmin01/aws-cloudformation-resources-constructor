"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Policy = exports.Role = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
class Role {
    /**
     * Create the iam role
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html
     * @param scope scope context
     * @param config configuration for role
     */
    constructor(scope, config) {
        this._scope = scope;
        // Extract a list of tag
        const tags = (0, util_1.extractTags)(config.Tags);
        // Set the properties for role
        const props = {
            assumeRolePolicyDocument: config.AssumeRolePolicyDocument,
            description: config.Description,
            maxSessionDuration: Number(config.MaxSessionDuration),
            path: config.Path,
            roleName: config.RoleName,
            tags: tags.length > 0 ? tags : undefined
        };
        // Create the role based on properties
        this._role = new aws_cdk_lib_1.aws_iam.CfnRole(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Attache a managed policy
     * @param policyArn arn for policy
     */
    attachManagePolicy(policyArn) {
        const managedPolicyArns = this._role.managedPolicyArns;
        if (typeof managedPolicyArns !== "undefined") {
            managedPolicyArns.push(policyArn);
            // Set the managed policy arns
            this._role.addPropertyOverride("ManagedPolicyArns", managedPolicyArns);
        }
    }
    /**
     * Associate the managed policies
     * @param policies a list of managed policies info
     */
    associateManagedPolicies(policies) {
        // Create a list of associated managed policy arn
        const managedPolicyArns = policies.map((elem) => (0, cache_1.getResource)("policy", elem.PolicyName) !== undefined ? (0, cache_1.getResource)("policy", elem.PolicyName).getArn() : elem.PolicyName);
        // Associate the managed policies
        this._role.addPropertyOverride("ManagedPolicyArns", managedPolicyArns);
    }
    /**
     * Get an arn for role
     * @returns arn for role
     */
    getArn() {
        return this._role.attrArn;
    }
    /**
     * Get an id for role
     * @returns id for role
     */
    getId() {
        return this._role.attrRoleId;
    }
    /**
     * Get a name for role
     * @returns name for role
     */
    getName() {
        return this._role.ref;
    }
    /**
     * Get a ref for role
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html#aws-resource-iam-role-return-values
     * @returns ref for role
     */
    getRef() {
        return this._role.ref;
    }
    /**
     * Set an inline policy
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-policy.html
     * @param name policy name
     * @param document policy document
     */
    setInlinePolicy(name, document) {
        // Create the properties for inline policy
        const props = {
            policyDocument: document,
            policyName: name,
            roles: [this._role.ref]
        };
        // Set an inline policy
        new aws_cdk_lib_1.aws_iam.CfnPolicy(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config) {
        // Create a list of tag
        const tags = (0, util_1.extractTags)(config);
        // Set the tags
        if (tags.length > 0) {
            this._role.addPropertyOverride("Tags", tags);
        }
    }
}
exports.Role = Role;
class Policy {
    /**
     * Create the iam policy
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-managedpolicy.html
     * @param scope scope context
     * @param config configuration for managed policy
     */
    constructor(scope, config) {
        this._scope = scope;
        // Set the properties for managed policy
        const props = {
            description: config.Description,
            managedPolicyName: config.PolicyName,
            path: config.Path,
            policyDocument: config.Document
        };
        // Create the managed policy based on properties
        this._policy = new aws_cdk_lib_1.aws_iam.CfnManagedPolicy(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Get an arn for policy
     * @returns arn for policy
     */
    getArn() {
        return this._policy.ref;
    }
}
exports.Policy = Policy;
