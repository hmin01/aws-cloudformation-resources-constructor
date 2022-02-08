"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResource = exports.storeResource = void 0;
const RESOURCE = {};
/**
 * Store the resource
 * @param type resource type (ex. ec2, role, lambda, ...)
 * @param key resource uuid
 * @param resource resource object
 */
function storeResource(type, key, resource) {
    // 유형에 대한 속성 키가 없는 경우, 해당 유형에 대한 
    if (RESOURCE[type] === undefined) {
        RESOURCE[type] = {};
    }
    RESOURCE[type][key] = resource;
}
exports.storeResource = storeResource;
/**
 * Get a resource
 * @param type resource type (ex. ec2, role, lambda, ...)
 * @param key resource uuid
 * @returns resource object
 */
function getResource(type, key) {
    if (RESOURCE[type] !== undefined) {
        return RESOURCE[type][key];
    }
    else {
        return undefined;
    }
}
exports.getResource = getResource;
