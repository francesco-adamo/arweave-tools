# arweave-tools
A set of useful tools to monitor your Arweave node and gather information quickly.

# Requirements
Node.js https://nodejs.org

# Installation
1. Git clone this repo ```git clone https://github.com/francesco-adamo/arweave-tools``` or download ZIP file.
2. run ```npm install``` in folder to download required dependencies.

# Usage
1. Arweave Monitor <br/>
Run ```node monitor``` while Arweave is running to print detailed information about your node and syncing status, with estimates on download speeds and completion times. By default it will update every minute. Run ```node monitor -h``` for advanced configuration.

2. Disk random read speed benchmark <br/>
Run ```node benchmark -d <mounted_drive>``` to calculate your disk IOPS and random read speed. The latter can be used with the calculator tool below. The disk must be mounted (ex /mnt/md0).

3. SPoRA Hashrate calculator <br/>
Run ```node calculator -r <your_randomx_hashrate> -s <random_read_GiB/s>``` to estimate your SPoRA hashrate given your randomx h/s (from arweave randomx-benchmark), your disk random read speeds in GiB/s (from included benchmark tool) and your current share of the weave (from your running node and Arweave network). If run with parameter ```-w <your_share_of_the_weave>``` it will work fully offline without requiring a running node nor an internet connection.

4. Arweave Peers lister <br/>
Run ```node peers``` to get a peers connection list to be easily passed to your Arweave node when starting it to massively speed up the bootstrapping process. The peers are ordered by latency, fastest first. By default it will return the top 50 peers, but this can be changed with the parameter ```-n <peers_number>```.

# Updates
06/24/21: Peers lister tool added. <br/>
06/23/21: Benchmark tool added. Calculator tool updated to V1.1 with a new, more accurate, estimation formula. <br/>
06/17/21: Initial public release.

# Known issues
Sometimes the network sends inaccurate data. When the software detects it and prints an error message just wait for the next cycle update (if running the monitor tool) or just launch the tool again.
