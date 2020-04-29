// pages/check/check.js
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()
const chainUtil = require("../../utils/chain_access.js")

Page({

  data: {
    //协议信息
    step: 1,
    title: "",
    content: "",
    peoplenumber: 0,
    _id:"",
    peopleset: [],
    onChain: false,
    //本人是否参与
    attended: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 需检查是否授权有 openid，如无需获取
    if (!app.globalData.openid) {
      console.log("no login")
      wx.showModal({
        title: '提示',
        content: '请登录后进行查看',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            wx.navigateBack({
              complete: (res) => {},
            })
          }
        }
      })
    }
    //检查options中是否有id，如果有则直接跳到查看
    if(options._id){
      console.log(options._id)
      this.setData({
        step: 2,
        _id: options._id
      })
      var that = this
      db.collection('Contracts').doc(that.data._id)
      .get().then(res => {
        console.log(res)
        that.setData({
          title: res.data["title"],
          content: res.data["content"],
          peoplenumber: res.data["need_number"],
          peopleset: res.data["attenders"],
          _id: res.data["_id"],
          onChain: res.data["onChain"]
        })
        //检查本人是否参加了
        var attendIndex = that.data.peopleset.indexOf(app.globalData.openid)
        console.log("attendIndex =  "+attendIndex)
        console.log(attendIndex > -1)
        that.setData({
          attended: (attendIndex > -1)
        })
      })
    }
  },
  formSubmit: function (e) {
    this.setData({
      step:2,
      _id: e.detail.value._id,
    })
    var that = this
    db.collection('Contracts').doc(that.data._id)
    .get().then(res => {
      that.setData({
        title:res.data["title"],
        content:res.data["content"],
        peoplenumber:res.data["need_number"],
        peopleset:res.data["attenders"],
        _id:res.data["_id"],
        onChain: res.data["onChain"]
      })
      //检查本人是否参加了
      var attendIndex = that.data.peopleset.indexOf(app.globalData.openid)
      console.log("attendIndex =  " + attendIndex)
      that.setData({
        attended: (attendIndex > -1)
      })
    })
    //console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },

  Close: function() {
    console.log("close"),
    wx.navigateBack({
      complete: (res) => {},
    })
  },

  sub2tass: function () {
    // 构造json数组
    console.log(this.data.peopleset)
    console.log("openid: ", app.globalData.openid)
    this.data.peopleset.push(app.globalData.openid)
   
    //根据人数判断是否需要上链
    if(this.data.peopleset.length == this.data.need_number){
      //需要
      //调用sdk上链
      var blockData = {
        _id: this.data._id,
        attenders: this.data.peopleset,
        need_number: this.data.peoplenumber,
        title: this.data.title,
        content: this.data.content
      }
      chainUtil.store(blockData)
    }
    else{
      //不需要
      db.collection('Contracts').doc(this.data._id).update({
        data: {
          attenders: this.data.peopleset
        },
        success: res => {
          wx.showToast({
            title: '报名成功！',
          })
          console.log('报名成功!')
        },
        fail: err => {
          wx.showToast({
            title: '报名失败…',
          })
          console.log('报名失败：', err)
        }
      })
    }

   },
})