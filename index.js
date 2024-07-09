var prompt = require('prompt-sync')();
const dl = require('./dl.js');
const zipFolder = require('./zipper');
const fs = require("fs");
var crypto = require("crypto");
const decompress = require("decompress");
require("dotenv").config();

async function main() {

    console.log("2.2 maker for iOS - https://dimisaio.be\n");

    if (!fs.existsSync("base.ipa")) {
        await dl("https://us-east-1.tixte.net/uploads/files.141412.xyz/base.ipa", 'base.ipa');
    }

    var name = process.env.name ? process.env.name : prompt("Enter GDPS name: ");
    name = name.replaceAll(" ", "");

    var dir = `${name.toLowerCase()}-${crypto.randomBytes(8).toString('hex')}`;

    var bundle = process.env.bundle ? process.env.bundle : prompt("Enter bundle id (23 chars): ");

    while (bundle.length != 23) {
        console.log("Length isn't 23!!!\n");
        var bundle = prompt("Bundle id: ");
    }

    var base = process.env.url ? process.env.url : prompt("Enter URL (33 chars): ");

    while (base.length != 33) {
        console.log("Length isn't 33!!!\n");
        var base = prompt("Enter URL (33 chars): ");
    }
    var b64 = Buffer.from(base).toString('base64');
    var url = `${base}/`;
    var path = `${dir}/Payload/${name}.app`

    console.log("Decompressing base.ipa\n");

    await decompress("base.ipa", dir);

    console.log("Editing IPA at " + dir + "\n")

    await fs.promises.rename(`${dir}/Payload/GeometryJump.app`, path);
    await fs.promises.rename(`${path}/GeometryJump`, `${path}/${name}`);
    
    var plist = await fs.promises.readFile(`${path}/Info.plist`, 'utf8');
    plist = plist.replaceAll("com.robtop.geometryjump", bundle).replaceAll("GeometryJump", name).replaceAll("Geometry", name);
    await fs.promises.writeFile(`${path}/Info.plist`, plist, 'utf8');
    
    var gd = await fs.promises.readFile(`${path}/${name}`, 'binary');
    gd = gd.replaceAll("com.robtop.geometryjump", bundle).replaceAll("https://www.boomlings.com/database", url).replaceAll("aHR0cDovL3d3dy5ib29tbGluZ3MuY29tL2RhdGFiYXNl", b64);
    await fs.promises.writeFile(`${path}/${name}`, gd, 'binary');
    
    console.log("Compressing...\n")

    await zipFolder(dir, `${name}.ipa`);
    
    await fs.promises.rm(dir, { recursive: true, force: true });

    console.log("Done! Project by DimisAIO.be :)")
}

main(); // ok
