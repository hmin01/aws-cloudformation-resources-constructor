const RESOURCE: any = {};

/**
 * Store the resource
 * @param type resource type (ex. ec2, role, lambda, ...)
 * @param key resource uuid
 * @param resource resource object
 */
export function storeResource(type: string, key: string, resource: any): void {
  // 유형에 대한 속성 키가 없는 경우, 해당 유형에 대한 
  if (RESOURCE[type] === undefined) {
    RESOURCE[type] = {};
  }
  RESOURCE[type][key] = resource;
}

/**
 * Get a resource
 * @param type resource type (ex. ec2, role, lambda, ...)
 * @param key resource uuid
 * @returns resource object
 */
export function getResource(type: string, key: string): any {
  return RESOURCE[type][key];
}