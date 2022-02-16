import { ReadStream } from 'fs';
import { Readable } from 'stream';
import S3 from 'aws-sdk/clients/s3';

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
  data?: ReadStream | Readable | Buffer;
  size?: number;
  lastModified?: Date;
}

export type BlobStoreResponse = any;

export interface BlobStoreClient {
  uploadFile(file: File): Promise<BlobStoreResponse>;
  getFile(key: string, range?: string): Promise<File | void>;
  getFiles(): Promise<File[] | void>;
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

  async getFile(fileName: string, range?: string): Promise<void | File> {
    let params = {
      Bucket: this.bucketName,
      Key: this.keyPrefix + fileName
    };

    if (range) {
      params['Range'] = range;
    }

    const object = this.client.getObject(params);
    const response = await object.promise();

    // TODO: Fix the stream issue
    // const stream = object.createReadStream();

    return {
      name: fileName,
      data: response.Body as Buffer,
      size: response.ContentLength
    };
  }
  async getFiles(): Promise<void | File[]> {
    const params = {
      Bucket: this.bucketName,
      Prefix: this.keyPrefix
    };

    const response = await this.client.listObjects(params).promise();

    return response.Contents.map((file) => {
      return {
        name: file.Key.replace(this.keyPrefix, ''),
        lastModified: new Date(file.LastModified)
      };
    });
  }
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
