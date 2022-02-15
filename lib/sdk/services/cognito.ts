import * as cognito from "@aws-sdk/client-cognito-identity-provider";

// Set a client for cognito
let client: cognito.CognitoIdentityProviderClient;
// Set client by user pool
const clientIdMapping: any = {};

/**
 * Create the user pool client
 * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html
 * @param userPoolId user pool id
 * @param config configuration for user pool client
 * @returns user pool client id
 */
export async function createUserPoolClient(userPoolId: string, config: any): Promise<string> {
  // Create the input to create the user pool client
  const input: cognito.CreateUserPoolClientCommandInput = {
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
  const command: cognito.CreateUserPoolClientCommand = new cognito.CreateUserPoolClientCommand(input);
  // Send the command to create the user pool client
  const response: cognito.CreateUserPoolClientCommandOutput = await client.send(command);
  // Result
  if (response.UserPoolClient && response.UserPoolClient.ClientId) {
    return response.UserPoolClient.ClientId;
  } else {
    return "";
  }
}

/**
 * Create the user pool domain
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/createuserpooldomaincommand.html
 * @param userPoolId user pool id
 * @param domain domain
 * @param certificateArn certificateArn (for cloudFront) 
 */
export async function createUserPoolDomain(userPoolId: string, domain: string, certificateArn: string|undefined): Promise<void> {
  // Create the input to create user pool domain
  const input: cognito.CreateUserPoolDomainCommandInput = {
    CustomDomainConfig: certificateArn !== undefined ? {
      CertificateArn: certificateArn
    } : undefined,
    Domain: domain,
    UserPoolId: userPoolId
  };
  // Create the command to create user pool domain
  const command: cognito.CreateUserPoolDomainCommand = new cognito.CreateUserPoolDomainCommand(input);
  // Send the command to create user pool domain
  await client.send(command);
}

/**
 * Destroy a client for cognito
 */
export function destroyCognitoClient(): void {
  client.destroy();
}

/**
 * Get an id for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/listuserpoolscommand.html
 * @param userPoolName user pool name
 * @returns id for user pool
 */
export async function getUserPoolId(userPoolName: string): Promise<string> {
  let nextToken: string|undefined = undefined;
  do {
    // Create the input to get a list of user pool
    const input: cognito.ListUserPoolsCommandInput = {
      MaxResults: 60,
      NextToken: nextToken
    };
    // Create the command to get a list of user pool
    const command: cognito.ListUserPoolsCommand = new cognito.ListUserPoolsCommand(input);
    // Send the command to get a list of user pool
    const response: cognito.ListUserPoolsCommandOutput = await client.send(command);
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

/**
 * Get a user pool client id
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/createuserpoolclientcommand.html
 * @param userPoolId user pool id
 * @param clientId user pool client old id
 * @param clientName user pool client name
 * @returns user pool client id
 */
export async function getUserPoolClientId(userPoolId: string, clientId: string|undefined, clientName: string|undefined): Promise<string> {
  if (clientId) {
    const eClientId: string|undefined = clientIdMapping[clientId];
    if (eClientId) {
      return eClientId;
    } else if (clientName) {
      return await _getUsesrPoolClientId(userPoolId, clientName);
    } else {
      console.warn(`[WARNING] Not found current user pool client id (for ${clientId})`);
      return "";
    }
  } else if (clientName) {
    return await _getUsesrPoolClientId(userPoolId, clientName);
  } else {
    console.error(`[ERROR] Invalid parameter`);
    process.exit(1);
  }
}

/**
 * Get a user pool client id using client name
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/listuserpoolclientscommand.html
 * @param userPoolId user pool id
 * @param clientName user pool client name
 * @returns user pool client id
 */
async function _getUsesrPoolClientId(userPoolId: string, clientName: string): Promise<string> {
  let nextToken: string|undefined = undefined;
  do {
    // Create the input to get a list of client
    const input: cognito.ListUserPoolClientsCommandInput = {
      MaxResults: 50,
      NextToken: nextToken,
      UserPoolId: userPoolId,
    };
    // Create the command to get a list of client
    const command: cognito.ListUserPoolClientsCommand = new cognito.ListUserPoolClientsCommand(input);
    // Send the command to get a list of client
    const response: cognito.ListUserPoolClientsCommandOutput = await client.send(command);
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
export function initCognitoClient(): void {
  client = new cognito.CognitoIdentityProviderClient({ region: process.env.REGION });
}

/**
 * Set a MFA configuration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/setuserpoolmfaconfigcommand.html
 * @param userPoolId user pool id
 * @param config configuration for MFA configuration
 * @param externalId external id (for role)
 * @param snsCallerArn arn for sns
 */
export async function setMfaConfiguration(userPoolId: string, config: any, externalId: string|undefined, snsCallerArn: string|undefined): Promise<void> {
  // Create the input to set MFA
  const input: cognito.SetUserPoolMfaConfigCommandInput = {
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
  const command: cognito.SetUserPoolMfaConfigCommand = new cognito.SetUserPoolMfaConfigCommand(input);
  // Send the command to set MFA
  await client.send(command);
}

/**
 * Set a UI customization for user pool client
 * @param userPoolId user pool id
 * @param clientId user pool client id
 * @param config configuration for UI customization
 */
export async function setUICustomization(userPoolId: string, clientId: string, config: any): Promise<Boolean> {
  // Create the input to set ui customization
  const input: cognito.SetUICustomizationCommandInput = {
    UserPoolId: userPoolId,
    // Optional
    CSS: config.CSS,
    ClientId: clientId,
    // ImageFile: config.ImageUrl
  };
  // Create the command to set ui customization
  const command: cognito.SetUICustomizationCommand = new cognito.SetUICustomizationCommand(input);
  // Send the command to set ui customization
  await client.send(command);
  // Return
  return true;
}

/**
 * Update the email configuration for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/updateuserpoolcommand.html
 * @param userPoolId user pool id
 * @param config configuration for email
 */
export async function updateEmailConfiguration(userPoolId: string, config: any) {
  // Create the input to udpate email configuration
  const input: cognito.UpdateUserPoolCommandInput = {
    EmailConfiguration: config.EmailConfiguration,
    EmailVerificationMessage: config.EmailVerificationMessage,
    EmailVerificationSubject: config.EmailVerificationSubject,
    UserPoolId: userPoolId
  };
  // Create the command to update email configuration
  const command: cognito.UpdateUserPoolCommand = new cognito.UpdateUserPoolCommand(input);
  // Send the command to update email configuration
  await client.send(command);
}

/**
 * Update the lambda configuration for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/updateuserpoolcommand.html
 * @param userPoolId user pool id
 * @param config configuration for lambda
 */
export async function updateLambdaConfiguration(userPoolId: string, config: any) {
  // Create the input to update lambda configuration for user pool
  const input: cognito.UpdateUserPoolCommandInput = {
    LambdaConfig: config,
    UserPoolId: userPoolId,
  };
  // Create the command to update lambda configuration for user pool
  const command: cognito.UpdateUserPoolCommand = new cognito.UpdateUserPoolCommand(input);
  // Send the command to update lambda configuration
  await client.send(command);
}