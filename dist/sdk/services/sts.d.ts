export declare class STSSdk {
    private _client;
    /**
     * Create a sdk object for amazon sts
     * @param config configuration for client
     */
    constructor(config: any);
    /**
     * Assume a role
     * @param sessionName session name
     * @param roleArn role arn
     * @returns credentials
     */
    assumeRole(sessionName: string, roleArn: string): Promise<any>;
    /**
     * Destroy a client for amazon sts
     */
    destroy(): void;
}
