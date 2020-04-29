// pages/check/check.js
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 1,
    title: "",
    content: "",
    peoplenumber: 0,
    _id:""
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
          _id: res.data["_id"]
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
        _id:res.data["_id"]
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
   
    db.collection('Contracts').doc(this.data._id).update({
      data:{
        attenders:this.data.peopleset,
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
   },
})