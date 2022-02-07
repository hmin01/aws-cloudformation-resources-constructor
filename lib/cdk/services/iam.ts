import { Construct } from "constructs";
import { aws_iam as iam } from "aws-cdk-lib";
// Util
import { getResource } from "../../utils/cache";
import { createId, extractTags } from "../../utils/util";

export class Role {
  private _role: iam.CfnRole;
  private _scope: Construct;

  /**
   * Create the iam role
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html
   * @param scope scope context
   * @param config configuration for role
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Extract a list of tag
    const tags: any[] = extractTags(config.Tags);
    // Set the properties for role
    const props: iam.CfnRoleProps = {
      assumeRolePolicyDocument: config.AssumeRolePolicyDocument,
      description: config.Description,
      maxSessionDuration: Number(config.MaxSessionDuration),
      path: config.Path,
      roleName: config.RoleName,
      tags: tags.length > 0 ? tags : undefined
    };
    // Create the role based on properties
    this._role = new iam.CfnRole(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Attache a managed policy
   * @param policyArn arn for policy
   */
  public attachManagePolicy(policyArn: string) {
    const managedPolicyArns: string[]|undefined = this._role.managedPolicyArns;
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
  public associateManagedPolicies(policies: any[]): void {
    // Create a list of associated managed policy arn
    const managedPolicyArns: string[] = policies.map((elem: any) => getResource("policy", elem.PolicyName) !== undefined ? getResource("policy", elem.PolicyName).getArn() : elem.PolicyName);
    // Associate the managed policies
    this._role.addPropertyOverride("ManagedPolicyArns", managedPolicyArns);
  }

  /**
   * Get an arn for role
   * @returns arn for role
   */
  public getArn(): string {
    return this._role.attrArn;
  }

  /**
   * Get an id for role
   * @returns id for role
   */
  public getId(): string {
    return this._role.attrRoleId;
  }

  /**
   * Get a name for role
   * @returns name for role
   */
  public getName(): string {
    return this._role.ref;
  }

  /**
   * Get a ref for role
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html#aws-resource-iam-role-return-values
   * @returns ref for role
   */
  public getRef(): string {
    return this._role.ref;
  }

  /**
   * Set an inline policy
   * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-policy.html
   * @param name policy name
   * @param document policy document
   */
  public setInlinePolicy(name: string, document: any): void {
    // Create the properties for inline policy
    const props: iam.CfnPolicyProps = {
      policyDocument: document,
      policyName: name,
      roles: [this._role.ref]
    };
    // Set an inline policy
    new iam.CfnPolicy(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Set the tags
   * @param config configuration for tags
   */
  public setTags(config: any) {
    // Create a list of tag
    const tags = extractTags(config);
    // Set the tags
    if (tags.length > 0) {
      this._role.addPropertyOverride("Tags", tags);
    }
  }
}

export class Policy {
  private _policy: iam.CfnManagedPolicy;
  private _scope: Construct;

  /**
   * Create the iam policy
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-iam-managedpolicy.html
   * @param scope scope context
   * @param config configuration for managed policy
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Set the properties for managed policy
    const props: iam.CfnManagedPolicyProps = {
      description: config.Description,
      managedPolicyName: config.PolicyName,
      path: config.Path,
      policyDocument: config.Document
    };
    // Create the managed policy based on properties
    this._policy = new iam.CfnManagedPolicy(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for policy
   * @returns arn for policy
   */
  public getArn(): string {
    return this._policy.ref;
  }
}