import { nanoid } from 'nanoid';
import defaults from 'dat-swarm-defaults'
import getport from 'get-port';
import Swarm from 'discovery-swarm';
import {addBlock,getBlock,blockchain,getLatestBlock,generateNextBlock} from '../blockchain/chain.js';
import {CronJob} from 'cron';

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

let messageType = {
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',
    REGISTER_MINER: 'registerMiner'
};

const swarm = Swarm(config);

(async () => {
    const port = await puerto();

    swarm.listen(port);
    console.log('Listening port: ' + port);

    swarm.join(channel);
    swarm.on('connection', (conn, info) => {
        const seq = connSeq;
        const peerId = info.id.toString('hex');
        console.log(`Connected #${seq} to peer: ${peerId}`);

        if (info.initiator) {
            try {
                conn.setKeepAlive(true, 600);
            } catch (exception) {
                console.log('exception', exception);
            }
        }

        conn.on('data', data => {
            let message = JSON.parse(data);
            console.log('----------- Received Message start -------------');
            console.log(
                'from: ' + peerId.toString('hex'),
                'to: ' + peerId.toString(message.to),
                'my: ' + ownPeerId.toString('hex'),
                'type: ' + JSON.stringify(message.type)
            );
            console.log('----------- Received Message end -------------');

            switch (messageType) {
                case messageType.REQUEST_BLOCK:
                    console.log('-----------REQUEST_BLOCK-------------');
                    let requestedIndex = (JSON.parse(JSON.stringify(message.data))).index;
                    let requestedBlock = getBlock(requestedIndex);
                    if (requestedBlock)
                        writeMessageToPeerToId(peerId.toString('hex'), messageType.RECEIVE_NEXT_BLOCK, requestedBlock);
                    else
                        console.log('No block found @ index: ' + requestedIndex);
                    console.log('-----------REQUEST_BLOCK-------------');
                    break;
                case messageType.RECEIVE_NEXT_BLOCK:
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    addBlock(JSON.parse(JSON.stringify(message.data)));
                    console.log('Blockchain: ' + JSON.stringify(chain.blockchain));
                    let nextBlockIndex =getLatestBlock().index+1;
                    console.log('-- request next block @ index: ' + nextBlockIndex);
                    writeMessageToPeers(MessageType.REQUEST_BLOCK, {index: nextBlockIndex});
                    console.log('-----------RECEIVE_NEXT_BLOCK-------------');
                    break;
                case messageType.RECEIVE_NEW_BLOCK:
                    if ( message.to === myPeerId.toString('hex') && message.from !== ownPeerId.toString('hex')) {
                        console.log('-----------RECEIVE_NEW_BLOCK------------- ' + message.to);
                        addBlock(JSON.parse(JSON.stringify(message.data)));
                        console.log(JSON.stringify(blockchain));
                        console.log('-----------RECEIVE_NEW_BLOCK------------- ' + message.to);
                    }
                    break;
                case messageType.REQUEST_ALL_REGISTER_MINERS:
                    console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                    writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);
                    registeredMiners = JSON.parse(JSON.stringify(message.data));
                    console.log('-----------REQUEST_ALL_REGISTER_MINERS------------- ' + message.to);
                    break;
                case messageType.REGISTER_MINER:
                    console.log('-----------REGISTER_MINER------------- ' + message.to);
                    let miners = JSON.stringify(message.data);
                    registeredMiners = JSON.parse(miners);
                    console.log(registeredMiners);
                    console.log('-----------REGISTER_MINER------------- ' + message.to);
                    break;
            }
        });

        conn.on('close', () => {
            console.log(`Connection ${seq} closed, peerId: ${peerId}`);
            if (peers[peerId].seq === seq) {
                delete peers[peerId];
                console.log('--- registeredMiners before: ' + JSON.stringify(registeredMiners));
                let index = registeredMiners.indexOf(peerId);
                if (index > -1)
                    registeredMiners.splice(index, 1);
                console.log('--- registeredMiners end: ' + JSON.stringify(registeredMiners));
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

setTimeout(function(){
    writeMessageToPeers('hello', null);
        }, 2000);


//---finalizando primera parte.

//---iniciando la segunda parte.



function sendMessage(id, type, data) {
    peers[id].conn.write(JSON.stringify(
        {
            to: id,
            from: ownPeerId,
            type: type,
            data: data
        }
    ));
}

setTimeout(function(){
    writeMessageToPeers(messageType.REQUEST_ALL_REGISTER_MINERS, null);
}, 5000);

setTimeout(function(){
    writeMessageToPeers(messageType.REQUEST_BLOCK, {index: getLatestBlock().index+1});
}, 5000);

setTimeout(function(){
    registeredMiners.push(ownPeerId.toString('hex'));
    console.log('----------Register my miner --------------');
    console.log(registeredMiners);
    writeMessageToPeers(messageType.REGISTER_MINER, registeredMiners);
    console.log('---------- Register my miner --------------');
}, 7000);


//----------------------------------------------------//----------------------------------------------------
//--------------------------------------- Agregando mineros -------------------------------------
//----------------------------------------------------//----------------------------------------------------
//----------------------------------------------------//----------------------------------------------------


let registeredMiners = [];
let lastBlockMinedBy = null;


let paramCron = function(){
    let index = 0; // first block
    if (lastBlockMinedBy) {
        let newIndex = registeredMiners.indexOf(lastBlockMinedBy);
        index = ( newIndex+1 > registeredMiners.length-1) ? 0 : newIndex + 1;
    }

    lastBlockMinedBy = registeredMiners[index];
    console.log('-- REQUESTING NEW BLOCK FROM: ' + registeredMiners[index] + ', index: ' + index);
    console.log(JSON.stringify(registeredMiners));
    
    if (registeredMiners[index] === ownPeerId.toString('hex')) {
    console.log('-----------create next block -----------------');
    let newBlock = generateNextBlock(null);
    addBlock(newBlock);
    console.log(JSON.stringify(newBlock));
    writeMessageToPeers(messageType.RECEIVE_NEW_BLOCK, newBlock);
    console.log(JSON.stringify(blockchain));
    console.log('-----------create next block -----------------');
    }
   }

//const job = CronJob(' 10 * * * * *',paramCron,null,true, 'America/Los_Angeles');
const job = CronJob(' 1 * * * * *',paramCron);

job.start;

//finalizando los trabajos basicos con el cronjob.
    
