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
    onShowGroup: "all",
    offset: 0,
    blocked: false
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
      reachBottom: false,
      offset: 0,
      blocked: false
    })

    var time = util.formatTime(new Date)
    this.setData({
      now_time: time
    })
    console.log(time);

    util.getNum(this)
    //获取前十个协议列表
    if(this.data.contractNum < 10){
      util.getList(this, this.data.offset, this.data.contractNum)
    }
    else{
      util.getList(this, this.data.offset, 10)
    }
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
    console.log("下拉刷新")
    this.onLoad()
  },

  //上滑加载剩余数据
  loadMore: function () {
    if(this.data.blocked){
      console.log("blocked! ")
      return
    }
    else{
      //阻塞已调用的方法重复执行
      this.setData({
        blocked: true
      })
      console.log(this.data.list.length + ":" + this.data.contractNum)
      if (this.data.list.length < this.data.contractNum) {
        console.log("上滑加载剩余数据")
        var left = this.data.contractNum - this.data.list.length
        if (left < 10) {
          util.getList(this, this.data.list.length, left)
        }
        else {
          util.getList(this, this.data.list.length, 10)
        }
      }
      else {
        console.log("已触底")
        console.log(this.data.list)
        this.setData({
          reachBottom: true
        })
      }
    }
  
  },

  //切换栏目
  clickmenu: function (e) {
    console.log(e)
    this.setData({
      onShowGroup: e.currentTarget.id
    })
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

