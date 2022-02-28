const {
  WorkerPool
} = require('../../dist/lib/media-persist-worker/WorkerPool');

const pool = new WorkerPool({
  size: 24,
  taskPath: __dirname + '/test-worker.js'
});

const promises = [...Array(10000).keys()].map(() => {
  return pool.run({ data: Math.round(Math.random() * 10000) + 1000000 });
});

(async () => {
  const start = Date.now();
  await Promise.all(promises);
  console.log(
    'It took %s seconds with %s workers',
    (Date.now() - start) / 1000,
    pool.size
  );
  await pool.terminate();
  process.exit();
})();
