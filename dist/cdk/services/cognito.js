"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPool = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const util_1 = require("../../utils/util");
const defaultSchema = { sub: true, name: true, given_name: true, family_name: true, middle_name: true, nickname: true, preferred_username: true, profile: true, picture: true, website: true, email: true, email_verified: true, gender: true, birthdate: true, zoneinfo: true, locale: true, phone_number: true, phone_number_verified: true, address: true, updated_at: true };
class UserPool {
    /**
     * Create the cognito user pool
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html
     * @param scope scope context
     * @param config configuration for user pool
     */
    constructor(scope, config) {
        this._scope = scope;
        // Extract the schema
        const schema = [];
        if (config.SchemaAttributes) {
            for (const elem of config.SchemaAttributes) {
                if (!defaultSchema(elem.Name)) {
                    schema.push({
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
                    });
                }
            }
        }
        // Create the properties for cognito user pool
        const props = {
            accountRecoverySetting: config.AccountRecoverySetting !== undefined ? {
                recoveryMechanisms: config.AccountRecoverySetting.RecoveryMechanisms.map((elem) => {
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
            schema: schema.length > 0 ? schema : undefined,
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
        this._userPool = new aws_cdk_lib_1.aws_cognito.CfnUserPool(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Create the default domain
     * @param domain domain
     */
    createDefaultDomain(domain) {
        // Create the properties for user pool domain
        const props = {
            domain: domain,
            userPoolId: this._userPool.ref
        };
        // Create the user pool default domain
        new aws_cdk_lib_1.aws_cognito.CfnUserPoolDomain(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Create a resource server for user pool
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolresourceserver.html
     * @param config configuration for resource server
     */
    createResourceServer(config) {
        // Create the properties for user pool resource server
        const props = {
            identifier: config.Identifier,
            name: config.Name,
            userPoolId: this._userPool.ref,
            // Optional
            scopes: config.Scopes !== undefined ? config.Scopes.map((elem) => {
                return {
                    scopeDescription: elem.ScopeDescription,
                    scopeName: elem.ScopeName
                };
            }) : undefined
        };
        // Create a user pool resource server
        new aws_cdk_lib_1.aws_cognito.CfnUserPoolResourceServer(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
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
    /**
     * Get a provider name for user pool
     * @returns provider name for user pool
     */
    getProviderName() {
        return this._userPool.attrProviderName;
    }
    /**
     * Get a provider url for user pool
     * @returns provider url for user pool
     */
    getProviderUrl() {
        return this._userPool.attrProviderUrl;
    }
}
exports.UserPool = UserPool;
