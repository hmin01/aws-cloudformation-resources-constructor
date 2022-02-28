// AWS SDK
import * as cognito from "@aws-sdk/client-cognito-identity-provider";
// Response
import { CODE, catchError } from "../../models/response";
// Services
import { LambdaSdk } from "./lambda";
// Util
import { extractDataFromArn } from "../../utils/util";

export class CognitoSdk {
  private _client: cognito.CognitoIdentityProviderClient;
  private _mapping: any;

  /**
   * Create a sdk object for amazon cognito
   * @param config configuration for client
   */
  constructor(config: any) {
    // Create the params for client
    const params: cognito.CognitoIdentityProviderClientConfig = {
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
  public async createUserPoolClient(userPoolId: string, config: any): Promise<string> {
    try {
      // Create an input to create a user pool client
      const input: cognito.CreateUserPoolClientCommandInput = {
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
      const command: cognito.CreateUserPoolClientCommand = new cognito.CreateUserPoolClientCommand(input);
      // Send a command to create a user pool client
      const response: cognito.CreateUserPoolClientCommandOutput = await this._client.send(command);
      // Return
      if (response.UserPoolClient && response.UserPoolClient.ClientId) {
        // Store a mapping data
        if (!this._mapping[userPoolId]) {
          this._mapping[userPoolId] = {};
        }
        return this._mapping[userPoolId][config.ClientId] = response.UserPoolClient.ClientId as string;
      } else {
        return "";
      }
    } catch (err) {
      return catchError(CODE.ERROR.COGNITO.USERPOOL.CREATE_CLIENT, false, config.ClientName, err as Error);
    }
  }

  /**
   * Create a user pool domain
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/createuserpooldomaincommandinput.html
   * @param userPoolId user pool id
   * @param domain domain
   * @param certificateArn certification arn (for acm arn)
   */
  public async createUserPoolDomain(userPoolId: string, domain: string, certificateArn: string|undefined): Promise<void> {
    try {
      // Create an input to create a user pool domain
      const input: cognito.CreateUserPoolDomainCommandInput = {
        CustomDomainConfig: certificateArn !== undefined ? {
          CertificateArn: certificateArn
        } : undefined,
        Domain: domain,
        UserPoolId: userPoolId
      };
      // Create a command to create a user pool domain
      const command: cognito.CreateUserPoolDomainCommand = new cognito.CreateUserPoolDomainCommand(input);
      // Send a command to create a user pool domain
      await this._client.send(command);
    } catch (err) {
      catchError(CODE.ERROR.COGNITO.USERPOOL.CREATE_DOMAIN, false, userPoolId, err as Error);
    }
  }

  /**
   * Destroy a client for amazon cognito
   */
  public destroy(): void {
    this._client.destroy();
  }

  /**
   * Get a user pool arn
   * @param userPoolId user pool id
   * @returns user pool arn
   */
  public async getUserPoolArn(userPoolId: string): Promise<string> {
    try {
      // Create an input to get a user pool arn
      const input: cognito.DescribeUserPoolCommandInput = {
        UserPoolId: userPoolId
      };
      // Create a command to get a user pool arn
      const command: cognito.DescribeUserPoolCommand = new cognito.DescribeUserPoolCommand(input);
      // Send a command to get a user pool arn
      const response: cognito.DescribeUserPoolCommandOutput = await this._client.send(command);
      // Return
      return response.UserPool && response.UserPool.Arn ? response.UserPool.Arn as string : "";
    } catch (err) {
      return catchError(CODE.ERROR.COGNITO.USERPOOL.GET_ARN, false, userPoolId, err as Error);
    }
  }

  /**
   * Get a user pool name
   * @param userPoolId user pool id
   * @returns user pool name
   */
  public async getUserPoolName(userPoolId: string): Promise<string> {
    try {
      // Create an input to get a user pool name
      const input: cognito.DescribeUserPoolCommandInput = {
        UserPoolId: userPoolId
      };
      // Create a command to get a user pool name
      const command: cognito.DescribeUserPoolCommand = new cognito.DescribeUserPoolCommand(input);
      // Send a command to get a user pool name
      const response: cognito.DescribeUserPoolCommandOutput = await this._client.send(command);
      // Return
      return response.UserPool && response.UserPool.Name ? response.UserPool.Name as string : "";
    } catch (err) {
      return catchError(CODE.ERROR.COGNITO.USERPOOL.GET_NAME, false, userPoolId, err as Error);
    }
  }

  /**
   * Get a user pool id
   * @param userPoolName user pool name 
   * @returns user pool id
   */
  public async getUserPoolId(userPoolName: string): Promise<string> {
    try {
      let nextToken: string|undefined = undefined;
      // Get a list of user pool
      do {
        // Create an input to get a list of user pool
        const input: cognito.ListUserPoolsCommandInput = {
          MaxResults: 60,
          NextToken: nextToken
        };
        // Create a command to get a list of user pool
        const command: cognito.ListUserPoolsCommand = new cognito.ListUserPoolsCommand(input);
        // Send a command to get a list of user pool
        const response: cognito.ListUserPoolsCommandOutput = await this._client.send(command);

        // Process a result
        if (response.UserPools) {
          // Find a user pool
          for (const userPool of response.UserPools) {
            if (userPool.Name && userPool.Name === userPoolName) {
              return userPool.Id as string;
            }
          }
        }
        // Escape condition
        nextToken = response.NextToken
        if (!nextToken) break;
      } while (true);
      // Return
      return "";
    } catch (err) {
      return catchError(CODE.ERROR.COGNITO.USERPOOL.GET_ID, false, userPoolName, err as Error);
    }
  }

  /**
   * Get a user pool client id
   * @param userPoolId user pool id
   * @param type qualifier type [name|id]
   * @param qualifier previous user pool client id or user pool client name
   * @returns user pool client id
   */
  public async getUserPoolClientId(userPoolId: string, type: string, qualifier: string): Promise<string> {
    try {
      // Check a type
      if (type === "id") {
        if (this._mapping[userPoolId] && this._mapping[userPoolId][qualifier]) {
          return this._mapping[userPoolId][qualifier];
        }
      } else {
        // Create an input to get a list of user pool client
        const input: cognito.ListUserPoolClientsCommandInput = {
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
                return userPoolClient.ClientId as string;
              }
            }
          }
        }        
      }
      return "";
    } catch (err) {
      return catchError(CODE.ERROR.COGNITO.USERPOOL.GET_CLIENT_ID, false, qualifier, err as Error);
    }
  }

