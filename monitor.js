const axios = require('axios');

console.log();
console.log('+-----------------------------+');
console.log('| ARWEAVE STATUS MONITOR V1.1 |');
console.log('| Francesco Adamo -- 06/23/21 |');
console.log('+-----------------------------+');
console.log();

// CHANGELOG
// 03/07/22 V1.2: adding port param
// 06/23/21 V1.1: minor refinements and fixes
// 06/17/21 V1.0: initial public release

const { program } = require('commander');
program.option('-i, --refresh-interval <sec>', 'local data refresh time, seconds', 60);
program.option('-t, --refresh-totals <min>', 'network data refresh time, minutes', 10);
program.option('-a, --averages-stack <min>', 'time stack for averages calculation, minutes', 60);
program.option('-p, --miner-port <port_number>', 'listening port from miner', 1984);
program.parse(process.argv);
const options = program.opts();

const refreshInterval = parseInt(options.refreshInterval) * 1000;
const refreshTotals = 60 / parseInt(options.refreshInterval) * parseInt(options.refreshTotals);
const maxStack = 60 / parseInt(options.refreshInterval) * parseInt(options.averagesStack);
const port = parseInt(options.minerPort)
const terabyte = 1024 * 1024 * 1024 * 1024;

const dataSizeArray = [];
const blocksArray = [];
const dataSizeSpeedArray = [];
const blocksSpeedArray = [];

let currentIndex = 0;
let previousTimestamp;

let lastTotalDataSize;
let lastTotalBlocks;
let firstRun = true;

start(); // first run
const interval = setInterval(start, refreshInterval);

async function start() {
    console.log('-------------------------------')
    console.log('check: ' + (new Date()).toLocaleString());
    console.log('-------------------------------')
    console.log();

    const previousIndex = currentIndex;
    if (!firstRun) currentIndex = (currentIndex + 1) % maxStack;
    const currentTimestamp = Date.now();  

    try {
        // LOCAL NODE
	const url = 'http://localhost:' + port + '/metrics'
        const localResponse = await axios.get(url);

        const currentDataSize = localResponse.data.split('v2_index_data_size ')[3].split('\n')[0];
        const currentBlocks = localResponse.data.split('arweave_storage_blocks_stored ')[3].split('\n')[0];
        console.log('current v2_index_data_size: ' + currentDataSize + ' bytes (' + (currentDataSize / terabyte).toFixed(2) + ' TiB)');
        console.log('current arweave_storage_blocks_stored: ' + currentBlocks);
        console.log();

        // ARWEAVE NODE
        let totalDataSize = lastTotalDataSize;
        let totalBlocks = lastTotalBlocks;
        if (firstRun || currentIndex % refreshTotals == 0) {
            const networkResponse = await axios.get('http://arweave.net/metrics');

            totalDataSize = networkResponse.data.split('v2_index_data_size ')[3].split('\n')[0];
            totalBlocks = networkResponse.data.split('arweave_storage_blocks_stored ')[3].split('\n')[0];

            // data check consistency filter
            if (totalDataSize < 6000000000000 || totalBlocks < 700000) {
                throw('received inaccurate data from network');
            }
            lastTotalDataSize = totalDataSize;
            lastTotalBlocks = totalBlocks;
        }
        console.log('total v2_index_data_size: ' + totalDataSize + ' bytes (' + (totalDataSize / terabyte).toFixed(2) + ' TiB)');
        console.log('total arweave_storage_blocks_stored: ' + totalBlocks);
        
        // STATS
        console.log();
        console.log('v2_index_data_size sync progress: ' + (currentDataSize / totalDataSize * 100).toFixed(2) + '%');
        console.log('arweave_storage_blocks_stored sync progress: ' + (currentBlocks / totalBlocks * 100).toFixed(2) + '%');
        console.log();

        // update arrays
        blocksArray[currentIndex] = currentBlocks;
        dataSizeArray[currentIndex] = currentDataSize;

        // SPEED
        if (firstRun) {
            console.log('waiting next round for speed calculations...');
            firstRun = false;
        }
        else {
            const currentDataSizeSpeed = (currentDataSize - dataSizeArray[previousIndex]) / ((currentTimestamp - previousTimestamp) / 1000) / 1024; // KiB/s
            dataSizeSpeedArray[previousIndex] = currentDataSizeSpeed;
            const averageDataSizeSpeed = dataSizeSpeedArray.reduce((a, b) => a + b) / dataSizeSpeedArray.length;
            const dataSizeCompletionTime = (totalDataSize - currentDataSize) / 1000 / averageDataSizeSpeed;
            console.log('current v2_index_data_size sync speed: ' + currentDataSizeSpeed.toFixed(2) + ' KiB/s (' + (currentDataSizeSpeed / 1024).toFixed(2) + ' MiB/s)');
            console.log('average v2_index_data_size sync speed: ' + averageDataSizeSpeed.toFixed(2) + ' KiB/s (' + (averageDataSizeSpeed / 1024).toFixed(2) + ' MiB/s)');
            let reasonableTime = dataSizeCompletionTime / 3600 < 12000 ? 1 : 0;
            if (reasonableTime) console.log('expected v2_index_data_size sync time: ' + (dataSizeCompletionTime / 3600).toFixed(2) + ' hours (' + (dataSizeCompletionTime / 86400).toFixed(2) + ' days)');
            else console.log('expected v2_index_data_size sync time: Infinity');
            console.log();

            const currentBlocksSpeed = (currentBlocks - blocksArray[previousIndex]) / ((currentTimestamp - previousTimestamp) / 1000); // blocks/s
            blocksSpeedArray[previousIndex] = currentBlocksSpeed;
            const averageBlocksSpeed = blocksSpeedArray.reduce((a, b) => a + b) / blocksSpeedArray.length;
            const blocksCompletionTime = (totalBlocks - currentBlocks) / averageBlocksSpeed;
            console.log('current arweave_storage_blocks_stored sync speed: ' + currentBlocksSpeed.toFixed(2) + ' blocks/s');
            console.log('average arweave_storage_blocks_stored sync speed: ' + averageBlocksSpeed.toFixed(2) + ' blocks/s');
            reasonableTime = blocksCompletionTime / 3600 < 12000 ? 1 : 0;
            if (reasonableTime) console.log('expected arweave_storage_blocks_stored sync time: ' + (blocksCompletionTime / 3600).toFixed(2) + ' hours (' + (blocksCompletionTime / 86400).toFixed(2) + ' days)');
            else console.log('expected arweave_storage_blocks_stored sync time: Infinity');
        }
        previousTimestamp = currentTimestamp;
    } 
    catch (err) {
        console.log('there was an error!');
        console.log(err.toString().slice(0, 200));
        console.log('retrying...');
        currentIndex = previousIndex; // revert index
    }
    console.log();
}
