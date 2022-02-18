export interface S3Object {
    filename: string;
    extension: string;
    data: ReadableStream;
}
export declare class S3Sdk {
    private _client;
    /**
     * Create a sdk object for amazon s3
     * @param config configuration for client
     */
    constructor(config: any);
    /**
     * Get a object in amazon s3
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectcommandinput.html
     * @param bucket bucket name
     * @param key object key
     * @param versionId version id
     * @returns object data (stream)
     */
    private _getObject;
    /**
     * Destroy a client for amazon s3
     */
    destroy(): void;
    /**
     * Get a object from s3 url
     * @param s3Url s3 url
     * @returns s3 object data
     */
    getObjectByUrl(s3Url: string): Promise<S3Object>;
}
