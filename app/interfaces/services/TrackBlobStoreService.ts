import { ReadStream } from 'fs';
import { ServerResponse } from 'http';
import Track from '../../domain/Track';
import { TrackService } from './TrackService';
import { promises, constants } from 'fs';
import { BlobStoreClient } from '../../../lib/blob-store/src/BlobStoreClient';

const { readdir, stat } = promises;

export class TrackBlobStoreService implements TrackService {
  constructor(public blobStoreClient: BlobStoreClient) {}

  async findAndStream(
    name: string,
    res: ServerResponse,
    range: string
  ): Promise<ReadStream | void> {
    const file = await this.blobStoreClient.getFile(name, range);

    if (!file) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    if (file.data instanceof Buffer) {
      res.writeHead(200, {
        'Content-Type': 'audio/ogg',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      res.end(file.data);
    } else {
      file?.data.on('error', () => {
        res.statusCode = 404;
        res.end('Not Found');
      });

      // Set Headers
      if (!range) {
        res.writeHead(200, {
          'Content-Type': 'audio/ogg',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
      } else {
        let [start, end] = range.replace(/bytes=/, '').split('-');
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${file.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Type': 'audio/ogg',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
      }

      // Pipe download stream to response
      file?.data.pipe(res);
    }
  }
  async findAll(): Promise<Track[] | void> {
    const trackFiles = await readdir('./media');

    const tracks = await Promise.all(
      trackFiles
        .filter((file) => file.endsWith('.ogg'))
        .map(async (file) => {
          const { ctime: createdAt } = await stat(`./media/${file}`);
          return new Track(file, createdAt);
        })
    );

    return tracks;
  }
}
