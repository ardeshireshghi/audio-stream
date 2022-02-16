import createBlobStoreClient, {
  BlobStoreClient,
  BlobStoreTypes
} from '../../lib/blob-store/src/BlobStoreClient';
import { TrackBlobStoreService } from '../interface-adapters/services/TrackBlobStoreService';
import { TrackFileSystemService } from '../interface-adapters/services/TrackFileSystemService';
import { TrackService } from '../interface-adapters/services/TrackService';

type Services = {
  blobStoreClient: BlobStoreClient;
  trackService: TrackService;
};

const createServices = (): Services => {
  const blobStoreClient = createBlobStoreClient(
    BlobStoreTypes.S3,
    process.env.MEDIA_PERSIST_S3_BUCKET_NAME,
    'audio-stream-files/'
  );

  return {
    blobStoreClient,
    trackService: process.env.MEDIA_PERSIST_S3_BUCKET_NAME
      ? new TrackBlobStoreService(blobStoreClient)
      : new TrackFileSystemService()
  };
};

export { createServices };
export default createServices();
