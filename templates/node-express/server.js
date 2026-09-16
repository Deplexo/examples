import { app } from './app.js';
const port=Number(process.env.PORT||3000);
if (!Number.isInteger(port)||port<1||port>65535) throw new Error('PORT must be a valid port number');
const server=app.listen(port,'0.0.0.0',()=>console.info(`HTTP API listening on ${port}`));
server.requestTimeout=15000;server.headersTimeout=10000;
let stopping=false;
function shutdown(){if(stopping)return;stopping=true;console.info('Shutting down');server.close(err=>{if(err){console.error('Failed to close server');process.exitCode=1;}});setTimeout(()=>server.closeAllConnections(),10000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
