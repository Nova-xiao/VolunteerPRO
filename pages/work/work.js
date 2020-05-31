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
      list: [],
      reachBottom: false
    })
    //获取前十个协议列表
    util.getList(this, 0)
  },

  //对点击button的事件进行处理
  clickbutton: function (e) {
    console.log(e);
    wx.navigateTo({
      url: '/pages/check/check?_id=' + e.currentTarget.id
    })
  },

  //下拉刷新
  onPullDownRefresh: function() {
    this.onLoad()
  },

  //上滑加载剩余数据
  loadMore: function () {
    console.log(this.data.list.length +":"+ this.data.contractNum)
    if(this.data.list.length < this.data.contractNum){
      console.log("上滑加载剩余数据")
      util.getList(this, this.data.list.length)
    }
    else{
      console.log("已触底")
      console.log(this.data.list)
      this.setData({
        reachBottom: true
      })
    }
    
  },

  //切换栏目（暂未实现）
  clickmenu: function (e) {
    console.log(e)
  },

  //分享按钮
  onShareAppMessage: function (res) {
    if (res.from == 'button') {
      console.log(res.target)
      let _id = res.target.dataset._id
      let id = res.target.dataset.id
      let list = this.data.list
      return {
        title: list[id].title,
        path: '/pages/check/check?_id=' + _id
      }
    }
  }
})

