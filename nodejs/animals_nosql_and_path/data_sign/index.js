const crypto = require('crypto');

// Your data to be signed
const dataToSign = 'Some text to sign';

// Generate an asymmetric key pair (RSA in this case)
const keys = crypto.generateKeyPairSync('rsa', {
    modulusLength: 512,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

function sign(_dataToSign, _seperator) {
    const sign = crypto.createSign('sha256');
    sign.update(_dataToSign);
    const signature = sign.sign(keys.privateKey, 'base64');

    return _dataToSign + _seperator + signature;
}

function extractSignedData(_data, _seperator) {
    const dataSplit = _data.split(_seperator);
    if (dataSplit.length !== 2) {
        return undefined;
    }

    const dataToSign = dataSplit[0];
    const signature = dataSplit[1];

    const verify = crypto.createVerify('sha256');
    verify.update(dataToSign);
    const isSignatureValid = verify.verify(keys.publicKey, signature, 'base64');
    return isSignatureValid ? dataToSign : undefined;
}

module.exports = { sign, extractSignedData };
/*const seperator = '#'
const d1 = "monkey.webp";
const signed = sign(d1, seperator);
console.log('data', d1);
console.log('signed', signed);
console.log('unsigned', extractSignedData(signed, seperator));
const signed2 = 'a' + signed.substring(1);
console.log('signed2', signed2);
console.log('unsigned', extractSignedData(signed2, seperator));
*/
