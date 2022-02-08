import { Construct } from "constructs";
export declare class Table {
    private _table;
    private _scope;
    /**
     * Create the dynamodb table
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html
     * @param scope scope context
     * @param config configuration for table
     */
    constructor(scope: Construct, config: any);
    /**
     * Get an arn for table
     * @returns arn for table
     */
    getArn(): string;
    /**
     * Get a name for table
     * @returns name for table
     */
    getName(): string;
    /**
     * Get an arn for stream
     * @returns arn for stream
     */
    getStreamArn(): string;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
}
