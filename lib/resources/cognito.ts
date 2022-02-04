import { Construct } from "constructs";
import { aws_cognito as cognito } from "aws-cdk-lib";
// Util
import { createId, extractDataFromArn } from "../utils/util";
import { getResource } from "../utils/cache";

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
    // Create the properties for cognito userpool
    const props: cognito.CfnUserPoolProps = {
      accountRecoverySetting: config.AccountRecoverySetting !== undefined ? {
        recoveryMechanisms: config.AccountRecoverySetting.RecoveryMechanisms.map((elem: any): cognito.CfnUserPool.RecoveryOptionProperty => {  return { name: elem.Name, priority: elem.Priority } })
      } : undefined,
      adminCreateUserConfig: config.AdminCreateUserConfig !== undefined ? {
        allowAdminCreateUserOnly: config.AllowAdminCreateUserOnly,
        inviteMessageTemplate: config.InviteMessageTemplate !== undefined ? {
          emailMessage: config.InviteMessageTemplate.EmailMessage,
          emailSubject: config.InviteMessageTemplate.EmailSubect,
          smsMessage: config.InviteMessageTemplate.SmsMessage
        } : undefined,
        unusedAccountValidityDays: Number(config.UnusedAccountValidityDays)
      } : undefined,
      aliasAttributes: config.AliasAttributes !== undefined && config.AliasAttributes.length > 0 ? config.AliasAttributes : undefined,
      autoVerifiedAttributes: config.AutoVerifiedAttributes !== undefined && config.AutoVerifiedAttributes.length > 0 ? config.AutoVerifiedAttributes : undefined,
      deviceConfiguration: config.DeviceConfiguration !== undefined ? {
        challengeRequiredOnNewDevice: config.DeviceConfiguration.ChallengeRequiredOnNewDevice,
        deviceOnlyRememberedOnUserPrompt: config.DeviceConfiguration.DeviceOnlyRememberedOnUserPrompt
      } : undefined,
      mfaConfiguration: config.MfaConfiguration,
      policies: config.Policies !== undefined ? {
        passwordPolicy: {
          minimumLength: Number(config.Policies.PasswordPolicy.MinimumLength),
          requireLowercase: config.Policies.PasswordPolicy.RequireLowercase,
          requireNumbers: config.Policies.PasswordPolicy.RequireNumbers,
          requireSymbols: config.Policies.PasswordPolicy.RequireSymbols,
          requireUppercase: config.Policies.PasswordPolicy.RequireUppercase,
          temporaryPasswordValidityDays: config.Policies.PasswordPolicy.TemporaryPasswordValidityDays
        }
      } : undefined,
      usernameAttributes: config.UsernameAttributes,
      usernameConfiguration: config.UsernameConfiguration !== undefined ? {
        caseSensitive: config.UsernameConfiguration.CaseSensitive
      } : undefined,
      verificationMessageTemplate: config.VerificationMessageTemplate !== undefined ? {
        defaultEmailOption: config.VerificationMessageTemplate.DefaultEmailOption,
        emailMessage: config.VerificationMessageTemplate.EmailMessage,
        emailMessageByLink: config.VerificationMessageTemplate.EmailMessageByLink,
        emailSubject: config.VerificationMessageTemplate.EmailSubject,
        emailSubjectByLink: config.VerificationMessageTemplate.EmailSubjectByLink,
        smsMessage: config.VerificationMessageTemplate.SmsMessage
      } : undefined
    };
    // Create the cognito user pool
    this._userPool = new cognito.CfnUserPool(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Add an user pool client
   * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html
   * @param config configuration for user pool client
   */
  public addClient(config: any) {
    // Create the properties for user pool client
    const props: cognito.CfnUserPoolClientProps = {
      userPoolId: this._userPool.ref,
      // Optional
      accessTokenValidity: Number(config.AccessTokenValidity),
      allowedOAuthFlows:  config.AllowedOAuthFlows !== undefined && config.AllowedOAuthFlows.length > 0 ? config.AllowedOAuthFlows : undefined,
      allowedOAuthFlowsUserPoolClient: config.AllowedOAuthFlowsUserPoolClient,
      allowedOAuthScopes: config.AllowedOAuthScopes !== undefined && config.AllowedOAuthScopes.length > 0 ? config.AllowedOAuthScopes : undefined,
      analyticsConfiguration: config.AnalyticsConfiguration !== undefined ? {
        applicationArn: config.AnalyticsConfiguration.ApplicationArn,
        applicationId: config.AnalyticsConfiguration.ApplicationId,
        externalId: config.AnalyticsConfiguration.ExternalId,
        roleArn: getResource("role", extractDataFromArn(config.AnalyticsConfiguration.RoleArn, "resource")),
        userDataShared: config.AnalyticsConfiguration.UserDataShared
      } : undefined,
      callbackUrLs: config.CallbackUrLs !== undefined && config.CallbackUrLs.length > 0 ? config.CallbackUrLs : undefined,
      clientName: config.ClientName,
      defaultRedirectUri: config.CallbackUrLs !== undefined && config.CallbackUrLs.length > 0 && config.DefaultRedirectUri !== undefined ? config.DefaultRedirectUri : undefined,
      enableTokenRevocation: config.EnableTokenRevocation,
      explicitAuthFlows: config.ExplicitAuthFlows !== undefined && config.ExplicitAuthFlows.length > 0 ? config.ExplicitAuthFlows : undefined,
      generateSecret: config.GenerateSecret,
      idTokenValidity: config.IdTokenValidity !== undefined ? Number(config.IdTokenValidity) : undefined,
      logoutUrLs: config.LogoutUrLs !== undefined && config.LogoutUrLs.length > 0 ? config.LogoutUrLs : undefined,
      preventUserExistenceErrors: config.PreventUserExistenceErrors,
      readAttributes: config.ReadAttributes !== undefined && config.ReadAttributes.length > 0 ? config.ReadAttributes : undefined,
      supportedIdentityProviders: config.SupportedIdentityProviders !== undefined && config.SupportedIdentityProviders.length > 0 ? config.SupportedIdentityProviders : undefined,
      tokenValidityUnits: config.TokenValidityUnits !== undefined ? {
        accessToken: config.TokenValidityUnits.AccessToken,
        idToken: config.TokenValidityUnits.IdToken,
        refreshToken: config.TokenValidityUnits.RefreshToken
      } : undefined,
      writeAttributes: config.WriteAttributes !== undefined && config.WriteAttributes.length > 0 ? config.WriteAttributes : undefined
    };
    // Create the user pool client
    new cognito.CfnUserPoolClient(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Configurate the email
   * @param config configuration for email
   */
  public configurateEmail(config: any) {
    // Configurate the email
    if (config.EmailConfiguration !== undefined) {
      this._userPool.addPropertyOverride("EmailConfiguration", {
        configurationSet: config.EmailConfiguration.ConfigurationSet,
        emailSendingAccount: config.EmailConfiguration.EmailSendingAccount,
        from: config.EmailConfiguration.From,
        replyToEmailAddress: config.EmailConfiguration.ReplyToEmailAddress,
        sourceArn: config.EmailConfiguration.SourceArn !== undefined ? getResource("ses", extractDataFromArn(config.EmailConfiguration.SourceArn, "resource")) !== undefined ? getResource("ses", extractDataFromArn(config.EmailConfiguration.SourceArn, "resource")) : config.EmailConfiguration.SourceArn : undefined
      });
    }
    // Configurate the email message
    if (config.EmailVerificationMessage !== undefined) {
      this._userPool.addPropertyOverride("EmailVerificationMessage", config.EmailVerificationMessage);
    }
    // Configurate the email subjet
    if (config.EmailVerificationSubject !== undefined) {
      this._userPool.addPropertyOverride("EmailVerificationSubject", config.EmailVerificationSubject);
    }
  }

  // public configurateLambda(config: any) {
  //   this._userPool.addPropertyOverride("LambdaConfig", {
  //     createAuthChallenge: config.CreateAuthChallenge,
  //     customEmailSender: config.CustomEmailSender !== undefined ? {
  //       lambdaArn: extractDataFromArn() getResource("lambda", config.CustomEmailSender.LambdaArn) !== undefined ? getResource("lambda", config.CustomEmailSender.LambdaArn) : config.CustomEmailSender.LambdaArn,
  //       lambdaVersion: config.CustomEmailSender.LambdaVersion
  //     } : undefined,
  //     customMessage: config.CustomMessage,
  //     customSmsSender: config.CustomSmsSender !== undefined ? {
  //       lambdaArn: getResource("lambda", config.CustomSmsSender.LambdaArn) !== undefined ? getResource("lambda", config.CustomSmsSender.LambdaArn) : config.CustomSmsSender.LambdaArn,
  //       lambdaVersion: config.CustomSmsSender.LambdaVersion
  //     } : undefined,
  //     defineAuthChallenge: config.DefineAuthChallenge,
  //     kmsKeyId: getResource("kms", config.KmsKeyId) !== undefined ? getResource("kms", config.KmsKeyId) : undefined,
      
  //   });
  // }

  /**
   * Configurate a list of schema
   * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cognito-userpool-schemaattribute.html
   * @param config configuration for schema
   */
  public configurateSchema(config: any[]) {
    // Extract a list of schema
    const schema: cognito.CfnUserPool.SchemaAttributeProperty[] = config.map((elem: any): cognito.CfnUserPool.SchemaAttributeProperty => {
      return {
        attributeDataType: elem.AttributeDataType,
        developerOnlyAttribute: elem.DeveloperOnlyAttribute,
        mutable: elem.Mutable,
        name: elem.Name,
        numberAttributeConstraints: elem.NumberAttributeConstraints !== undefined ? {
          maxValue: elem.NumberAttributeConstraints.MaxValue,
          minValue: elem.NumberAttributeConstraints.MinValue
        } : undefined,
        required: elem.Required,
        stringAttributeConstraints: elem.StringAttributeConstraints !== undefined ? {
          maxLength: elem.StringAttributeConstraints.MaxLength,
          minLength: elem.StringAttributeConstraints.MinLength
        } : undefined
      };
    });
    // Configurate the schema
    this._userPool.addPropertyOverride("Schema", schema);
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
}