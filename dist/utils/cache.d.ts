/**
 * Store the resource
 * @param type resource type (ex. ec2, role, lambda, ...)
 * @param key resource uuid
 * @param resource resource object
 */
export declare function storeResource(type: string, key: string, resource: any): void;
/**
 * Get a resource
 * @param type resource type (ex. ec2, role, lambda, ...)
 * @param key resource uuid
 * @returns resource object
 */
export declare function getResource(type: string, key: string): any;
