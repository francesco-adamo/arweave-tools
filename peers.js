const axios = require('axios');

console.log();
console.log('+---------------------------+');
console.log('| ARWEAVE PEERS LISTER V1.0 |');
console.log('| Francesco Adamo  06/24/21 |');
console.log('+---------------------------+');
console.log();

// CHANGELOG
// 06/24/21 V1.0: initial public release

axios.interceptors.request.use(function (config) {
      config.metadata = { startTime: new Date()}
      return config;
}, function (error) {
      return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
      response.config.metadata.endTime = new Date()
      response.duration = response.config.metadata.endTime - response.config.metadata.startTime
      return response;
}, function (error) {
      error.config.metadata.endTime = new Date();
      error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
      return Promise.reject(error);
});

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
            promises.push(axios.get('http://' + peers[k] + '/block/height/770811').catch(function(err){return err}))
        }
        const responses = await Promise.all(promises);
        console.log(' DONE!');

        // SORT BY FASTEST
        console.log();
        const list = [];
        for (let k = 0; k < responses.length; k++) {
            const time = responses[k].status == 200 ? responses[k].duration : Infinity;
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
