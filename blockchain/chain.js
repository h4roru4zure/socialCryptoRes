import  {BlockHeader}  from './block.js';
import  {Block}  from './block.js';
import  sha256 from 'crypto-js/sha256.js';
//import {random} from 'crypto-js/core.js';
import moment from "moment";
import pkg from 'crypto-js/core.js';
//const {random} = pkg;
import randomBytes from 'randombytes';

let getGenesisBlock = () => {
    let message='socialCrytoRes';
    let nonceNumber =randomBytes(16);
    let dificultyLevel=sha256(nonceNumber+message)
    let blockHeader = new BlockHeader(1, null, 
        "0x1bc3300000000000000000000000000000000000000000000", moment().unix(),dificultyLevel,nonceNumber);
    return new Block(blockHeader, 0, null);
};
const blockchain = [getGenesisBlock()];
let getLatestBlock = () => blockchain[blockchain.length-1];
let addBlock = (newBlock) => {
    let prevBlock = getLatestBlock();
    if (prevBlock.index < newBlock.index && newBlock.
    blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
        blockchain.push(newBlock);
    }
}
let getBlock = (index) => {
    if (blockchain.length-1 >= index)
        return blockchain[index];
    else
    return null;
}

// if (typeof exports != 'undefined' ) {
// exports.addBlock = addBlock;
// exports.getBlock = getBlock;
// exports.blockchain = blockchain;
// exports.getLatestBlock = getLatestBlock;
// }

export {addBlock,getBlock,blockchain,getLatestBlock};