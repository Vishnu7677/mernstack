require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const path   = require('path')
const fs     = require('fs');

function CryptoUtil() {}

CryptoUtil.prototype.encrypt = function(text) {
  if(!text) return '';

  const ENCRYPTION_ALGO = process.env.DATA_ENCRYPTION_ALGORITHM;
  const ENCRYPTION_KEY  = crypto.createHash('sha256').update(String(process.env.DATA_ENCRYPTION_KEY)).digest('base64').substr(0, 32);

  const iv      = Buffer.alloc(16, process.env.DATA_ENCRYPTION_IV_32);
  const cipher  = crypto.createCipheriv(ENCRYPTION_ALGO, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted     = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

CryptoUtil.prototype.decrypt = function(text) {
  if(!text) return '';
  
  const ENCRYPTION_ALGO = process.env.DATA_ENCRYPTION_ALGORITHM;
  const ENCRYPTION_KEY  = crypto.createHash('sha256').update(String(process.env.DATA_ENCRYPTION_KEY)).digest('base64').substr(0, 32);

  const textParts     = text.split(':');
  const iv            = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher      = crypto.createDecipheriv(ENCRYPTION_ALGO, ENCRYPTION_KEY, iv);
  let decrypted       = decipher.update(encryptedText);
  decrypted           = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}

function randomizeStrings(a, b, c = 0) {
  if(c === (+process.env.HASH_ENTROPY || 5)) return [...a, ...b].join('');

  a = String(a);
  b = String(b);

  var d = [...a, ...b];
  var l = d.filter((_,i) => 0 === i%2);
  var r = d.filter((_,i) => 0 !== i%2);

  return randomizeStrings(l.join(''), r.join(''), c+1);
}

CryptoUtil.prototype.hash = function (text) {
  if(!text) return '';
  
  const saltRnd = +process.env.HASH_SALT_ROUNDS;
  const pepper  = process.env.HASH_PEPPER;
  const subject = randomizeStrings(text, pepper);

  const salt = bcrypt.genSaltSync(saltRnd);
  
  return bcrypt.hashSync(subject, salt);
}

CryptoUtil.prototype.hashCompare = function (text, hash) {
  if(!text) return false;
  if(!hash) return false;

  const pepper  = process.env.HASH_PEPPER;
  const subject = randomizeStrings(text, pepper);
  
  return bcrypt.compareSync(subject, hash);
}

CryptoUtil.prototype.mask = function(text='', from=4, to=10, maskWith='*') {
  const maskPattern = maskWith.repeat(to-from);
  return text.replace(text.substring(from, to), maskPattern);
}

CryptoUtil.prototype.public = {
  encrypt: function(text, pathToPublicKey = process.env.PKE_PATH_TO_PUBLIC_KEY) {
    const absolutePath = path.resolve(pathToPublicKey)
    const publicKey    = fs.readFileSync(absolutePath, 'utf8')
    const buffer       = Buffer.from(text, 'utf8')
    const encrypted    = crypto.publicEncrypt(publicKey, buffer)
    
    return encrypted.toString('base64');
  },

  decrypt: function(text, pathToPrivateKey = process.env.PKE_PATH_TO_PRIVATE_KEY) {
    const absolutePath = path.resolve(pathToPrivateKey)
    const privateKey   = fs.readFileSync(absolutePath, 'utf8')
    const buffer       = Buffer.from(text, 'base64')
    const decrypted    = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: process.env.PKE_PASS_PHRASE,
      },
      buffer
    );
    
    return decrypted.toString('utf8')
  }
}

module.exports = new CryptoUtil();