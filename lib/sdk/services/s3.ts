// AWS SDK
import * as s3 from "@aws-sdk/client-s3";

export interface S3Object {
  filename: string;
  extension: string;
  data: ReadableStream;
}

export class S3Sdk {
  private _client: s3.S3Client;

  /**
   * Create the sdk object for amazon s3
   * @param config configuration for client
   */
  constructor(config: any) {
    // Create the client for amazon s3
    this._client = new s3.S3Client(config);
  }

  /**
   * Get a object in amazon s3
   * @param bucket bucket name
   * @param key object key
   * @param versionId version id
   * @returns file data (stream)
   */
  private async _getObject(bucket: string, key: string, versionId?: string): Promise<ReadableStream<any>> {
    try {
      // Create the input to get the object
      const input: s3.GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        VersionId: versionId
      };
      // Create the command to get the object
      const command: s3.GetObjectCommand = new s3.GetObjectCommand(input);
      // Send the command to get a object
      const response: s3.GetObjectCommandOutput = await this._client.send(command);
      // Return
      return response.Body as ReadableStream;
    } catch (err) {
      console.error(`[ERROR] Failed to get the object from amazon s3\n-> ${err}`);
      process.exit(1);
    }
  }

  /**
   * Destroy the client for amazon s3
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
    const data: ReadableStream = await this._getObject(bucket, key);
    // Return
    return { filename, extension, data };
  }
}