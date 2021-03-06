const util = require("../../utils/util.js")

Page({
  //页面数据与全局数据同步
  //更新时，先刷新全局数据，再根据全局数据刷新页面数据
  data: {
    contractNum: 0,
    list: [],
    reachBottom: false,
    windowHeight: "",
    windowWidth: "",
    onShowGroup: "all"
  },

  //渲染前获取视图层信息
  onShow: function (e) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },

  toTop: function () {
    this.setData({
      scrollTop: 0,
    })
  },

  //onLoad函数
  onLoad: function () {
    this.setData({
      reachBottom: false
    })
    //获取所有协议列表
    var that = this
    util.getAppeal(that)
  },

  //对点击button的事件进行处理
  clickbutton: function (e) {
    console.log(e);
    wx.navigateTo({
      url: '/pages/report/report?appealId=' + e.currentTarget.id
    })
  },

  //下拉加载刷新
  onPullDownRefresh: function () {
    console.log("下拉刷新")
    wx.stopPullDownRefresh()
    this.onLoad()
  },

  onReachBottom: function () {
    console.log("下拉刷新")
    this.onLoad()
  },

})

