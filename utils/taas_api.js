const taas = require("miniprogram-taas-sdk");
const sdkp = taas.promises;

const kp = {
  privateKey: '82a09e0ae57d75faee3e940e0506c90fece35883124806c2247803fcd550d151',
  publicKey: '0454e60b7aaad4eb600fd517c6d1fd2af9be3b57c34294d084bd2a45bfc00debe42ae0a5e9450081241e399ca5cab63491323ca625b04c73a9421c43093d7a8ac8',
  credential: '54f2ee6c01842b5e443022c5ae56beca4bab1892'
}

function store(data) {
  taas.storeEvidence(data, undefined, kp, (err, data) => {
    if (err) return;
    const hashId = data.hash;
    // save in database
    
  })
}

function query(hashId) {
  sdk.queryEvidence(hashId, undefined, kp, (err, data) => {
    if (err) return;
    // Get the response
    const _message = data.data.text;
    // try to show message
    // console.log(_message); // Expect: test_message
  });
}


module.exports = {
  store: store,
  query: query
}