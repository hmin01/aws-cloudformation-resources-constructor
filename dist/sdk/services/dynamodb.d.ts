export declare class DynamoDBSdk {
    private _client;
    /**
     * Create a sdk object for amazon dynamodb
     * @param config configuration for amazon dynamodb
     */
    constructor(config: any);
    /**
     * Destroy a client for amazon dynamodb
     */
    destroy(): void;
    /**
     * Get a table arn
     * @param tableName table name
     * @returns arn for table
     */
    getTableArn(tableName: string): Promise<string>;
}
