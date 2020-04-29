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

  /*
  onLoad: function (options) {
    const kp = {
      privateKey: '82a09e0ae57d75faee3e940e0506c90fece35883124806c2247803fcd550d151',
      publicKey: '0454e60b7aaad4eb600fd517c6d1fd2af9be3b57c34294d084bd2a45bfc00debe42ae0a5e9450081241e399ca5cab63491323ca625b04c73a9421c43093d7a8ac8',
      credential: '54f2ee6c01842b5e443022c5ae56beca4bab1892'
    }
    const db = wx.cloud.database()
    const mydocid = 'f149f6775ea109b7000083a368be57a4'
    // db.collection('Contracts').doc(mydocid).get({
    //   success: function(res) {
    //     // res.data 包含该记录的数据
    //     console.log(res.data)
    //     blockchain.store(res.data)
    //     console.log("retrun")
    //   }
    // })
    db.collection('Contracts').doc(mydocid).update({
      data: {
        onChain: true
      },
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res)
        console.log("retrun")
      }
    })

    const a = db.collection('Contracts').doc(mydocid).get({
      success: function (res) {
        console.log(res.data)
      }
    })


  },
  */

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