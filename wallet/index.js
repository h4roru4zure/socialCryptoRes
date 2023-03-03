//import { ec as EC } from 'elliptic';
import pkg from 'elliptic';
const { ec: EC } = pkg;
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';


const __dirname = path.resolve(),
    ec= new EC('secp256k1'),
    privateKeyLocation = __dirname + '/wallet/private_key';

 function initWallet() {
    let privateKey;
    if (existsSync(privateKeyLocation)) {
        const buffer = readFileSync(privateKeyLocation, 'utf8');
        privateKey = buffer.toString();
    } else {
        privateKey = generatePrivateKey();
        writeFileSync(privateKeyLocation, privateKey);
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    const publicKey = key.getPublic().encode('hex');
    return({'privateKeyLocation': privateKeyLocation, 'publicKey': publicKey});
}

const generatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

export {initWallet}