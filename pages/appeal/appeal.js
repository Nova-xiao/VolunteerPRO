// pages/appeal/appeal.js
const tool = require("../../utils/taas_api.js");



Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var hash = await tool.mysave("hahhah");
    console.log(hash);
    var res = await tool.mycheck(hash);
    console.log(res);
    var data = res.data;
    var text = data.text || null;
    var type = data.type || null;
    data = data.data || null;
    this.setData({data, text, type});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})