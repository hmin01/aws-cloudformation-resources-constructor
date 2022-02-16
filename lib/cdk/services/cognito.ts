import { Construct } from "constructs";
import { aws_cognito as cognito } from "aws-cdk-lib";
// Util
import { createId } from "../../utils/util";

export class UserPool {
  private _scope: Construct;
  private _userPool: cognito.CfnUserPool;

  /**
   * Create the cognito user pool
   * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html
   * @param scope scope context
   * @param config configuration for user pool
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Create the properties for cognito user pool
    const props: cognito.CfnUserPoolProps = {
      accountRecoverySetting: config.AccountRecoverySetting !== undefined ? {
        recoveryMechanisms: config.AccountRecoverySetting.RecoveryMechanisms.map((elem: any): cognito.CfnUserPool.RecoveryOptionProperty => {
          return { name: elem.Name, priority: elem.Priority };
        })
      } : undefined,
      adminCreateUserConfig: config.AdminCreateUserConfig !== undefined ? {
        allowAdminCreateUserOnly: config.AdminCreateUserConfig.AllowAdminCreateUserOnly,
        inviteMessageTemplate: config.AdminCreateUserConfig.InviteMessageTemplate !== undefined ? {
          emailMessage: config.AdminCreateUserConfig.InviteMessageTemplate.EmailMessage,
          emailSubject: config.AdminCreateUserConfig.InviteMessageTemplate.EmailSubject,
          smsMessage: config.AdminCreateUserConfig.InviteMessageTemplate.SMSMessage
        } : undefined,
      } : undefined,
      aliasAttributes: config.AliasAttributes,
      autoVerifiedAttributes: config.AutoVerifiedAttributes,
      deviceConfiguration: config.DeviceConfiguration !== undefined ? {
        challengeRequiredOnNewDevice: config.DeviceConfiguration.ChallengeRequiredOnNewDevice,
        deviceOnlyRememberedOnUserPrompt: config.DeviceConfiguration.DeviceOnlyRememberedOnUserPrompt
      } : undefined,
      policies: config.Policies !== undefined ? {
        passwordPolicy: {
          minimumLength: config.Policies.PasswordPolicy.MinimumLength !== undefined ? Number(config.Policies.PasswordPolicy.MinimumLength) : undefined,
          requireLowercase: config.Policies.PasswordPolicy.RequireLowercase,
          requireNumbers: config.Policies.PasswordPolicy.RequireNumbers,
          requireSymbols: config.Policies.PasswordPolicy.RequireSymbols,
          requireUppercase: config.Policies.PasswordPolicy.RequireUppercase,
          temporaryPasswordValidityDays: config.Policies.PasswordPolicy.TemporaryPasswordValidityDays !== undefined ? Number(config.Policies.PasswordPolicy.TemporaryPasswordValidityDays) : undefined
        }
      } : undefined,
      schema: config.SchemaAttributes !== undefined && config.SchemaAttributes.length > 0 ? config.SchemaAttributes.map((elem: any): cognito.CfnUserPool.SchemaAttributeProperty => {
        return {
          attributeDataType: elem.AttributeDataType,
          developerOnlyAttribute: elem.DeveloperOnlyAttribute,
          mutable: elem.Mutable,
          required: elem.Required,
          name: elem.Name,
          numberAttributeConstraints: elem.NumberAttributeConstraints !== undefined ? {
            maxValue: elem.NumberAttributeConstraints.MaxValue,
            minValue: elem.NumberAttributeConstraints.MinValue
          } : undefined,
          stringAttributeConstraints: elem.StringAttributeConstraints !== undefined ? {
            maxLength: elem.StringAttributeConstraints.MaxLength,
            minLength: elem.StringAttributeConstraints.MinLength
          } : undefined
        };
      }) : undefined,
      usernameAttributes: config.UsernameAttributes,
      usernameConfiguration: config.UsernameConfiguration !== undefined ? {
        caseSensitive: config.UsernameConfiguration.CaseSensitive
      } : undefined,
      userPoolName: config.Name,
      verificationMessageTemplate: config.VerificationMessageTemplate !== undefined ? {
        defaultEmailOption: config.VerificationMessageTemplate.DefaultEmailOption,
        emailMessage: config.VerificationMessageTemplate.EmailMessage,
        emailMessageByLink: config.VerificationMessageTemplate.EmailMessageByLink,
        emailSubject: config.VerificationMessageTemplate.EmailSubject,
        emailSubjectByLink: config.VerificationMessageTemplate.EmailSubjectByLink
      } : undefined
    };
    // Create the user pool
    this._userPool = new cognito.CfnUserPool(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Create the default domain
   * @param domain domain
   */
  public createDefaultDomain(domain: any): void {
    // Create the properties for user pool domain
    const props: cognito.CfnUserPoolDomainProps = {
      domain: domain,
      userPoolId: this._userPool.ref
    };
    // Create the user pool default domain
    new cognito.CfnUserPoolDomain(this._scope, createId(JSON.stringify(props)), props);
  }
  
  /**
   * Create a resource server for user pool
   * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolresourceserver.html
   * @param config configuration for resource server
   */
  public createResourceServer(config: any): void {
    // Create the properties for user pool resource server
    const props: cognito.CfnUserPoolResourceServerProps = {
      identifier: config.Identifier,
      name: config.Name,
      userPoolId: this._userPool.ref,
      // Optional
      scopes: config.Scopes !== undefined ? config.Scopes.map((elem: any): any => {
        return {
          scopeDescription: elem.ScopeDescription,
          scopeName: elem.ScopeName
        };
      }) : undefined
    };
    // Create a user pool resource server
    new cognito.CfnUserPoolResourceServer(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for user pool
   * @returns arn for user pool
   */
  public getArn(): string {
    return this._userPool.attrArn;
  }

  /**
   * Get an id for user pool
   * @returns id for user pool
   */
  public getId(): string {
    return this._userPool.ref;
  }

  /**
   * Get a provider name for user pool
   * @returns provider name for user pool
   */
  public getProviderName(): string {
    return this._userPool.attrProviderName;
  }

  /**
   * Get a provider url for user pool
   * @returns provider url for user pool
   */
  public getProviderUrl(): string {
    return this._userPool.attrProviderUrl;
  }
}