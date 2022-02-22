import * as sts from "@aws-sdk/client-sts";
// Reponse
import { CODE, catchError } from "../../models/response";

export class STSSdk {
  private _client: sts.STSClient;

  /**
   * Create a sdk object for amazon sts
   * @param config configuration for client
   */
  constructor(config: any) {
    // Create the params for client
    const params: sts.STSClientConfig = {
      credentials: config.credentials ? {
        accessKeyId: config.credentials.AccessKeyId,
        expiration: config.credentials.Expiration ? new Date(config.credentials.Expiration) : undefined,
        secretAccessKey: config.credentials.SecretAccessKey,
        sessionToken: config.credentials.SessionToken
      } : undefined,
      region: config.region
    };
    // Create a client for amazon sts
    this._client = new sts.STSClient(params);
  }

  /**
   * Assume a role
   * @param sessionName session name
   * @param roleArn role arn
   * @returns credentials
   */
  public async assumeRole(sessionName: string, roleArn: string): Promise<any> {
    try {
      // Create an input to assume a role
      const input: sts.AssumeRoleCommandInput = {
        DurationSeconds: 900,
        RoleArn: roleArn,
        RoleSessionName: sessionName
      };
      // Create a command to assume a role
      const command: sts.AssumeRoleCommand = new sts.AssumeRoleCommand(input);
      // Send a command to assume a role
      const response: sts.AssumeRoleCommandOutput = await this._client.send(command);
      // Return
      return response.Credentials;
    } catch (err) {
      catchError(CODE.STS.ASSUME_ROLE, true, roleArn, err as Error);
      // Return
      return undefined;
    }
  }

  /**
   * Destroy a client for amazon sts
   */
  public destroy(): void {
    this._client.destroy();
  }
}