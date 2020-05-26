// pages/check/check.js
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()
const chainUtil = require("../../utils/chain_access.js")
const util = require("../../utils/util.js")

Page({
    /**
   * 页面的初始数据
   */
  data: {
    //协议信息
    step: 1,
    content: "",
    _id:"",
    onChain: false,
    hashId: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 需检查是否授权有 openid，如无需获取
    if (!app.globalData.openid) {
      console.log("no login")
      wx.showModal({
        title: '提示',
        content: '请登录后进行查看',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateBack({
              complete: (res) => { },
            })
          }
        }
      })
    }
    this.setData({
      _id: options.id
    })
    console.log("Report id: ", this.data._id)
  },

  Close: function() {
    console.log("close"),
    wx.navigateBack({
      complete: (res) => {},
    })
  },
  //提交申诉内容
  formSubmit: function (e) {
    console.log("Submitting ", e.detail.value.content)
  },
  //拷贝申诉记录id
  copyid: function () {
    wx.setClipboardData({
      data: this.data._id
    })
   }
})

