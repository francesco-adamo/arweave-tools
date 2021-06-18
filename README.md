# arweave-tools
A set of useful tools to monitor your Arweave node and gather information quickly.

# Requirements
Node.js https://nodejs.org

# Installation
1. Git clone or download this repository
2. run ```npm install``` in folder to download dependencies

# Usage
1. Arweave Monitor<br/>
Run ```node monitor``` while Arweave is running to print detailed information about your node and syncing status, with estimates on download speed and completion times. By default it will update every minute. Run ```node monitor -h``` for advanced configuration.

2. SPoRA Hashrate calculator<br/>
Run ```node calculator -r <your_randomx_hashrate>``` to estimate your SPoRA hashrate given your randomx h/s (from benchmark) and your current share of the weave. It currently requires your Arweave node to be running to work.

3. More tools coming soon!

# Known issues
Sometimes the network sends inaccurate data. If the software detects it and prints an error message just wait for the next update (if running monitor) or just launch the tool again (if running calculator).<br/>
The hashrate calcluations are not very accurate and overestimate the actual h/s when running the miner. They are calculated using the formula ```randomx/(1 + total_weave/your_index) ``` and will be updated once a better one is found.
