import { ReadStream } from 'fs';
import { ServerResponse } from 'http';
import Track from '../../domain/Track';

export interface TrackService {
  findAndStream(
    name: string,
    res: ServerResponse,
    range: string
  ): Promise<ReadStream | void>;
  findAll(): Promise<Track[] | void>;
}
