import { Construct } from "constructs";
import { aws_lambda as lambda } from "aws-cdk-lib";
// Util
import { getResource, storeResource } from "../utils/cache";
import { createId, extractTags } from "../utils/util";

export class Function {
  private _function: lambda.CfnFunction;
  private _scope: Construct;

  /**
   * Create the lambda function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html
   * @param scope scope context
   * @param config configuration for function
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;

    // Set a list of tag
    const tags = extractTags(config.Tags);
    // Extract configuration for function
    const attributes: any = config.Configuration;
    // Get an arn for kms
    const originKmsArnSplit: string[] = attributes.KmsKeyArn.split("/");
    const kmsKey: any = getResource("kms", originKmsArnSplit[originKmsArnSplit.length - 1]);
    // Get an arn for role
    const originRoleArnSplit: string[] = attributes.Role.split("/");
    const role: any = getResource("role", originRoleArnSplit[originRoleArnSplit.length - 1]);
    if (role === undefined) {
      console.error("Error")
      process.exit(1);
    }

    // Set the properties for lambda function
    const props: lambda.CfnFunctionProps = {
      architectures: ["x86_64"],
      code: {},
      description: attributes.Description,
      environment: attributes.Environment !== undefined ? {
        variables: attributes.Environment.Variables
      } : undefined,
      functionName: attributes.FunctionName,
      handler: attributes.Handler,
      kmsKeyArn: kmsKey !== undefined ? kmsKey.getArn() : undefined,
      memorySize: attributes.MemorySize !== undefined ? Number(attributes.MemorySize) : undefined,
      packageType: attributes.PackageType,
      reservedConcurrentExecutions: attributes.ReservedConcurrentExecutions !== undefined ? Number(attributes.ReservedConcurrentExecutions) : undefined,
      role: role !== undefined ? role.getArn() : undefined,
      runtime: attributes.Runtime,
      timeout: attributes.Timeout,
      tags: tags.length > 0 ? tags : undefined,
      tracingConfig: attributes.TracingConfig !== undefined ? {
        mode: attributes.TracingConfig.Mode
      } : undefined
    };
    // Create the function
    this._function = new lambda.CfnFunction(this._scope, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("lambda", config.FunctionName, this._function);
  }

  /**
   * Create the alias for lambda function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-alias.html
   * @param config configuration for function alias
   */
  public createAlias(config: any): void {
    // Set the properties for lambda function alias
    const props: lambda.CfnAliasProps = {
      description: config.Description,
      functionName: this._function.ref,
      functionVersion: config.FunctionVersion,
      name: config.Name,
      provisionedConcurrencyConfig: config.ProvisionedConcurrencyConfig
    };
    // Create the alias
    new lambda.CfnAlias(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Create the version for lambda function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-version.html
   * @param config configuration for function version
   */
  public createVersion(config: any): void {
    // Set the properties for lambda function version
    const props: lambda.CfnVersionProps = {
      description: config.Description,
      functionName: this._function.ref,
      provisionedConcurrencyConfig: config.ProvisionedConcurrencyConfig
    };
    // Create the version
    new lambda.CfnVersion(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for function
   * @returns arn for function
   */
  public getArn(): string {
    return this._function.attrArn;
  }

  /**
   * Get a name for function
   * @returns name for function
   */
  public getName(): string {
    return this._function.ref;
  }

  /**
   * Get a ref for function
   * @returns ref for function
   */
  public getRef(): string {
    return this._function.ref;
  }
}