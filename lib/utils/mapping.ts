const LINKING: any = {};

/**
 * Set an amazon s3 bucket
 * @param oldName old bucket name
 * @param newName new bucket name
 */
export function setS3BucketName(oldName: string, newName: string): void {
  // Whether a key exists or not
  if (!LINKING.S3) {
    LINKING.S3 = {};
  }
  // Set a s3 bucket name
  LINKING.S3[oldName] = newName;
}

/**
 * Get a linking data
 * @param type service type [S3|Lambda]
 * @param key key
 * @returns stored value
 */
export function getLinkingData(type: string, key: string): string {
  return LINKING[type] && LINKING[type][key] ? LINKING[type][key] : ""; 
}