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
    util.getAll(this)
  },

  //对点击button的事件进行处理
  clickbutton: function (e) {
    console.log(e);
    wx.navigateTo({
      url: '/pages/display/display?id=' + e.currentTarget.id
    })
  },

  //上拉加载刷新
  pullDownRefresh: function () {
    console.log("上拉刷新")
    this.onLoad()
  },

  //切换栏目（暂未实现）
  clickmenu: function (e) {
    console.log(e)
  },

  onShareAppMessage: function (res) {
    if (res.from == 'button') {
      console.log(res.target)
      let contractId = res.target.dataset.contractId
      let id = res.target.dataset.id
      let list = this.data.list
      return {
        title: list[id].title,
        path: '/pages/display/display?id=' + contractId
      }
    }
  }
})

