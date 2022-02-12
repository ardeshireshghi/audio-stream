/// <reference types="node" />
import { ReadStream } from 'fs';
import * as S3 from 'aws-sdk/clients/s3';
export declare enum BlobStoreTypes {
    S3 = "s3"
}
export interface File {
    name: string;
    data?: ReadStream | Buffer;
}
export declare type BlobStoreResponse = any;
interface BlobStoreClient {
    uploadFile(file: File): Promise<BlobStoreResponse>;
    getFile(key: string): Promise<File | void>;
    getFiles(keyPrefix: string): Promise<File[] | void>;
}
declare type S3ClientParams = [bucketName: string, keyPrefix?: string, client?: S3];
export default function createBlobStoreClient(type: BlobStoreTypes, ...params: S3ClientParams | undefined): BlobStoreClient;
export {};
