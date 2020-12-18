import fetch from 'node-fetch';
import Log from './log';
import config from '../../config.json';

let count = 0;

setInterval(async () => {
  try {
    await fetch(config.dashboardURL);
    Log.info(`[${++count}] Kept ${config.dashboardURL} alive.`, 'keep');
  } catch {
    Log.error(`[${++count}] Error keeping ${config.dashboardURL} alive.`, 'keep');
  }
}, 5 * 60 * 1000);
