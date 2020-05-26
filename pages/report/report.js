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
    //活动记录id
    contractId:"",
    title:"",
    //申诉记录id
    appealId:"",
    //申诉人昵称
    nickname:"",
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
    // 获取昵称
    var that = this;
    wx.getUserInfo({
      success:function(res){
        console.log(res);
        var nickName = 'userInfo.nickName';
        that.setData({
          nickname: res.userInfo.nickName,
        })
      }
    })
    if(options.id){
      this.setData({
        contractId: options.id
      })
    }
    if(options.title){
      this.setData({
        title:options.title
      })
    }
    if(options.appealId){
      //console.log("Getting appealid: ", options.appealId)
      db.collection('Appeals').doc(options.appealId)
      .get().then(async res => {
        console.log(res)
        that.setData({
          title: res.data["title"],
          content: res.data["content"],
          nickname: res.data["nickname"],
          contractId: res.data["contractId"]
        })
      })
      this.setData({
        appealId:options.appealId,
        step:2
      })
    }

    console.log("Report id: ", this.data.contractId, "  title: ", this.data.title)
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
    this.setData({
      content: e.detail.value.content
    })

    // 构造json数组
    var json = {
      title:this.data.title,
      content: this.data.content,
      claimant: app.globalData.openid,
      onChain: false,
      nickname: this.data.nicknam,
      contractId: this.data.contractId
    }
    // 上传至数据库
    const db = wx.cloud.database()
    db.collection('Appeals').add({
      data: json,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          appealId: res._id,
        })
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        db.collection('Accounts').where({
          _openid: app.globalData.openid
        }).update({
          data: {
            appeal_Set: db.command.push(this.data.appealId)
          }
        })
        db.collection('Contracts').where({
          _id: this.data.contractId
        }).update({
          data: {
            appealers: db.command.push(app.globalData.openid),
            appealed: true
          }
        })
        this.setData({
          step: 2
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
  //拷贝申诉记录id
  copyid: function () {
    wx.setClipboardData({
      data: this.data.appealId
    })
   },
   jump2check: function(){
     //console.log("Important: ", this.data.contractId)
     wx.navigateTo({
       url: '/pages/check/check?_id='+this.data.contractId+'&appealed='+true
     }
     )
   }

})

