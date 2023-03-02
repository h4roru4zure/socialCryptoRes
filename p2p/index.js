import { nanoid } from 'nanoid';
import defaults from 'dat-swarm-defaults'
import getport from 'get-port';
import Swarm from 'discovery-swarm';
import {addBlock,getBlock,blockchain,getLatestBlock} from '../blockchain/chain.js';


console.log("========================================");
console.log("============  blockchain  ==============");
console.log("========================================");

const peers = {};
let connSeq = 0;
let channel = 'myChanelSocialCrypto';
const puerto = getport;
const ownPeerId=nanoid(8);

console.log('1.- ownPeerId  : ' + ownPeerId);
//console.log('2.- Numero hex : ',ownPeerId.toString('hex'));
const config = defaults({
    id: ownPeerId,
});
const swarm = Swarm(config);

(async () => {
    const port = await puerto();  
    swarm.listen(port);
    console.log('Listening port: ' + port);
    swarm.join(channel);
    swarm.on('connection', (conn, info) => {
    const seq = connSeq;
    const peerId = info.id.toString('hex');
    console.log(`ownPeerId #${info.id} ... Connected #${seq} to peer: ${peerId}`);
            if (info.initiator) {
            try {
            conn.setKeepAlive(true, 600);

            } catch (exception) {
            console.log('exception', exception);
            }
            }
    conn.on('close', () => {
    console.log(`Connection ${seq} closed, peerId: ${peerId}`);
    if (peers[peerId].seq === seq) {
    delete peers[peerId]
    }
    });
    if (!peers[peerId]) {
        peers[peerId] = {}
        }
        peers[peerId].conn = conn;
        peers[peerId].seq = seq;
        connSeq++
        })
})();

//=================================================
//=================================================
setTimeout(function(){
    writeMessageToPeers('hello', null);
        }, 2000);

function writeMessageToPeers  (type, data)  {
    for (let id in peers) {
    console.log('-------- writeMessageToPeers start -------- ');
    console.log('type: ' + type + ', to: ' + id);
    console.log('-------- writeMessageToPeers end ----------- ');
    sendMessage(id, type, data);
    }
};

function writeMessageToPeerToId (toId, type, data)  {
    for (let id in peers) {
    if (id === toId) {
    console.log('-------- writeMessageToPeerToId start -------- ');
    console.log('type: ' + type + ', to: ' + toId);
    console.log('-------- writeMessageToPeerToId end ----------- ');
    sendMessage(id, type, data);
    }
    }
};

 function sendMessage (id, type, data) {
    peers[id].conn.write(JSON.stringify(
    {
    to: id,
    from: ownPeerId,
    type: type,
    data: data
    }
    ));
};

//---finalizando primera parte.

//---iniciando la segunda parte.

let messageType = {
    REQUEST_LATEST_BLOCK: 'requestLatestBlock',
    LATEST_BLOCK: 'latestBlock'
   };

switch (messageType) {
    
    case messageType.REQUEST_BLOCK:
        console.log('-----------REQUEST_BLOCK-------------');
        let requestedIndex = (JSON.parse(JSON.stringify(message.data))).index;
        let requestedBlock = chain.getBlock(requestedIndex);
            if (requestedBlock)
                writeMessageToPeerToId(peerId.toString('hex'), 
                messageType.RECEIVE_NEXT_BLOCK, requestedBlock);
            else
                console.log('No block found @ index: ' + requestedIndex);
                console.log('-----------REQUEST_BLOCK-------------');
                break;

    case messageType.RECEIVE_NEXT_BLOCK:
        console.log('-----------RECEIVE_NEXT_BLOCK-------------');
        chain.addBlock(JSON.parse(JSON.stringify(message.data)));
        console.log(JSON.stringify(chain.blockchain));
        let nextBlockIndex = chain.getLatestBlock().index+1;
        console.log('-- request next block @ index: ' + nextBlockIndex);
        writeMessageToPeers(MessageType.REQUEST_BLOCK, {index: nextBlockIndex});
        console.log('-----------RECEIVE_NEXT_BLOCK-------------');
        break;
   }

setTimeout(function(){
    writeMessageToPeers(messageType.REQUEST_BLOCK, {index:getLatestBlock().index+1});
    }, 5000);

    