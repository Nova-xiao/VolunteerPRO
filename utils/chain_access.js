const taas = require("miniprogram-taas-sdk");
const sdkp = taas.promises;
const keyp = {
  privateKey:"82a09e0ae57d75faee3e940e0506c90fece35883124806c2247803fcd550d151",
  publicKey:"0454e60b7aaad4eb600fd517c6d1fd2af9be3b57c34294d084bd2a45bfc00debe42ae0a5e9450081241e399ca5cab63491323ca625b04c73a9421c43093d7a8ac8",
  credential:"54f2ee6c01842b5e443022c5ae56beca4bab1892"
}

function store(content) {
  console.log("store!!!", content)
  content = {
    text: content
  }
  taas.storeEvidence(content, undefined, keyp, (err, obj) => {
    console.log("callbaeck")
    if (err) return;
    const hashId = obj.hash;
    // save in database
    const db = wx.cloud.database()
    console.log("hash", hashId)
    console.log("obj", obj)
    console.log("content", content.text._id)

    db.collection('Contracts').doc(content.text._id).update({
      data:{
        onChain: true
      },
      success: function(res) {
        console.log("update")
        console.log("res", res)
      },
      fail: function() {
        console.log("failed")
      }
    })
  })
}

function query(hashId) {
  sdk.queryEvidence(hashId, undefined, keyp, (err, data) => {
    if (err) return;
    // Get the response
    const _message = data.data.text;
    // try to show message
    // console.log(_message); // Expect: test_message
  });
}


// Use these fucntions to get access to taas
/*
* To use this module, require("[relative path to this file]")
* funtion storeEvidence(data) takes one argument:
*   data: string
* the function returns the hashid of the store query:
*   hash: string
*
*
* function queryEvidence(hash) takes one argument:
*    hash: string
# the function returns the saved data(string type) on the blockchain:
*    text: strings
*/ 
module.exports = {
  storeEvidence: async function (data){
    var content = {
      text: data
    }
    var resp = await sdkp.storeEvidence(content, undefined, keyp);
    var hash = resp.hash;
    console.log(hash);
    return hash;
  },

  queryEvidence: async function (hash){
    var data =  await sdkp.queryEvidence(hash, undefined, keyp);
    console.log(data);
    return data.data.text;
  },


  /*
  store: function store(data){
    var addr = taas.getServerAddr();
    
    taas.storeEvidence(data, undefined, credential, (err, data) => {
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
  */

  store: store,
  query: query
}
