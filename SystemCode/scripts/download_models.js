const path = require('path');
const { Storage } = require('@google-cloud/storage');
const Progress = require('cli-progress');

const gs = new Storage;

(async () => {
    const bucket = gs.bucket('quickdraw-models');
    let files = (await bucket.getFiles({
        directory: 'sketchRNN/large_models'
    }))[0].filter(file => file.name.endsWith('gen.json'));
    const names = new Set(files.map(file => path.basename(file.name)));
    files = files.concat((await bucket.getFiles({
        directory: 'sketchRNN/models'
    }))[0].filter(file => file.name.endsWith('gen.json') && !names.has(path.basename(file.name))));
    const bar = new Progress.SingleBar({
        format: 'Downloading models... {bar} | {percentage}% | {eta_formatted} | {value}/{total}'
    }, Progress.Presets.shades_classic);
    bar.start(files.length, 0);
    await Promise.allSettled(files.map(file => file.download({
        destination: path.resolve(
            __dirname,
            '../src/assets/models/sketchrnn',
            path.basename(file.name))
    }).then(() => bar.increment(1))));
    process.exit();
})();
