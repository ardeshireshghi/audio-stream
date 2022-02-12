import { ReadStream } from 'fs';
import * as S3 from 'aws-sdk/clients/s3';

export enum BlobStoreTypes {
  S3 = 's3'
}

function createS3Client() {
  return new S3({
    region: process.env.AWS_DEFAULT_REGION || 'eu-west-1'
  });
}

export interface File {
  name: string;
  data?: ReadStream | Buffer;
}

export type BlobStoreResponse = any;

interface BlobStoreClient {
  uploadFile(file: File): Promise<BlobStoreResponse>;
  getFile(key: string): Promise<File | void>;
  getFiles(keyPrefix: string): Promise<File[] | void>;
}

type S3ClientParams = [bucketName: string, keyPrefix?: string, client?: S3];

class S3BlobStoreClient implements BlobStoreClient {
  constructor(
    public bucketName: string,
    public keyPrefix: string = '',
    public client: S3 = createS3Client()
  ) {}
  async uploadFile(file: File): Promise<BlobStoreResponse> {
    const params = {
      Bucket: this.bucketName,
      Key: this.keyPrefix + file.name,
      Body: file.data
    };

    const data = await this.client.upload(params).promise();
    return data;
  }
  async getFile(key: string): Promise<void | File> {}
  async getFiles(keyPrefix: string): Promise<void | File[]> {}
}

const blobStoreClientTypeMap = {
  [BlobStoreTypes.S3]: S3BlobStoreClient
};

export default function createBlobStoreClient(
  type: BlobStoreTypes,
  ...params: S3ClientParams | undefined
): BlobStoreClient {
  if (type in blobStoreClientTypeMap) {
    return new blobStoreClientTypeMap[type](...params);
  }

  throw new Error(`Invalid blobStoreClient type: ${type}`);
}
