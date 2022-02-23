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
exports.STSSdk = void 0;
const sts = __importStar(require("@aws-sdk/client-sts"));
// Reponse
const response_1 = require("../../models/response");
class STSSdk {
    /**
     * Create a sdk object for amazon sts
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
        // Create a client for amazon sts
        this._client = new sts.STSClient(params);
    }
    /**
     * Assume a role
     * @param sessionName session name
     * @param roleArn role arn
     * @returns credentials
     */
    async assumeRole(sessionName, roleArn) {
        try {
            // Create an input to assume a role
            const input = {
                DurationSeconds: 900,
                RoleArn: roleArn,
                RoleSessionName: sessionName
            };
            // Create a command to assume a role
            const command = new sts.AssumeRoleCommand(input);
            // Send a command to assume a role
            const response = await this._client.send(command);
            // Return
            return response.Credentials;
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.STS.ASSUME_ROLE, true, roleArn, err);
            // Return
            return undefined;
        }
    }
    /**
     * Destroy a client for amazon sts
     */
    destroy() {
        this._client.destroy();
    }
}
exports.STSSdk = STSSdk;
