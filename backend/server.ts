import app from './src/app';
import config from './src/config';
import cluster from 'cluster';
import os from 'os';

// Number of CPU cores
const numCPUs = os.cpus().length;

// Use cluster to utilize all available CPU cores
if (cluster.isPrimary && config.env === 'production') {
  console.log(`Master process ${process.pid} is running`);

  // Fork workers, one per CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit and restart
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  // Workers share the TCP connection
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.env} mode`);
    console.log(`Worker ${process.pid} started`);
  });
}