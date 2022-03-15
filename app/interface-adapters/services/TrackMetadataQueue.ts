type TrackCacheItem = {
  trackName: string;
};

export class TrackMetadataQueue {
  constructor(private _queue: TrackCacheItem[] = []) {}
  enqueue(item: TrackCacheItem) {
    this._queue.push(item);
  }
  dequeue() {
    return this._queue.shift();
  }
}

export default new TrackMetadataQueue();
