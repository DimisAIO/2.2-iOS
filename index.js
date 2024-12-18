var prompt = require('prompt-sync')();
const dl = require('./dl.js');
const zipFolder = require('./zipper');
const fs = require("fs");
var crypto = require("crypto");
const decompress = require("decompress");
require("dotenv").config();

async function main() {
    const ICREATE_MODE = process.argv.includes("--icreate");

    const BASE_IPA_NAME = ICREATE_MODE ? "icreate.ipa" : "base.ipa";
    const BASE_IPA_LINK = ICREATE_MODE ? "https://objectstorage.us-phoenix-1.oraclecloud.com/n/axe9yayefpvx/b/iCreateVersions/o/iCreatePro_6.7.1.ipa" : "https://us-east-1.tixte.net/uploads/files.141412.xyz/base.ipa";
    const BASE_BUNDLE_ID = ICREATE_MODE ? "com.camila314.icreate" : "com.robtopx.geometryjump";

    console.log("2.2 maker for iOS - https://dimisaio.be\n");
    if (ICREATE_MODE) console.log("iCreate Pro mode\n");

    if (!fs.existsSync(BASE_IPA_NAME)) await dl(BASE_IPA_LINK, BASE_IPA_NAME);

    var name = process.env.name ? process.env.name : prompt("Enter GDPS name: ");
    name = name.replaceAll(" ", "");

    var dir = `${name.toLowerCase()}-${crypto.randomBytes(8).toString('hex')}`;

    if (ICREATE_MODE) {
        var bundle = process.env.bundle ? process.env.bundle : prompt("Enter bundle id (21 chars): ");

        while (bundle.length != 21) {
            console.log("Length isn't 21!!!\n");
            var bundle = prompt("Bundle id: ");
        }
    } else {
        var bundle = process.env.bundle ? process.env.bundle : prompt("Enter bundle id (23 chars): ");

        while (bundle.length != 23) {
            console.log("Length isn't 23!!!\n");
            var bundle = prompt("Bundle id: ");
        }
    }

    var base = process.env.url ? process.env.url : prompt("Enter URL (33 chars): ");

    while (base.length != 33) {
        console.log("Length isn't 33!!!\n");
        var base = prompt("Enter URL (33 chars): ");
    }
    var b64 = Buffer.from(base).toString('base64');
    var url = `${base}/`;
    var path = `${dir}/Payload/${name}.app`

    console.log(`Decompressing ${BASE_IPA_NAME}\n`);

    await decompress(BASE_IPA_NAME, dir);

    console.log("Editing IPA at " + dir + "\n")

    await fs.promises.rename(`${dir}/Payload/GeometryJump.app`, path);
    await fs.promises.rename(`${path}/GeometryJump`, `${path}/${name}`);
    
    var plist = await fs.promises.readFile(`${path}/Info.plist`, 'utf8');
    if (ICREATE_MODE) plist = plist.replaceAll(BASE_BUNDLE_ID, bundle).replaceAll("GeometryJump", name).replaceAll("iCreate Pro", name);
    else plist = plist.replaceAll(BASE_BUNDLE_ID, bundle).replaceAll("GeometryJump", name).replaceAll("Geometry", name);
    await fs.promises.writeFile(`${path}/Info.plist`, plist, 'utf8');
        
    var gd = await fs.promises.readFile(`${path}/${name}`, 'binary');
    gd = gd.replaceAll(BASE_BUNDLE_ID, bundle).replaceAll("https://www.boomlings.com/database", url).replaceAll("aHR0cDovL3d3dy5ib29tbGluZ3MuY29tL2RhdGFiYXNl", b64);
    if (process.argv.includes("--megasa1nt")) gd = gd.replaceAll("https://www.newgrounds.com/audio/download/%i", `${url}//music/%i`);
    await fs.promises.writeFile(`${path}/${name}`, gd, 'binary');

    if (ICREATE_MODE) {
        var icreate = await fs.promises.readFile(`${path}/hook.dylib`, 'binary');
        icreate = icreate.replaceAll(BASE_BUNDLE_ID, bundle).replaceAll("com.camila314.icreate", bundle);
        await fs.promises.writeFile(`${path}/hook.dylib`, icreate, 'binary');
    }

    console.log("Compressing...\n")

    await zipFolder(dir, `${name}.ipa`);
    
    await fs.promises.rm(dir, { recursive: true, force: true });

    console.log("Done! Project by DimisAIO.be :)")
}

main(); // ok
