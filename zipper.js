const fs = require('fs');
const archiver = require('archiver');

function zipFolder(sourceFolder, zipFilePath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Set compression level to maximum
        });

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');

            resolve();
        });

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning
                console.warn(err);
            } else {
                // throw error
                reject(err);
            }
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        archive.directory(sourceFolder, false);

        archive.finalize();
    });
}

module.exports = zipFolder;
