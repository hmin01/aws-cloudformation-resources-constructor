"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoSdk = void 0;
// AWS SDK
const cognito = __importStar(require("@aws-sdk/client-cognito-identity-provider"));
// Response
const response_1 = require("../../models/response");
// Services
const lambda_1 = require("./lambda");
// Util
const util_1 = require("../../utils/util");
class CognitoSdk {
    /**
     * Create a sdk object for amazon cognito
     * @param config configuration for client
     */
    constructor(config) {
        // Create the params for client
        const params = {
            credentials: config.credentials ? {
                accessKeyId: config.credentials.AccessKeyId,
                expiration: config.credentials.Expiration ? new Date(config.credentials.Expiration) : undefined,
                secretAccessKey: config.credentials.SecretAccessKey,
                sessionToken: config.credentials.SessionToken
            } : undefined,
            region: config.region
        };
        // Create a client for amazon cognito
        this._client = new cognito.CognitoIdentityProviderClient(params);
        // Set a user pool mapping data
        this._mapping = {};
    }
    /**
     * Create a user pool client
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/createuserpoolclientcommandinput.html
     * @param userPoolId user pool id
     * @param config configuration for user pool client
     * @returns user pool client id
     */
    async createUserPoolClient(userPoolId, config) {
        try {
            // Create an input to create a user pool client
            const input = {
                AccessTokenValidity: config.AccessTokenValidity ? Number(config.AccessTokenValidity) : undefined,
                AllowedOAuthFlows: config.AllowedOAuthFlows,
                AllowedOAuthFlowsUserPoolClient: config.AllowedOAuthFlowsUserPoolClient,
                AllowedOAuthScopes: config.AllowedOAuthScopes,
                CallbackURLs: config.CallbackURLs,
                ClientName: config.ClientName,
                DefaultRedirectURI: config.DefaultRedirectURI,
                EnableTokenRevocation: config.EnableTokenRevocation,
                ExplicitAuthFlows: config.ExplicitAuthFlows,
                GenerateSecret: true,
                IdTokenValidity: config.IdTokenValidity ? Number(config.IdTokenValidity) : undefined,
                LogoutURLs: config.LogoutURLs,
                PreventUserExistenceErrors: config.PreventUserExistenceErrors,
                ReadAttributes: config.ReadAttributes,
                RefreshTokenValidity: config.RefreshTokenValidity ? Number(config.RefreshTokenValidity) : undefined,
                SupportedIdentityProviders: config.SupportedIdentityProviders,
                TokenValidityUnits: config.TokenValidityUnits,
                UserPoolId: userPoolId,
                WriteAttributes: config.WriteAttributes
            };
            // Create a command to create a user pool client
            const command = new cognito.CreateUserPoolClientCommand(input);
            // Send a command to create a user pool client
            const response = await this._client.send(command);
            // Return
            if (response.UserPoolClient && response.UserPoolClient.ClientId) {
                // Store a mapping data
                if (!this._mapping[userPoolId]) {
                    this._mapping[userPoolId] = {};
                }
                return this._mapping[userPoolId][config.ClientId] = response.UserPoolClient.ClientId;
            }
            else {
                return "";
            }
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.CREATE_CLIENT, false, config.ClientName, err);
        }
    }
    /**
     * Create a user pool domain
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/createuserpooldomaincommandinput.html
     * @param userPoolId user pool id
     * @param domain domain
     * @param certificateArn certification arn (for acm arn)
     */
    async createUserPoolDomain(userPoolId, domain, certificateArn) {
        try {
            // Create an input to create a user pool domain
            const input = {
                CustomDomainConfig: certificateArn !== undefined ? {
                    CertificateArn: certificateArn
                } : undefined,
                Domain: domain,
                UserPoolId: userPoolId
            };
            // Create a command to create a user pool domain
            const command = new cognito.CreateUserPoolDomainCommand(input);
            // Send a command to create a user pool domain
            await this._client.send(command);
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.CREATE_DOMAIN, false, userPoolId, err);
        }
    }
    /**
     * Destroy a client for amazon cognito
     */
    destroy() {
        this._client.destroy();
    }
    /**
     * Get a user pool arn
     * @param userPoolId user pool id
     * @returns user pool arn
     */
    async getUserPoolArn(userPoolId) {
        try {
            // Create an input to get a user pool arn
            const input = {
                UserPoolId: userPoolId
            };
            // Create a command to get a user pool arn
            const command = new cognito.DescribeUserPoolCommand(input);
            // Send a command to get a user pool arn
            const response = await this._client.send(command);
            // Return
            return response.UserPool && response.UserPool.Arn ? response.UserPool.Arn : "";
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.GET_ARN, false, userPoolId, err);
        }
    }
    /**
     * Get a user pool name
     * @param userPoolId user pool id
     * @returns user pool name
     */
    async getUserPoolName(userPoolId) {
        try {
            // Create an input to get a user pool name
            const input = {
                UserPoolId: userPoolId
            };
            // Create a command to get a user pool name
            const command = new cognito.DescribeUserPoolCommand(input);
            // Send a command to get a user pool name
            const response = await this._client.send(command);
            // Return
            return response.UserPool && response.UserPool.Name ? response.UserPool.Name : "";
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.GET_NAME, false, userPoolId, err);
        }
    }
    /**
     * Get a user pool id
     * @param userPoolName user pool name
     * @returns user pool id
     */
    async getUserPoolId(userPoolName) {
        try {
            let nextToken = undefined;
            // Get a list of user pool
            do {
                // Create an input to get a list of user pool
                const input = {
                    MaxResults: 60,
                    NextToken: nextToken
                };
                // Create a command to get a list of user pool
                const command = new cognito.ListUserPoolsCommand(input);
                // Send a command to get a list of user pool
                const response = await this._client.send(command);
                // Process a result
                if (response.UserPools) {
                    // Find a user pool
                    for (const userPool of response.UserPools) {
                        if (userPool.Name && userPool.Name === userPoolName) {
                            return userPool.Id;
                        }
                    }
                }
                // Escape condition
                nextToken = response.NextToken;
                if (!nextToken)
                    break;
            } while (true);
            // Return
            return "";
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.GET_ID, false, userPoolName, err);
        }
    }
    /**
     * Get a user pool client id
     * @param userPoolId user pool id
     * @param type qualifier type [name|id]
     * @param qualifier previous user pool client id or user pool client name
     * @returns user pool client id
     */
    async getUserPoolClientId(userPoolId, type, qualifier) {
        try {
            // Check a type
            if (type === "id") {
                if (this._mapping[userPoolId] && this._mapping[userPoolId][qualifier]) {
                    return this._mapping[userPoolId][qualifier];
                }
            }
            else {
                // Create an input to get a list of user pool client
                const input = {
                    MaxResults: 60,
                    UserPoolId: userPoolId
                };
                // Create a paginator
                const paginator = cognito.paginateListUserPoolClients({ client: this._client }, input);
                // Find a user pool client id
                for await (const page of paginator) {
                    if (page.UserPoolClients) {
                        for (const userPoolClient of page.UserPoolClients) {
                            if (userPoolClient.ClientName && userPoolClient.ClientName === qualifier) {
                                return userPoolClient.ClientId;
                            }
                        }
                    }
                }
            }
            return "";
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.GET_CLIENT_ID, false, qualifier, err);
        }
    }
    /**
     * Set a MFA confiugration
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/setuserpoolmfaconfigcommandinput.html
     * @param userPoolId user pool id
     * @param config configuration for MFA configuration
     */
    async setMFAConfiguration(userPoolId, config) {
        try {
            // Create an input to set MFA
            const input = {
                MfaConfiguration: config.MfaConfiguration,
                SmsMfaConfiguration: config.SmsMfaConfiguration !== undefined ? {
                    SmsAuthenticationMessage: config.SmsMfaConfiguration.SmsAuthenticationMessage,
                    SmsConfiguration: {
                        ExternalId: config.SmsMfaConfiguration.SmsConfiguration.ExternalId,
                        SnsCallerArn: config.SmsMfaConfiguration.SmsConfiguration.SnsCallerArn
                    }
                } : undefined,
                SoftwareTokenMfaConfiguration: config.SoftwareTokenMfaConfiguration !== undefined ? {
                    Enabled: config.SoftwareTokenMfaConfiguration.Enabled
                } : undefined,
                UserPoolId: userPoolId
            };
            // Create a command to set MFA
            const command = new cognito.SetUserPoolMfaConfigCommand(input);
            // Send a command to set MFA
            await this._client.send(command);
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.SET_MFA_CONFIG, false, userPoolId, err);
        }
    }
    /**
     * Set a UI customization
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/setuicustomizationcommandinput.html
     * @param userPoolId user pool id
     * @param clientId user pool client id
     * @param config configuration for UI customization
     * @returns result
     */
    async setUICustomization(userPoolId, clientId, config) {
        try {
            // Create an input to set ui customization
            const input = {
                ClientId: clientId,
                CSS: config.CSS,
                // ImageFile: config.ImageUrl
                UserPoolId: userPoolId
            };
            // Create a command to set ui customization
            const command = new cognito.SetUICustomizationCommand(input);
            // Send a command to set ui customization
            await this._client.send(command);
            // Return
            return true;
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.SET_UI_CUSTOM, false, clientId, err);
            // Return
            return false;
        }
    }
    /**
     * Update an email configuraion
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/updateuserpoolcommandinput.html
     * @param userPoolId user pool id
     * @param config configuration for email
     * @returns result
     */
    async updateEmailConfiguration(userPoolId, config) {
        try {
            // Create an input to udpate email configuration
            const input = {
                EmailConfiguration: config.EmailConfiguration,
                EmailVerificationMessage: config.EmailVerificationMessage,
                EmailVerificationSubject: config.EmailVerificationSubject,
                UserPoolId: userPoolId
            };
            // Create a command to update email configuration
            const command = new cognito.UpdateUserPoolCommand(input);
            // Send a command to update email configuration
            await this._client.send(command);
            // Return
            return true;
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.SET_EMAIL_CONFIG, false, userPoolId, err);
            // Return
            return false;
        }
    }
    /**
     * Update a lambda configuration
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/modules/lambdaconfigtype.html
     * @param userPoolId user pool id
     * @param config configuration for lambda
     * @returns result
     */
    async updateLambdaConfiguration(userPoolId, config) {
        try {
            // Create a sdk object for lambda
            const lambda = new lambda_1.LambdaSdk({ region: process.env.TARGET_REGION });
            // Refactoring a lambda configuration data
            const lambdaConfig = {};
            for (const key of Object.keys(config)) {
                // Extract a previous lambda arn
                const prevFunctionArn = config[key];
                // Extract a lambda functino name and qualifier
                const functionName = (0, util_1.extractDataFromArn)(prevFunctionArn, "resource");
                const qualifier = (0, util_1.extractDataFromArn)(prevFunctionArn, "qualifier");
                // Get a lambda arn
                const functionArn = await lambda.getFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
                // Set a lambda arn
                if (functionArn !== "") {
                    lambdaConfig[key] = functionArn;
                }
            }
            // Destroy a sdk object for lambda
            lambda.destroy();
            // Create an input to update lambda configuration for user pool
            const input = {
                LambdaConfig: lambdaConfig,
                UserPoolId: userPoolId,
            };
            // Create a command to update lambda configuration for user pool
            const command = new cognito.UpdateUserPoolCommand(input);
            // Send a command to update lambda configuration
            await this._client.send(command);
            // Return
            return true;
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.SET_LAMBDA_CONFIG, false, userPoolId, err);
            // Return
            return false;
        }
    }
    /**
     * Update a verification message template (call a set email configuration)
     * @param userPoolId user pool id
     * @param template template
     */
    async updateVerificationMessageTemplate(userPoolId, template) {
        try {
            // Create an input to update a verification message template
            const input = {
                UserPoolId: userPoolId,
                VerificationMessageTemplate: {
                    DefaultEmailOption: template.DefaultEmailOption,
                    EmailMessage: template.EmailMessage,
                    EmailMessageByLink: template.EmailMessageByLink,
                    EmailSubject: template.EmailSubject,
                    EmailSubjectByLink: template.EmailSubjectByLink,
                    SmsMessage: template.SmsMessage
                }
            };
            // Create a command to update a verification message template
            const command = new cognito.UpdateUserPoolCommand(input);
            // Send a command to update a verification message template
            await this._client.send(command);
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.COGNITO.USERPOOL.UPDATE_VERIFICATION_MESSAGE_TEMPLATE, false, userPoolId, err);
        }
    }
}
exports.CognitoSdk = CognitoSdk;
