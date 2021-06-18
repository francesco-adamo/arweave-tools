# arweave-tools
A set of useful tools to monitor your Arweave node and gather information quickly.

# Requirements
Node.js https://nodejs.org

# Installation
1. Git clone this repo ```git clone https://github.com/francesco-adamo/arweave-tools``` or download ZIP file.
2. run ```npm install``` in folder to download required dependencies.

# Usage
1. Arweave Monitor<br/>
Run ```node monitor``` while Arweave is running to print detailed information about your node and syncing status, with estimates on download speed and completion times. By default it will update every minute. Run ```node monitor -h``` for advanced configuration.

2. SPoRA Hashrate calculator<br/>
Run ```node calculator -r <your_randomx_hashrate>``` to estimate your SPoRA hashrate given your randomx h/s (from benchmark) and your current share of the weave (from your running node and Arweave network).

3. More tools coming soon!

# Known issues
Sometimes the network sends inaccurate data. If the software detects it and prints an error message just wait for the next update (if running monitor) or just launch the tool again (if running calculator).<br/><br/>
The hashrate calculations are not very accurate and overestimate the actual SPoRA h/s when running the miner. They are calculated using the formula ```randomx/(1 + total_weave/your_index) ``` and will be updated once a better one is found.
