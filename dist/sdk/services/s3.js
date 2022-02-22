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
exports.S3Sdk = void 0;
// AWS SDK
const s3 = __importStar(require("@aws-sdk/client-s3"));
// Response
const response_1 = require("../../models/response");
class S3Sdk {
    /**
     * Create a sdk object for amazon s3
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
    async _getObject(bucket, key, versionId) {
        try {
            // Create an input to get the object
            const input = {
                Bucket: bucket,
                Key: key,
                VersionId: versionId
            };
            // Create a command to get the object
            const command = new s3.GetObjectCommand(input);
            // Send a command to get a object
            const response = await this._client.send(command);
            // Return
            return response.Body;
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.S3.OBJECT.GET_ITEM, true, `${bucket}/${key}`, err);
            // Return
            return undefined;
        }
    }
    /**
     * Destroy a client for amazon s3
     */
    destroy() {
        this._client.destroy();
    }
    /**
     * Get a object from s3 url
     * @param s3Url s3 url
     * @returns s3 object data
     */
    async getObjectByUrl(s3Url) {
        // Extract the bucket name and key from url
        let temp = s3Url.replace(/^s3:\/\//, "").split("/");
        const bucket = temp[0];
        const key = temp.slice(1).join("/");
        // Extract a file name
        temp = key.split("/");
        const filename = temp[temp.length - 1];
        // Extract an extension
        temp = filename.split(".");
        const extension = temp[temp.length - 1];
        // Get a object
        const data = await this._getObject(bucket, key);
        // Return
        return { filename, extension, data };
    }
}
exports.S3Sdk = S3Sdk;
