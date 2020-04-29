// pages/check/check.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 1,
    title: "",
    content: "",
    peoplenumber: 0,
    contentId: "",
    contract_id: "",
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
  },
  formSubmit: function (e) {
    this.setData({
      step:2,
      contract_id: e.detail.value.contract_id,
    }
    )
    const db = wx.cloud.database()
    db.collection('Contracts').where({
      contract_id:this.data.contract_id
    }).get().then(res => {
      this.setData({
        title:res.data[0]["title"],
        content:res.data[0]["content"],
        peoplenumber:res.data[0]["need_number"],
        peopleset:res.data[0]["attenders"],
        _id:res.data[0]["_id"]
      })
   // console.log(res.data[0]._id)
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
   
    const db = wx.cloud.database()
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