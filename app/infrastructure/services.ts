import createBlobStoreClient, {
  BlobStoreTypes
} from '../../lib/blob-store/src/BlobStoreClient';
import { TrackBlobStoreService } from '../interfaces/services/TrackBlobStoreService';
import { TrackFileSystemService } from '../interfaces/services/TrackFileSystemService';

const createServices = () => {
  const s3Client = createBlobStoreClient(
    BlobStoreTypes.S3,
    process.env.MEDIA_PERSIST_S3_BUCKET_NAME,
    'audio-stream-files/'
  );

  return {
    trackService: process.env.MEDIA_PERSIST_S3_BUCKET_NAME
      ? new TrackBlobStoreService(s3Client)
      : new TrackFileSystemService()
  };
};

export { createServices };
export default createServices();
