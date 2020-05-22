// pages/check/check.js
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()
const chainUtil = require("../../utils/chain_access.js")
const util = require("../../utils/util.js")

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
    hashId: "",
    //本人是否能参与
    canAttend: true,
    //报名按钮文字
    btnText: "点击报名",
    img: null,
    //base64编码图片
    path: null
    //图片路径
  },

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
    if(options._id){
      //如果有_id，直接跳转到对应协议查看
      await util.getDataById(options._id, this)
      if(this.data.img != null){
        util.base64src(this.data.img, res => {
          console.log(res)
          this.setData({
            path: res
          })
        })
      }
    }
  },

  //输入id显示协议内容
  formSubmit: function (e) {
    util.getDataById(e.detail.value._id, this)
  },

  Close: function() {
    console.log("close"),
    wx.navigateBack({
      complete: (res) => {},
    })
  },

  sub2tass: async function () {
    // 构造json数组
    console.log(this.data.peopleset)
    console.log("openid: ", app.globalData.openid)

    var tmp =  this.data.peopleset;
    tmp.push(app.globalData.openid);
    this.setData({
      peopleset:tmp
    });

    var that = this;
    console.log(this.data._id);
    //添加到数据库
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
    
    console.log(this.data.peopleset.length);
    console.log(this.data.peoplenumber);
    // 检查是否上链
    if(this.data.peopleset.length == this.data.peoplenumber){
      console.log("Inside if");
      var blockData = {
        _id: this.data._id,
        attenders: this.data.peopleset,
        need_number: this.data.peoplenumber,
        title: this.data.title,
        content: this.data.content,
        img: this.data.img
      }

      var uploadData = JSON.stringify(blockData);

      var hashId = await chainUtil.storeEvidence(uploadData);

      console.log(hashId);

      db.collection('Contracts').doc(this.data._id).update({
        data: {
          HashId:hashId,
          onChain:true
        },
        success: res => {
          //that.onLoad();
          console.log('刷新成功!');
          that.Close();
        }
      })

    }

    /*
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
*/
    //this.onLoad();
   }
})