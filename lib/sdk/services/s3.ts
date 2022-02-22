import { Readable } from "stream";
// AWS SDK
import * as s3 from "@aws-sdk/client-s3";
// Response
import { CODE, catchError } from "../../models/response";

export interface S3Object {
  filename: string;
  extension: string;
  data: Readable;
}

export class S3Sdk {
  private _client: s3.S3Client;

  /**
   * Create a sdk object for amazon s3
   * @param config configuration for client
   */
  constructor(config: any) {
    // Create the params for client
    const params: s3.S3ClientConfig = {
      credentials: config.credentials ? {
        accessKeyId: config.credentials.AccessKeyId,
        expiration: config.credentials.Expiration ? new Date(config.credentials.Expiration) : undefined,
        secretAccessKey: config.credentials.SecretAccessKey,
        sessionToken: config.credentials.SessionToken
      } : undefined,
      region: config.region
    };
    // Create a client for amazon s3
    this._client = new s3.S3Client(params);
  }

  /**
   * Get a object in amazon s3
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectcommandinput.html
   * @param bucket bucket name
   * @param key object key
   * @param versionId version id
   * @returns object data (stream)
   */
  private async _getObject(bucket: string, key: string, versionId?: string): Promise<any> {
    try {
      // Create an input to get the object
      const input: s3.GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        VersionId: versionId
      };
      // Create a command to get the object
      const command: s3.GetObjectCommand = new s3.GetObjectCommand(input);
      // Send a command to get a object
      const response: s3.GetObjectCommandOutput = await this._client.send(command);
      // Return
      return response.Body;
    } catch (err) {
      catchError(CODE.ERROR.S3.OBJECT.GET_ITEM, true, `${bucket}/${key}`, err as Error);
      // Return
      return undefined;
    }
  }

  /**
   * Destroy a client for amazon s3
   */
  public destroy(): void {
    this._client.destroy();
  }

  /**
   * Get a object from s3 url
   * @param s3Url s3 url
   * @returns s3 object data
   */
  public async getObjectByUrl(s3Url: string): Promise<S3Object> {
    // Extract the bucket name and key from url
    let temp: string[] = s3Url.replace(/^s3:\/\//, "").split("/");
    const bucket: string = temp[0];
    const key:string = temp.slice(1).join("/");
    // Extract a file name
    temp = key.split("/");
    const filename: string = temp[temp.length - 1];
    // Extract an extension
    temp = filename.split(".");
    const extension: string = temp[temp.length - 1];

    // Get a object
    const data: Readable = await this._getObject(bucket, key);
    // Return
    return { filename, extension, data };
  }
}