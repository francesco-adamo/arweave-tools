const { execSync } = require('child_process');

console.log();
console.log('+----------------------------+');
console.log('| RANDOM READ BENCHMARK V1.0 |');
console.log('| Francesco Adamo - 06/23/21 |');
console.log('+----------------------------+');
console.log();

// CHANGELOG
// 06/23/21 V1.0: initial public release

const { program } = require('commander');
program.option('-d, --drive <mounted_drive>', 'mounted drive to test (ex. /mnt/md0) where your \'data_dir\' is located [REQUIRED]');
program.parse(process.argv);
const options = program.opts();

const drive = options.drive;

if (!drive) {
    console.log('error: missing parameter');
    console.log('mandatory parameter (-d, --drive) was not specified');
    console.log('run with (-h, --help) for more information');
    console.log();
    return;
}

// DISK BENCHMARK
try {
    console.log('running disk benchmark, please wait...');
    const result = execSync('cd ' + drive + ' && sudo fio --randrepeat=1 --ioengine=libaio --direct=1 --gtod_reduce=1 --name=test --filename=test --bs=4k --iodepth=64 --size=4G --readwrite=randread | grep IOPS && sudo rm ./test');

    const splitted = result.toString().split(/IOPS=|, BW=| \(/);
    const iops = splitted[1];
    console.log('IOPS: ' + iops);
    let randomRead = splitted[2];
    console.log('random read: ' + randomRead);
    if (randomRead.includes('GiB')) randomRead = (randomRead.slice(0, -5)).toFixed(2);
    else if (randomRead.includes('MiB')) randomRead = (randomRead.slice(0, -5) / 1024).toFixed(2);
    else if (randomRead.includes('kiB')) randomRead = (randomRead.slice(0, -5) / (1024 * 1024)).toFixed(2);

    console.log('GiB/s: ' + randomRead);
}
catch (err) {
    console.log('there was an error!');
    console.log(err.toString().slice(0, 200));
    console.log('terminating...');
}
console.log();
