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
exports.updateLambdaConfiguration = exports.updateEmailConfiguration = exports.setUICustomization = exports.setMfaConfiguration = exports.initCognitoClient = exports.getUserPoolClientId = exports.getUserPoolId = exports.destroyCognitoClient = exports.createUserPoolDomain = exports.createUserPoolClient = void 0;
const cognito = __importStar(require("@aws-sdk/client-cognito-identity-provider"));
// Set a client for cognito
let client;
// Set client by user pool
const clientIdMapping = {};
/**
 * Create the user pool client
 * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html
 * @param userPoolId user pool id
 * @param config configuration for user pool client
 * @returns user pool client id
 */
async function createUserPoolClient(userPoolId, config) {
    // Create the input to create the user pool client
    const input = {
        ClientName: config.ClientName,
        UserPoolId: userPoolId,
        // Optional
        AccessTokenValidity: config.AccessTokenValidity !== undefined ? Number(config.AccessTokenValidity) : undefined,
        AllowedOAuthFlows: config.AllowedOAuthFlows,
        AllowedOAuthFlowsUserPoolClient: config.AllowedOAuthFlowsUserPoolClient,
        AllowedOAuthScopes: config.AllowedOAuthScopes,
        CallbackURLs: config.CallbackURLs,
        DefaultRedirectURI: config.DefaultRedirectURI,
        EnableTokenRevocation: config.EnableTokenRevocation,
        ExplicitAuthFlows: config.ExplicitAuthFlows,
        GenerateSecret: true,
        IdTokenValidity: config.IdTokenValidity !== undefined ? Number(config.IdTokenValidity) : undefined,
        LogoutURLs: config.LogoutURLs,
        PreventUserExistenceErrors: config.PreventUserExistenceErrors,
        ReadAttributes: config.ReadAttributes,
        RefreshTokenValidity: config.RefreshTokenValidity !== undefined ? Number(config.RefreshTokenValidity) : undefined,
        SupportedIdentityProviders: config.SupportedIdentityProviders,
        TokenValidityUnits: config.TokenValidityUnits,
        WriteAttributes: config.WriteAttributes
    };
    // Create the command to create the user pool client
    const command = new cognito.CreateUserPoolClientCommand(input);
    // Send the command to create the user pool client
    const response = await client.send(command);
    // Result
    if (response.UserPoolClient && response.UserPoolClient.ClientId) {
        return response.UserPoolClient.ClientId;
    }
    else {
        return "";
    }
}
exports.createUserPoolClient = createUserPoolClient;
/**
 * Create the user pool domain
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/createuserpooldomaincommand.html
 * @param userPoolId user pool id
 * @param domain domain
 * @param certificateArn certificateArn (for cloudFront)
 */
async function createUserPoolDomain(userPoolId, domain, certificateArn) {
    // Create the input to create user pool domain
    const input = {
        CustomDomainConfig: certificateArn !== undefined ? {
            CertificateArn: certificateArn
        } : undefined,
        Domain: domain,
        UserPoolId: userPoolId
    };
    // Create the command to create user pool domain
    const command = new cognito.CreateUserPoolDomainCommand(input);
    // Send the command to create user pool domain
    await client.send(command);
}
exports.createUserPoolDomain = createUserPoolDomain;
/**
 * Destroy a client for cognito
 */
function destroyCognitoClient() {
    client.destroy();
}
exports.destroyCognitoClient = destroyCognitoClient;
/**
 * Get an id for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/listuserpoolscommand.html
 * @param userPoolName user pool name
 * @returns id for user pool
 */
async function getUserPoolId(userPoolName) {
    let nextToken = undefined;
    do {
        // Create the input to get a list of user pool
        const input = {
            MaxResults: 60,
            NextToken: nextToken
        };
        // Create the command to get a list of user pool
        const command = new cognito.ListUserPoolsCommand(input);
        // Send the command to get a list of user pool
        const response = await client.send(command);
        // Result
        if (response.UserPools) {
            for (const elem of response.UserPools) {
                if (elem.Name && elem.Name == userPoolName) {
                    if (elem.Id) {
                        return elem.Id;
                    }
                    break;
                }
            }
        }
        //Escape
        nextToken = response.NextToken;
        if (!nextToken) {
            break;
        }
    } while (true);
    // Return
    console.warn(`[WARNING] Not found user pool id (for ${userPoolName})`);
    return "";
}
exports.getUserPoolId = getUserPoolId;
/**
 * Get a user pool client id
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/createuserpoolclientcommand.html
 * @param userPoolId user pool id
 * @param clientId user pool client old id
 * @param clientName user pool client name
 * @returns user pool client id
 */
