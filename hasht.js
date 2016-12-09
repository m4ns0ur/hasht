const crypto = require('crypto')
const fs = require('fs')
const progress = require('progress-stream')
const logUpdate = require('log-update')

const frames = ['-', '\\', '|', '/']

exports.hash = (fileName, progCallback, finishCallback) => {
  const hashMd5 = crypto.createHash('md5')
  const hashSha1 = crypto.createHash('sha1')
  const hashSha256 = crypto.createHash('sha256')
  const hashSha384 = crypto.createHash('sha384')
  const hashSha512 = crypto.createHash('sha512')

  const stat = fs.statSync(fileName)
  const prog = progress({
      length: stat.size,
      time: 100
  })
  let i = 0
  prog.on('progress', function(progress) {
      const frame = frames[i = ++i % frames.length]
      const percentage = Math.round(progress.percentage)
      const transferred = progress.transferred
      const size = progress.length
      logUpdate(`${frame} %${percentage} calculated: ${transferred}, size: ${size}`)
      if (isFunction(progCallback)) {
        progCallback(percentage, transferred, size)
      }
  })

  const input = fs.createReadStream(fileName).pipe(prog)
  input.on('data', (chunk) => {
    hashMd5.update(chunk)
    hashSha1.update(chunk)
    hashSha256.update(chunk)
    hashSha384.update(chunk)
    hashSha512.update(chunk)
  })
  input.on('end', () => {
    logUpdate(`hash (file: ${fileName}, size: ${stat.size})`)
    console.log('-----------------------------------------------------------')
    let md5 = hashMd5.digest('hex')
    let sha1 = hashSha1.digest('hex')
    let sha256 = hashSha256.digest('hex')
    let sha384 = hashSha384.digest('hex')
    let sha512 = hashSha512.digest('hex')
    console.log(`MD5: ${md5}\nSHA-1: ${sha1}\nSHA-256: ${sha256}\nSHA-384: ${sha384}\nSHA-512: ${sha512}\n`)
    if (isFunction(finishCallback)) {
      finishCallback([md5, sha1, sha256, sha384, sha512])
    }
  })
}

function isFunction(func) {
    return func && typeof(func) == 'function'
}
