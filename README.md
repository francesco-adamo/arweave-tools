# arweave-tools
A set of useful tools to monitor your Arweave node and gather information quickly.

# Requirements
Node.js https://nodejs.org

# Installation
1. Git clone this repo ```git clone https://github.com/francesco-adamo/arweave-tools``` or download ZIP file.
2. run ```npm install``` in folder to download required dependencies.

# Usage
1. Arweave Monitor <br/>
Run ```node monitor``` while Arweave is running to print detailed information about your node and syncing status, with estimates on download speed and completion times. By default it will update every minute. Run ```node monitor -h``` for advanced configuration.

2. Disk random read speed benchmark <br/>
Run ```node benchmark -d <mounted_drive>``` to calculate your disk IOPS and random read speed. The latter can be used with the calculator tool below.

3. SPoRA Hashrate calculator <br/>
Run ```node calculator -r <your_randomx_hashrate> -s <random_read_GiB/s>``` to estimate your SPoRA hashrate given your randomx h/s (from arweave randomx-benchmark), your disk random read speeds in GiB/s (from included benchmark tool) and your current share of the weave (from your running node and Arweave network). If run with parameter ```-w <your_share_of_the_weave>``` it will work fully offline without requiring a running node nor an internet connection.

# Known issues
Sometimes the network sends inaccurate data. If the software detects it and prints an error message just wait for the next update (if running monitor) or just launch the tool again (if running calculator).
