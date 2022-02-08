"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPool = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const util_1 = require("../../utils/util");
const cache_1 = require("../../utils/cache");
class UserPool {
    /**
     * Create the cognito user pool
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html
     * @param scope scope context
     * @param config configuration for user pool
     */
    constructor(scope, config) {
        this._scope = scope;
        // Create the properties for cognito userpool
        const props = {
            accountRecoverySetting: config.AccountRecoverySetting !== undefined ? {
                recoveryMechanisms: config.AccountRecoverySetting.RecoveryMechanisms.map((elem) => { return { name: elem.Name, priority: elem.Priority }; })
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
        this._userPool = new aws_cdk_lib_1.aws_cognito.CfnUserPool(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Add an user pool client
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html
     * @param config configuration for user pool client
     */
    addClient(config) {
        // Create the properties for user pool client
        const props = {
            userPoolId: this._userPool.ref,
            // Optional
            accessTokenValidity: Number(config.AccessTokenValidity),
            allowedOAuthFlows: config.AllowedOAuthFlows !== undefined && config.AllowedOAuthFlows.length > 0 ? config.AllowedOAuthFlows : undefined,
            allowedOAuthFlowsUserPoolClient: config.AllowedOAuthFlowsUserPoolClient,
            allowedOAuthScopes: config.AllowedOAuthScopes !== undefined && config.AllowedOAuthScopes.length > 0 ? config.AllowedOAuthScopes : undefined,
            analyticsConfiguration: config.AnalyticsConfiguration !== undefined ? {
                applicationArn: config.AnalyticsConfiguration.ApplicationArn,
                applicationId: config.AnalyticsConfiguration.ApplicationId,
                externalId: config.AnalyticsConfiguration.ExternalId,
                roleArn: (0, cache_1.getResource)("role", (0, util_1.extractDataFromArn)(config.AnalyticsConfiguration.RoleArn, "resource")),
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
        new aws_cdk_lib_1.aws_cognito.CfnUserPoolClient(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Configurate the email
     * @param config configuration for email
     */
    configurateEmail(config) {
        // Configurate the email
        if (config.EmailConfiguration !== undefined) {
            this._userPool.addPropertyOverride("EmailConfiguration", {
                configurationSet: config.EmailConfiguration.ConfigurationSet,
                emailSendingAccount: config.EmailConfiguration.EmailSendingAccount,
                from: config.EmailConfiguration.From,
                replyToEmailAddress: config.EmailConfiguration.ReplyToEmailAddress,
                sourceArn: config.EmailConfiguration.SourceArn !== undefined ? (0, cache_1.getResource)("ses", (0, util_1.extractDataFromArn)(config.EmailConfiguration.SourceArn, "resource")) !== undefined ? (0, cache_1.getResource)("ses", (0, util_1.extractDataFromArn)(config.EmailConfiguration.SourceArn, "resource")) : config.EmailConfiguration.SourceArn : undefined
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
    configurateSchema(config) {
        // Extract a list of schema
        const schema = config.map((elem) => {
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
    getArn() {
        return this._userPool.attrArn;
    }
    /**
     * Get an id for user pool
     * @returns id for user pool
     */
    getId() {
        return this._userPool.ref;
    }
}
exports.UserPool = UserPool;
