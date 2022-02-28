import EventEmitter from 'events';
import { Worker } from 'worker_threads';

class CustomWorker extends Worker {
  public isReady: boolean;
  constructor(...args: ConstructorParameters<typeof Worker>) {
    super(...args);
    this.isReady = true;
  }

  run(workerData) {
    this.isReady = false;

    return new Promise((resolve, reject) => {
      const onMessage = (message) => {
        resolve(message);
        this.removeListener('error', onError);
        this.isReady = true;
        this.emit('ready', this);
      };

      const onError = (err) => {
        reject(err);
        this.removeListener('message', onMessage);
      };
      this.once('error', onError);
      this.once('message', onMessage);

      this.postMessage(workerData);
    });
  }
}

export class WorkerPool extends EventEmitter {
  public size: number;
  public taskPath: string;
  public workers: CustomWorker[];
  public taskQueue: any[];

  constructor({ size, taskPath }: { size: number; taskPath: string }) {
    super();
    this.size = size;
    this.taskPath = taskPath;
    this.taskQueue = [];
    this.workers = this._createWorkers();
  }

  public async run(workerData: any) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ workerData, resolve, reject });
      this.executeTask();
    });
  }

  public async terminate() {
    this.workers = [];
    this.removeAllListeners();
    await Promise.all(this.workers.map((worker) => worker.terminate()));
  }

  private _createWorkers() {
    return Array.from(Array(this.size).keys()).map(() => {
      return this._createWorker();
    });
  }

  private _createWorker() {
    const worker = new CustomWorker(this.taskPath);
    worker.on('ready', (theWorker) => {
      this.runTask(theWorker);
    });

    worker.once('exit', (code) => {
      if (code !== 0) {
        worker.terminate();
        this.workers[this.workers.indexOf(worker)] = new CustomWorker(
          this.taskPath
        );
      }
    });

    return worker;
  }

  private async executeTask() {
    const freeWorker = this.workers.find((worker) => worker.isReady);

    if (freeWorker) {
      this.runTask(freeWorker);
    }
  }

  private runTask(worker) {
    if (this.taskQueue.length > 0) {
      const { workerData, resolve, reject } = this.taskQueue.shift();

      if (workerData) {
        return worker.run(workerData).then(resolve).catch(reject);
      }
    }
  }
}
