import { CfnTag } from "aws-cdk-lib";
/**
 * Change the part about AWS arn
 * @param arn arn for resource
 * @param type part type
 * @param content content
 * @returns changed arn
 */
export declare function changePartaboutArn(arn: string, type: string, content: string): string;
/**
 * Create the logical id for resource to be used aws cdk
 * @param content content to create hash value
 * @returns created id
 */
export declare function createId(content: string): string;
/**
 * Check if it matches the arn format.
 * @param target the target of comparison
 * @returns comparsion result
 */
export declare function checkAwsArnPattern(target: string): boolean;
/**
 * Delay process
 * @param ms delay time
 * @returns none
 */
export declare function delay(ms: number): Promise<unknown>;
/**
 * Extract the data from arn
 * @description https://docs.aws.amazon.com/ko_kr/general/latest/gr/aws-arns-and-namespaces.html
 * @param arn arn for resource
 * @param type output type [partition|service|region|accout|resource]
 * @returns output data
 */
export declare function extractDataFromArn(arn: string, type: string): string;
/**
 * Extract the principal from raw scope data
 * @param principalConfig configuration for principal
 * @returns extracted and modified principal
 */
export declare function extractPrincipal(principalConfig: any): any;
/**
 * Extract a list of tag based on input data
 * @param tags content of tags
 * @returns a list of tag
 */
export declare function extractTags(tags: unknown): CfnTag[];
/**
 * Load a json data (configuration)
 * @param filePath file path
 * @returns loaded data
 */
export declare function loadJsonFile(filePath: string): any;
