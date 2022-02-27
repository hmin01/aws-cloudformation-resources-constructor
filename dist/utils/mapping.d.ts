/**
 * Set an amazon s3 bucket
 * @param oldName old bucket name
 * @param newName new bucket name
 */
export declare function setS3BucketName(oldName: string, newName: string): void;
/**
 * Get a linking data
 * @param type service type [S3|Lambda]
 * @param key key
 * @returns stored value
 */
export declare function getLinkingData(type: string, key: string): string;
