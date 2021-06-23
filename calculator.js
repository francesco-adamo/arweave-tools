const axios = require('axios');

console.log();
console.log('+-------------------------------+');
console.log('| ARWEAVE SPORA CALCULATOR V1.1 |');
console.log('| Francesco Adamo ---- 06/23/21 |');
console.log('+-------------------------------+');
console.log();

// CHANGELOG
// 06/23/21 V1.1: included disk benchmark, new calculator formula
// 06/17/21 V1.0: initial public release

const { program } = require('commander');
program.option('-r, --randomx <hashrate>', 'hashrate result from randomx-benchmark [REQUIRED]');
program.option('-s, --speed <GiB/s>', 'random read speed in GiB/s of your \'data_dir\' drive [REQIRED]');
program.option('-w, --weave <share>', 'your current share of the weave (v2_index_data_size / weave_size) (ex. 0.62)');
program.parse(process.argv);
const options = program.opts();

const randomx = parseInt(options.randomx);
const speed = parseFloat(options.speed);
const weave = parseFloat(options.weave);
const terabyte = 1024 * 1024 * 1024 * 1024;

if (!randomx) {
    console.log('error: missing parameter');
    console.log('mandatory parameter (-r, --randomx) was not specified');
    console.log('run with (-h, --help) for more information');
    console.log();
    return;
}
if (!speed) {
    console.log('error: missing parameter');
    console.log('mandatory parameter (-s, --speed) was not specified');
    console.log('run with (-h, --help) for more information');
    console.log();
    return;
}

start(); // run
async function start() {
    try {
        if (!weave) {
            // LOCAL NODE
            const localResponse = await axios.get('http://localhost:1984/metrics');

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
            const currentShare = (currentDataSize / weaveSize).toFixed(2);
            console.log('current share of the weave: ' + currentShare + ' (1/share: ' + (1 / currentShare).toFixed(2) + ')');
            const maxShare = (totalDataSize / weaveSize).toFixed(2);
            console.log('max share of the weave: ' + maxShare + ' (1/share: ' + (1 / maxShare).toFixed(2) + ')');

            // HASHES
            console.log();
            const hashrate = getHashrate(randomx, speed, currentShare);
            console.log('expected current spora hashrate: ' + hashrate + ' h/s (70-90% range: ' + Math.floor(hashrate * 0.7) + '-' + Math.floor(hashrate * 0.9) + ' h/s)');

            const maxHashrate = getHashrate(randomx, speed, maxShare);
            console.log('expected max spora hashrate: ' + maxHashrate + ' h/s (70-90% range: ' + Math.floor(maxHashrate * 0.7) + '-' + Math.floor(maxHashrate * 0.9) + ' h/s)');
        }
        else {
            console.log('using passed weave share parameter');
            const hashrate = getHashrate(randomx, speed, weave);
            console.log('expected spora hashrate: ' + hashrate + ' h/s (70-90% range: ' + Math.floor(hashrate * 0.7) + '-' + Math.floor(hashrate * 0.9) + ' h/s)');
        }
    } 
    catch (err) {
        console.log('there was an error!');
        console.log(err.toString().slice(0, 200));
        console.log('terminating...');
    }
    console.log();
}

function getHashrate(randomx, speed, share) {
    return Math.floor(1000000 / (1000000 * ((1 / share) - 1) / randomx + 2 * 1000000 / randomx + 1000000 * 256 / (speed * 1024 * 1024)));
}
