// https://gist.github.com/falkolab/f160f446d0bda8a69172

const { parse } = require('url')
const http = require('https')
const fs = require('fs')
const { basename } = require('path')

const TIMEOUT = 10000

const BASE_IPA_NAME = process.argv.includes("--icreate") ? "icreate.ipa" : "base.ipa";

module.exports = function(url, path) {
  const uri = parse(url)
  if (!path) {
    path = basename(uri.path)
  }
  const file = fs.createWriteStream(path)

  return new Promise(function(resolve, reject) {
    const request = http.get(uri.href).on('response', function(res) {
      const len = parseInt(res.headers['content-length'], 10)
      let downloaded = 0
      let percent = 0
      res
        .on('data', function(chunk) {
          file.write(chunk)
          downloaded += chunk.length
          percent = (100.0 * downloaded / len).toFixed(2)
          process.stdout.write(`Downloading ${BASE_IPA_NAME} - ${percent}%\r`)
        })
        .on('end', function() {
          file.end()
          console.log(`Downloaded!`)
          resolve()
        })
        .on('error', function (err) {
          reject(err)
        })
    })
    request.setTimeout(TIMEOUT, function() {
      request.abort()
      reject(new Error(`request timeout after ${TIMEOUT / 1000.0}s`))
    })
  })
}