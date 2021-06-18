const axios = require('axios');
const { program } = require('commander');

program.requiredOption('-r, --randomx <hashrate>', 'randomx hashrate from benchmark');
program.parse(process.argv);
const options = program.opts();

console.log();
console.log('+-------------------------------+');
console.log('| ARWEAVE SPORA CALCULATOR V1.0 |');
console.log('| Francesco Adamo ---- 06/17/21 |');
console.log('+-------------------------------+');

// CHANGELOG
// V1.0 <06/17/21> initial public release

const randomx = parseInt(options.randomx);
const terabyte = 1024 * 1024 * 1024 * 1024;

start(); // run
async function start() {
    try {
        // LOCAL NODE
        const localResponse = await axios.get('http://localhost:1984/metrics');

        console.log();
        const currentDataSize = localResponse.data.split('v2_index_data_size ')[3].split('\n')[0];
        console.log('current v2_index_data_size: ' + currentDataSize + ' bytes (' + (currentDataSize / terabyte).toFixed(2) + ' TiB)');

        // ARWEAVE NODE
        const networkResponse = await axios.get('http://arweave.net/metrics');

        const totalDataSize = networkResponse.data.split('v2_index_data_size ')[3].split('\n')[0];
        console.log('total v2_index_data_size: ' + totalDataSize + ' bytes (' + (totalDataSize / terabyte).toFixed(2) + ' TiB)');

        const weaveSize = networkResponse.data.split('weave_size ')[3].split('\n')[0];
        console.log('total weave_size: ' + weaveSize + ' bytes (' + (weaveSize / terabyte).toFixed(2) + ' TiB)');

        // data check consistency filter
        if (totalDataSize < 6000000000000 || weaveSize < 9000000000000) {
            throw('received inaccurate data from network');
        }

        // STATS
        console.log();
        console.log('current share of the weave: ' + (currentDataSize / weaveSize).toFixed(2) + ' (1/share: ' + (weaveSize / currentDataSize).toFixed(2) + ')');
        console.log('max share of the weave: ' + (totalDataSize / weaveSize).toFixed(2) + ' (1/share: ' + (weaveSize / totalDataSize).toFixed(2) + ')');

        // HASHES
        console.log();
        const hashrate = Math.floor(randomx / (1 + weaveSize / currentDataSize));
        console.log('expected current spora hashrate: ' + hashrate + ' h/s (70-90% range: ' + Math.floor(hashrate * 0.7) + '-' + Math.floor(hashrate * 0.9) + ' h/s)');

        const maxHashrate = Math.floor(randomx / (1 + weaveSize / totalDataSize));
        console.log('expected max spora hashrate: ' + maxHashrate + ' h/s (70-90% range: ' + Math.floor(maxHashrate * 0.7) + '-' + Math.floor(maxHashrate * 0.9) + ' h/s)');
        console.log();
    } 
    catch (err) {
        console.log('there was an error!');
        console.log(err.toString().slice(0, 200));
        console.log('try running again. terminating...');
        console.log();
    }
}
