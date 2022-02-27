"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkingData = exports.setS3BucketName = void 0;
const LINKING = {};
/**
 * Set an amazon s3 bucket
 * @param oldName old bucket name
 * @param newName new bucket name
 */
function setS3BucketName(oldName, newName) {
    // Whether a key exists or not
    if (!LINKING.S3) {
        LINKING.S3 = {};
    }
    // Set a s3 bucket name
    LINKING.S3[oldName] = newName;
}
exports.setS3BucketName = setS3BucketName;
/**
 * Get a linking data
 * @param type service type [S3|Lambda]
 * @param key key
 * @returns stored value
 */
function getLinkingData(type, key) {
    return LINKING[type] && LINKING[type][key] ? LINKING[type][key] : "";
}
exports.getLinkingData = getLinkingData;
