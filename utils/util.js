wx.cloud.init()
const db = wx.cloud.database()
const chainUtil = require("chain_access.js")
const app = getApp()

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getAccountInfo (openid, that) {
  if(openid === null){
    console.log("openId unvalid")
    return null
  }
  console.log(openid)

  var accountDb = db.collection("Accounts")
  let data
  accountDb.where({
    openid : openid
  })
  .count().then(res => {
    //get num of results first
    console.log(res)
    
    if (res.total == 0) {
      //if no such account in database
      data = {
        contract_Set: [],
        handle_url: app.globalData.userInfo.avatarUrl,
        nickname: app.globalData.userInfo.nickName,
        openid: openid
      }
      db.collection("Accounts").add({
        data: data,
      })
      .then(res => {
        console.log(res)
      })
      .catch(console.error)
      that.accountInfo = data
    }
    else if(res.total == 1){
      //correct, get account info
      accountDb.where({
        openid: openid
      })
      .get().then(res => {
        console.log(res)
        data = res.data
        that.accountInfo = data
      })
    }
    else{
      console.log("why so many results?")
    }
  })
  
  return data
}

//获取所有协议
function getAll(that){
  var contractDb = db.collection("Contracts")
  contractDb.count().then(res => {
      that.setData({
        contractNum: res.total
      })
      contractDb.get().then(res =>{
        console.log(res)
        that.setData({
          list: res.data
        })
      })
    }
  )
}

//获取协议总数
function getNum(that) {
  var contractDb = db.collection("Contracts")
  contractDb.count().then(res => {
    console.log(res.total)
    that.setData({
      contractNum: res.total
    })
  })
}

//通过id获取协议内容并更新页面
function getDataById(id, that) {
  that.setData({
    step: 2,
    _id: id
  })
  //分辨是否在链上
  db.collection('Contracts').doc(that.data._id)
    .get().then(async res => {
      console.log(res)
      that.setData({
        title: res.data["title"],
        content: res.data["content"],
        peoplenumber: res.data["need_number"],
        peopleset: res.data["attenders"],
        _id: res.data["_id"],
        onChain: res.data["onChain"],
        hashId: res.data["HashId"]
      })
      //如果在链上，重新取
      if (that.data.onChain) {
        var json = await chainUtil.queryEvidence(that.data.hashId)
        var chainData = JSON.parse(json)
        that.setData({
          title: chainData.title,
          content: chainData.content,
          peoplenumber: chainData.need_number,
          peopleset: chainData.attenders,
          _id: chainData._id
        })
        console.log("根据链上数据进行更新!")
      }
      //检查本人是否参加了
      var attendIndex = that.data.peopleset.indexOf(app.globalData.openid)
      console.log("attendIndex =  " + attendIndex)
      if (attendIndex > -1) {
        that.setData({
          canAttend: false,
          btnText: "已报名"
        })
      }
      else {
        //检查是否人已满
        if (that.data.peoplenumber <= that.data.peopleset.length) {
          that.setData({
            canAttend: false,
            btnText: "人已满"
          })
        }
      }

    })
}

module.exports = {
  formatTime: formatTime,
  getAccountInfo: getAccountInfo,
  getAll: getAll,
  getNum: getNum,
  getDataById: getDataById
}
