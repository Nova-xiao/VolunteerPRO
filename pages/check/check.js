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
    // tmp contract list
    tmp_contract_list: [],
    //本人合同list
    myContracts: [],
    // 合同是否完成
    isFinish: false,
    canUpload: false,
    hasUPload: false,
    //本人是否能参与
    canAttend: true,
    //本人是否能撤销
    canRetreat: false,
    //本人是否能终止活动
    canCancel: false,
    //本人是否能投诉
    canReport: false,
    //报名按钮文字
    btnText: "点击报名",
    img: null,
    finish_img: null,
    finish_img_path: null,
    //base64编码图片
    path: null,
    //图片路径
    appealed:false,
    appealer:[]
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

      // if(this.data.img != null){
      //   util.base64src(this.data.img, res => {
      //     console.log(res)
      //     this.setData({
      //       path: res
      //     })
      //   })
      // }
      // if (this.data.finish_img != null) {
      //   console.log("inside if conf")
      //   util.base64src(this.data.finish_img, res => {
      //     console.log(res)
      //     this.setData({
      //       finish_img_path: res
      //     })
      //     console.log("finish_img_path = ", this.data.finish_img_path)
      //     console.log("finish_img = ", this.data.finish_img)
      //   })
      // }
    }
  
    if(options.appealed){
      this.setData({
        appealed: options.appealed
      })
      console.log("appealed = ", options.appealed)
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
    this.data.myContracts.push(this.data._id)
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
    db.collection('Accounts').where({
      _openid: app.globalData.openid
    }).update({
      data:{
      contract_Set:this.data.myContracts
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
    that.Close()
   },

  Retreat: async function() {
    console.log("people set" , this.data.peopleset)
    this.data.peopleset.splice(this.data.peopleset.indexOf(this.data.openid), 1)
   
    this.data.myContracts.splice(this.data.myContracts.indexOf(this.data._id), 1)
    console.log(this.data.myContracts)
    db.collection('Contracts').doc(this.data._id).update({
      data: {
        attenders: this.data.peopleset
      },
      success: res => {
        wx.showToast({
          title: '取消报名成功！',
        })
        console.log('取消报名成功!')
      },
      fail: err => {
        wx.showToast({
          title: '取消报名失败…',
        })
        console.log('取消报名失败：', err)
      }
    })
    db.collection('Accounts').where({
      _openid:app.globalData.openid
    }).update({
      data:{
        contract_Set:this.data.myContracts
      }
    })
    console.log(this.data.peopleset)
    console.log("取消报名成功")
    this.Close()
  },
  Cancel: async function() {
    db.collection('Accounts').where({
      _openid:app.globalData.openid
    }).get().then(res => {
      this.setData({
        tmp_contract_list: res.data[0].contract_Set
      })
      console.log(res)
      console.log("tmpcontract set: ", this.data.tmp_contract_list)
      console.log("this.data._id = ", this.data._id)
      console.log("The idx...:", this.data.tmp_contract_list.indexOf(this.data._id))
      this.data.tmp_contract_list.splice(this.data.tmp_contract_list.indexOf(this.data._id), 1)
      console.log("tmpcontract set: ",  this.data.tmp_contract_list)
      db.collection('Accounts').where({
        _openid:app.globalData.openid
      }).update({
        data: {
          contract_Set: this.data.tmp_contract_list
        }
      })
    })
    for (var peopleId of this.data.peopleset) {
      db.collection('Accounts').where({
        _openid:peopleId
      }).get().then(res => {
        this.setData({
          tmp_contract_list: res.data[0].contract_Set
        })
        console.log(res)
        console.log("tmpcontract set: ", this.data.tmp_contract_list)
        console.log("this.data._id = ", this.data._id)
        console.log("The idx...:", this.data.tmp_contract_list.indexOf(this.data._id))
        this.data.tmp_contract_list.splice(this.data.tmp_contract_list.indexOf(this.data._id), 1)
        console.log("tmpcontract set: ",  this.data.tmp_contract_list)
        db.collection('Accounts').where({
          _openid:peopleId
        }).update({
          data: {
            contract_Set: this.data.tmp_contract_list
          }
        })
      })
    }
    db.collection('Contracts').doc(this.data._id).remove({
      success:function(res) {
        wx.showToast({
          title: '终止活动成功！',
        })
        console.log('终止活动成功!')
      },
      fail: function(res) {
        wx.showToast({
          title: '终止活动失败！'
        })
        console.log('终止活动失败！')
      }
    })
    this.Close()
  },
  Report: async function() {
    console.log("navigating to report page", this.data._id)
    //var __id = this.data._id
    wx.navigateTo({
      url: '/pages/report/report?id='+this.data._id+'&title='+this.data.title
    })
  },
  bindChooseImage: function(e){
    var that = this
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res=>{
        that.setData({
          finish_img_path: res.tempFilePaths[0]
        })
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0],
          encoding: 'base64',
          success: res =>{
            //成功读取到文件的base64格式数据，加上图片头
            var img = 'data:image/png;base64,' + res.data
            console.log(img)
            that.setData({
              finish_img: img
            })
            this.setData({
              canUpload: false,
              hasUpload: true
            })
          }
        })
      }
    })
  },
  submitFinishImage: function() {
    db.collection('Contracts').doc(this.data._id).update({
      data: {
        finish_img:this.data.finish_img
      },
      success: function(res){
        console.log("上传成功")
        wx.showToast({
          title: '上传成功',
        })
      }
    })
    this.Close()
  }
})

