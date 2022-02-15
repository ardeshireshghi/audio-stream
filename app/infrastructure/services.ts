import { TrackFileSystemService } from '../interfaces/services/TrackFileSystemService';

const createServices = () => {
  return {
    trackService: process.env.MEDIA_PERSIST_S3_BUCKET_NAME
      ? new TrackFileSystemService()
      : new TrackFileSystemService()
  };
};

export { createServices };
export default createServices();