  /**
   * Set a MFA confiugration
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/setuserpoolmfaconfigcommandinput.html
   * @param userPoolId user pool id
   * @param config configuration for MFA configuration
   */
  public async setMFAConfiguration(userPoolId: string, config: any): Promise<void> {
    try {
      // Create an input to set MFA
      const input: cognito.SetUserPoolMfaConfigCommandInput = {
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
      const command: cognito.SetUserPoolMfaConfigCommand = new cognito.SetUserPoolMfaConfigCommand(input);
      // Send a command to set MFA
      await this._client.send(command);
    } catch (err) {
      catchError(CODE.ERROR.COGNITO.USERPOOL.SET_MFA_CONFIG, false, userPoolId, err as Error);
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
  public async setUICustomization(userPoolId: string, clientId: string, config: any): Promise<boolean> {
    try {
      // Create an input to set ui customization
      const input: cognito.SetUICustomizationCommandInput = {
        ClientId: clientId,
        CSS: config.CSS,
        // ImageFile: config.ImageUrl
        UserPoolId: userPoolId
      };
      // Create a command to set ui customization
      const command: cognito.SetUICustomizationCommand = new cognito.SetUICustomizationCommand(input);
      // Send a command to set ui customization
      await this._client.send(command);
      // Return
      return true;
    } catch (err) {
      catchError(CODE.ERROR.COGNITO.USERPOOL.SET_UI_CUSTOM, false, clientId, err as Error);
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
  public async updateEmailConfiguration(userPoolId: string, config: any): Promise<boolean> {
    try {
      // Create an input to udpate email configuration
      const input: cognito.UpdateUserPoolCommandInput = {
        EmailConfiguration: config.EmailConfiguration,
        EmailVerificationMessage: config.EmailVerificationMessage,
        EmailVerificationSubject: config.EmailVerificationSubject,
        UserPoolId: userPoolId
      };
      // Create a command to update email configuration
      const command: cognito.UpdateUserPoolCommand = new cognito.UpdateUserPoolCommand(input);
      // Send a command to update email configuration
      await this._client.send(command);

      // Return
      return true;
    } catch (err) {
      catchError(CODE.ERROR.COGNITO.USERPOOL.SET_EMAIL_CONFIG, false, userPoolId, err as Error);
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
  public async updateLambdaConfiguration(userPoolId: string, config: any): Promise<boolean> {
    try {
      // Create a sdk object for lambda
      const lambda: LambdaSdk = new LambdaSdk({ region: process.env.TARGET_REGION });
      // Refactoring a lambda configuration data
      const lambdaConfig: any = {};
      for (const key of Object.keys(config)) {
        // Extract a previous lambda arn
        const prevFunctionArn: string = config[key];
        // Extract a lambda functino name and qualifier
        const functionName: string = extractDataFromArn(prevFunctionArn, "resource");
        const qualifier: string = extractDataFromArn(prevFunctionArn, "qualifier");
        // Get a lambda arn
        const functionArn: string = await lambda.getFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
        // Set a lambda arn
        if (functionArn !== "") {
          lambdaConfig[key] = functionArn;
        }
      }
      // Destroy a sdk object for lambda
      lambda.destroy();

      // Create an input to update lambda configuration for user pool
      const input: cognito.UpdateUserPoolCommandInput = {
        LambdaConfig: lambdaConfig,
        UserPoolId: userPoolId,
      };
      // Create a command to update lambda configuration for user pool
      const command: cognito.UpdateUserPoolCommand = new cognito.UpdateUserPoolCommand(input);
      // Send a command to update lambda configuration
      await this._client.send(command);
      // Return
      return true;
    } catch (err) {
      catchError(CODE.ERROR.COGNITO.USERPOOL.SET_LAMBDA_CONFIG, false, userPoolId, err as Error);
      // Return
      return false;
    }
  }

  /**
   * Update a verification message template (call a set email configuration)
   * @param userPoolId user pool id
   * @param template template
   */
   public async updateVerificationMessageTemplate(userPoolId: string, template: any): Promise<void> {
    try {
      // Create an input to update a verification message template
      const input: cognito.UpdateUserPoolCommandInput = {
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
      const command: cognito.UpdateUserPoolCommand = new cognito.UpdateUserPoolCommand(input);
      // Send a command to update a verification message template
      await this._client.send(command);
    } catch (err) {
      catchError(CODE.ERROR.COGNITO.USERPOOL.UPDATE_VERIFICATION_MESSAGE_TEMPLATE, false, userPoolId, err as Error);
    }
  }
}