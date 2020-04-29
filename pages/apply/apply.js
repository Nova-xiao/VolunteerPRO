// pages/apply/apply.js
const blockchain = require('../../utils/chain_access.js')
const app = getApp()
const util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 1,
    title: "",
    content: "",
    need_number: 0,
    contentId: "",
    contractNum: 0
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
        content: '请登录后进行申请',
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
    util.getNum(this)
    console.log(this.data.contractNum)
  },
  formSubmit: function (e) {
    this.setData({
      step: 2,
      title: e.detail.value.Title,
      content: e.detail.value.Content,
      need_number: e.detail.value.PeopleNumber
    })
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },

  Modify: function () {
    this.setData({
      step: 1
    })
  },

  sub2database: function () {
    //获得总合约数，为生成contract_id准备
    util.getNum(this)
    // 构造json数组
    var json = {
      HashId: "",
      attenders: [],
      content: this.data.content,
      contract_id: this.data.contractNum,
      contract_url: "",
      need_number: this.data.need_number,
      onChain: false,
      owner: app.globalData.openid,
      title: this.data.title,
    }
    console.log(json)
    // 上传至数据库
    const db = wx.cloud.database()
    db.collection('Contracts').add({
      data: json,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          contentId: res._id,
        })
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        db.collection('Accounts').where({
          _openid: app.globalData.openid
        }).update({
          data: {
            contract_Set: db.command.push(this.data.contentId)
          }
        })
        this.setData({
          step: 3
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
   },

  copyid: function () {
    wx.setClipboardData({
      data: this.data.contentId
    })
   }
})