const taas = require("miniprogram-taas-sdk");
const sdkp = taas.promises;

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