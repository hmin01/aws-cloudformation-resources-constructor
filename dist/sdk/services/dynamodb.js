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
exports.DynamoDBSdk = void 0;
// AWS SDK
const dynamodb = __importStar(require("@aws-sdk/client-dynamodb"));
class DynamoDBSdk {
    /**
     * Create a sdk object for amazon dynamodb
     * @param config configuration for amazon dynamodb
     */
    constructor(config) {
        // Create a client for amazon dynamodb
        this._client = new dynamodb.DynamoDBClient(config);
    }
    /**
     * Destroy a client for amazon dynamodb
     */
    destroy() {
        this._client.destroy();
    }
    /**
     * Get a table arn
     * @param tableName table name
     * @returns arn for table
     */
    async getTableArn(tableName) {
        try {
            // Create an input to get a table arn
            const input = {
                TableName: tableName
            };
            // Create a command to get a table arn
            const command = new dynamodb.DescribeTableCommand(input);
            // Send a command to get a table arn
            const response = await this._client.send(command);
            // Return
            return response.Table ? response.Table.TableArn : "";
        }
        catch (err) {
            console.error(`[ERROR] Failed to get a table arn (target: ${tableName})\n-> ${err}`);
            process.exit(30);
        }
    }
}
exports.DynamoDBSdk = DynamoDBSdk;
