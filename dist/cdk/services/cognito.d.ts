import { Construct } from "constructs";
export declare class UserPool {
    private _scope;
    private _userPool;
    /**
     * Create the cognito user pool
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html
     * @param scope scope context
     * @param config configuration for user pool
     */
    constructor(scope: Construct, config: any);
    /**
     * Add an user pool client
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html
     * @param config configuration for user pool client
     */
    addClient(config: any): void;
    /**
     * Configurate the email
     * @param config configuration for email
     */
    configurateEmail(config: any): void;
    /**
     * Configurate a list of schema
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cognito-userpool-schemaattribute.html
     * @param config configuration for schema
     */
    configurateSchema(config: any[]): void;
    /**
     * Get an arn for user pool
     * @returns arn for user pool
     */
    getArn(): string;
    /**
     * Get an id for user pool
     * @returns id for user pool
     */
    getId(): string;
}
