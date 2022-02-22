export declare const CODE: any;
/**
 * Catch an error
 * @param code error code
 * @param isExit Whether the process is terminated or not
 * @param target target
 * @param err err object
 * @returns blank string
 */
export declare function catchError(code: number, isExit: boolean, target?: string, err?: Error): string;