async function getUserPoolClientId(userPoolId, clientId, clientName) {
    if (clientId) {
        const eClientId = clientIdMapping[clientId];
        if (eClientId) {
            return eClientId;
        }
        else if (clientName) {
            return await _getUsesrPoolClientId(userPoolId, clientName);
        }
        else {
            console.warn(`[WARNING] Not found current user pool client id (for ${clientId})`);
            return "";
        }
    }
    else if (clientName) {
        return await _getUsesrPoolClientId(userPoolId, clientName);
    }
    else {
        console.error(`[ERROR] Invalid parameter`);
        process.exit(1);
    }
}
exports.getUserPoolClientId = getUserPoolClientId;
/**
 * Get a user pool client id using client name
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/listuserpoolclientscommand.html
 * @param userPoolId user pool id
 * @param clientName user pool client name
 * @returns user pool client id
 */
async function _getUsesrPoolClientId(userPoolId, clientName) {
    let nextToken = undefined;
    do {
        // Create the input to get a list of client
        const input = {
            MaxResults: 50,
            NextToken: nextToken,
            UserPoolId: userPoolId,
        };
        // Create the command to get a list of client
        const command = new cognito.ListUserPoolClientsCommand(input);
        // Send the command to get a list of client
        const response = await client.send(command);
        // Result
        if (response.UserPoolClients) {
            for (const client of response.UserPoolClients) {
                if (client.ClientName && clientName === clientName) {
                    if (client.ClientId) {
                        return client.ClientId;
                    }
                    break;
                }
            }
        }
        // Escape
        nextToken = response.NextToken;
        if (!nextToken) {
            break;
        }
    } while (true);
    // Return
    console.warn(`[WARNING] Not found user pool client id (for ${clientName})`);
    return "";
}
/**
 * Init a client for cognito
 */
function initCognitoClient() {
    client = new cognito.CognitoIdentityProviderClient({ region: process.env.REGION });
}
exports.initCognitoClient = initCognitoClient;
/**
 * Set a MFA configuration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/setuserpoolmfaconfigcommand.html
 * @param userPoolId user pool id
 * @param config configuration for MFA configuration
 * @param externalId external id (for role)
 * @param snsCallerArn arn for sns
 */
async function setMfaConfiguration(userPoolId, config, externalId, snsCallerArn) {
    // Create the input to set MFA
    const input = {
        UserPoolId: userPoolId,
        // Optional
        MfaConfiguration: config.MfaConfiguration,
        SmsMfaConfiguration: config.SmsMfaConfiguration !== undefined ? {
            SmsAuthenticationMessage: config.SmsMfaConfiguration.SmsAuthenticationMessage,
            SmsConfiguration: {
                ExternalId: externalId,
                SnsCallerArn: snsCallerArn
            }
        } : undefined,
        SoftwareTokenMfaConfiguration: config.SoftwareTokenMfaConfiguration !== undefined ? {
            Enabled: config.SoftwareTokenMfaConfiguration.Enabled
        } : undefined,
    };
    // Create the command to set MFA
    const command = new cognito.SetUserPoolMfaConfigCommand(input);
    // Send the command to set MFA
    await client.send(command);
}
exports.setMfaConfiguration = setMfaConfiguration;
/**
 * Set a UI customization for user pool client
 * @param userPoolId user pool id
 * @param clientId user pool client id
 * @param config configuration for UI customization
 */
async function setUICustomization(userPoolId, clientId, config) {
    // Create the input to set ui customization
    const input = {
        UserPoolId: userPoolId,
        // Optional
        CSS: config.CSS,
        ClientId: clientId,
        // ImageFile: config.ImageUrl
    };
    // Create the command to set ui customization
    const command = new cognito.SetUICustomizationCommand(input);
    // Send the command to set ui customization
    await client.send(command);
    // Return
    return true;
}
exports.setUICustomization = setUICustomization;
/**
 * Update the email configuration for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/updateuserpoolcommand.html
 * @param userPoolId user pool id
 * @param config configuration for email
 */
async function updateEmailConfiguration(userPoolId, config) {
    // Create the input to udpate email configuration
    const input = {
        EmailConfiguration: config.EmailConfiguration,
        EmailVerificationMessage: config.EmailVerificationMessage,
        EmailVerificationSubject: config.EmailVerificationSubject,
        UserPoolId: userPoolId
    };
    // Create the command to update email configuration
    const command = new cognito.UpdateUserPoolCommand(input);
    // Send the command to update email configuration
    await client.send(command);
}
exports.updateEmailConfiguration = updateEmailConfiguration;
/**
 * Update the lambda configuration for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/updateuserpoolcommand.html
 * @param userPoolId user pool id
 * @param config configuration for lambda
 */
async function updateLambdaConfiguration(userPoolId, config) {
    // Create the input to update lambda configuration for user pool
    const input = {
        LambdaConfig: config,
        UserPoolId: userPoolId,
    };
    // Create the command to update lambda configuration for user pool
    const command = new cognito.UpdateUserPoolCommand(input);
    // Send the command to update lambda configuration
    await client.send(command);
}
exports.updateLambdaConfiguration = updateLambdaConfiguration;
