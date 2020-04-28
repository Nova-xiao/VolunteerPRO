const taas = require("miniprogram-taas-sdk");
const sdkp = taas.promises;

const keypair = {
  privateKey:"82a09e0ae57d75faee3e940e0506c90fece35883124806c2247803fcd550d151",
  publicKey:"0454e60b7aaad4eb600fd517c6d1fd2af9be3b57c34294d084bd2a45bfc00debe42ae0a5e9450081241e399ca5cab63491323ca625b04c73a9421c43093d7a8ac8",
  credential:"54f2ee6c01842b5e443022c5ae56beca4bab1892"
}

function store(data){
  var addr = taas.getServerAddr();
  
  taas.storeEvidence(data, addr, credential, (err, data) => {
    if (err) return ;
    // Get the hash ID
    const hashId = data.hash;
  
    // Query evidence by hash ID
    sdk.queryEvidence(hashId, undefined, kp, (err, data) => {
        if (err) return ;
        // Get the response
        const _message = data.data.text;
        console.log(_message); // Expect: test_message
    });
  })
  

  //var resp = await sdkp.storeEvidence(data, undefined, keypair);
  //var hash = resp.hash;
  return hash;

}



module.exports = {
  store: store
}