 class BlockHeader {
    
    constructor(version, previousBlockHeader, merkleRoot, time,dificultyLevel,nonceNumber) 
   {
    this.version = version;
    this.previousBlockHeader = previousBlockHeader;
    this.merkleRoot = merkleRoot;
    this.time = time;
    this.dificultyLevel=dificultyLevel;
    this.nonceNumber=nonceNumber;
    }
   };

class Block {
    
    constructor(blockHeader, index, txns)
    {
    this.blockHeader = blockHeader;
    this.index = index;
    this.txns = txns;
    }
};

export {BlockHeader,Block} ;


// exports.BlockHeader = class BlockHeader {
//     constructor(version, previousBlockHeader, merkleRoot, time) 
//    {
//     this.version = version;
//     this.previousBlockHeader = previousBlockHeader;
//     this.merkleRoot = merkleRoot;
//     this.time = time;
//     }
//    };
//    exports.Block = class Block {
//     constructor(blockHeader, index, txns) {
//     this.blockHeader = blockHeader;
//     this.index = index;
//     this.txns = txns;
//     }
//    }