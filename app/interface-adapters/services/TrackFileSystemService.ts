import { ReadStream } from 'fs';
import Track from '../../domain/Track';
import { TrackService } from './TrackService';
import { promises, constants } from 'fs';
import streamAudio from '../../../lib/audio-streamer/streamAudio';
import { ServerResponse } from 'http';

const { readdir, stat, access } = promises;
const { F_OK } = constants;

export class TrackFileSystemService implements TrackService {
  async findAndStream(
    name: string,
    res: ServerResponse,
    range: string
  ): Promise<ReadStream | void> {
    const filePath = `./media/${name}`;
    try {
      await access(filePath, F_OK);
    } catch (err) {
      return;
    }

    await streamAudio({
      audioFilePath: filePath,
      res,
      range
    });
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
