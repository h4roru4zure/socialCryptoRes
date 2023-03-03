import fs from'fs';
import path from 'path';

const __dirname = path.resolve("/home/haroru/","socialCryptoRes","db");
console.log(__dirname)
// let db;
// let createDb = (peerId) => {
// const __dirname = path.dirname(__filename);
// console.log(__filename);
// console.log(__dirname);
// let dir = __dirname + '/db/' + peerId;

// if (!fs.existsSync(dir)){
//     fs.mkdirSync(dir);
//     db = level(dir);
//     storeBlock(getGenesisBlock());
// }
// }