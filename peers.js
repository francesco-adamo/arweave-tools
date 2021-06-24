const axios = require('axios');
const { exec } = require('child_process');

console.log();
console.log('+---------------------------+');
console.log('| ARWEAVE PEERS LISTER V1.0 |');
console.log('| Francesco Adamo  06/24/21 |');
console.log('+---------------------------+');
console.log();

// CHANGELOG
// 06/24/21 V1.0: initial public release

const { program } = require('commander');
program.option('-n, --number <num>', 'number of peers to use, ordered by fastest', 50);
program.parse(process.argv);
const options = program.opts();

const numPeers = options.number;

start(); // run
async function start() {
    try {
        // ARWEAVE NETWORK
        process.stdout.write('getting peers...');
        const networkResponse = await axios.get('http://arweave.net/peers');
        const peers = networkResponse.data;
        // console.log(peers);
        console.log(' DONE!');

        // PING PEERS
        process.stdout.write('testing latency...');
        const promises = [];
        for (let k = 0; k < peers.length; k++) {
            if (peers[k].startsWith('127.0.0')) continue;
            promises.push(execPromise('ping ' + peers[k].split(':')[0] + ' -c 1 -w 2'));
        }
        const responses = await Promise.all(promises);
        console.log(' DONE!');

        // SORT BY FASTEST
        console.log();
        const list = [];
        for (let k = 0; k < responses.length; k++) {
            const time = responses[k].includes('time=') ? parseFloat(responses[k].split(/time=| ms/)[1]) : Infinity;
            console.log(peers[k] + ' ms: ' + time);
            list.push([peers[k], time]);
        }
        list.sort((a, b) => a[1] - b[1]);
        // console.log(list);

        // GENERATE STRING
        console.log();
        let connectString = '';
        for (let k = 0; k < numPeers; k++) {
            connectString += 'peer ' + list[k][0] + ' ';
        }
        console.log(connectString);
    } 
    catch (err) {
        console.log('there was an error!');
        console.log(err.toString().slice(0, 200));
        console.log('terminating...');
    }
    console.log();
}

function execPromise(command) {
    return new Promise(resolve => {
        const program = exec(command);
        let output = '';
        program.stdout.on('data', (data) => {
            output += data;
        });
        program.on('exit', (code) => {
            resolve(output);
        });
    });
}
