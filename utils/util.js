wx.cloud.init()
const db = wx.cloud.database()
const chainUtil = require("chain_access.js")
const app = getApp()

const fsm = wx.getFileSystemManager();
const FILE_BASE_NAME = 'tmp_base64src'; //自定义文件名

function base64src(base64data, file_base_name, cb) {
	//cb为回调函数
	const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
	console.log(format, bodyData)
	//分解base64图片头和数据
	if (!format) {
		console.log("Base64 parse error")
		return
	}
	const filePath = `${wx.env.USER_DATA_PATH}/${file_base_name}.${format}`;
	const buffer = wx.base64ToArrayBuffer(bodyData);
	console.log(filePath)
	fsm.writeFile({
		filePath,
		data: buffer,
		encoding: 'binary',
		success() {
			cb(filePath);
		},
		fail() {
			console.log("Base64 write error")
		},
	});
};

const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function getAccountInfo(openid, that) {
	if (openid === null) {
		console.log("openId unvalid")
		return null
	}
	console.log(openid)

	var accountDb = db.collection("Accounts")
	let data
	accountDb.where({
		openid: openid
	})
		.count().then(res => {
			//get num of results first
			console.log(res)

			if (res.total == 0) {
				//if no such account in database
				data = {
					contract_Set: [],
					handle_url: app.globalData.userInfo.avatarUrl,
					nickname: app.globalData.userInfo.nickName,
					openid: openid
				}
				db.collection("Accounts").add({
					data: data,
				})
					.then(res => {
						console.log(res)
					})
					.catch(console.error)
				that.accountInfo = data
			}
			else if (res.total == 1) {
				//correct, get account info
				accountDb.where({
					openid: openid
				})
					.get().then(res => {
						console.log(res)
						data = res.data
						that.accountInfo = data
					})
			}
			else {
				console.log("why so many results?")
			}
		})

	return data
}

//获取定位的后十条数据
function getList(that, offset, count) {
  var contractDb = db.collection("Contracts")
  /*
  contractDb.count().then(res => {
    console.log("contractNum = " + res.total)
    that.setData({
      contractNum: res.total
    })
    */
    //先获取总数再获取列表
    contractDb.skip(offset).limit(count).get().then(res => {
      console.log(res.data)
      var toAppend = []
      for(var i of res.data){
        toAppend.push({
          title: i.title,
          content: i.content,
          _id: i._id
        })
      }
      var newList = that.data.list.concat(toAppend)
      that.setData({
        list: newList
      })
    })
    /*
  })
  */
}

//获取所有申诉记录
function getAppeal(that) {
	var appealDb = db.collection("Appeals")
	appealDb.get().then(res => {
		console.log(res.data)
		that.setData({
			list: res.data
		})
	})
}

function getMyParticipate(that) {
	var myid = app.globalData.openid;
	var AccountDb = db.collection("Accounts")
	var contractDb = db.collection("Contracts")
	AccountDb.where({
		_openid: myid
	}).get().then(res => {
			var contract_set = res.data[0].contract_Set
			var ret_set = new Array()
			that.setData({
				list: ret_set
			})
			for (var contractId of contract_set){
				contractDb.doc(contractId).get().then(res => {
						ret_set.push(res.data)
						console.log(ret_set)
						that.setData({
							list: ret_set
						})
					})
			}
		})
}

function getMyCreate(that) {
	var myid = app.globalData.openid;
	var AccountDb = db.collection("Accounts")
	var contractDb = db.collection("Contracts")
	AccountDb.where({
		_openid: myid
	}).get().then(res => {
		var contract_set = res.data[0].create_contract_Set
		var ret_set = new Array()
		that.setData({
			list: ret_set
		})
		for (var contractId of contract_set) {
			contractDb.doc(contractId).get().then(res => {
				ret_set.push(res.data)
				console.log(ret_set)
				that.setData({
					list: ret_set
				})
			})
		}
	})
}

function getMyFinished(that){
	var myid = app.globalData.openid;
	var ret_set = new Array()
	that.setData({
		list: ret_set
	})
	var AccountDb = db.collection("Accounts")
	var contractDb = db.collection("Contracts")
	AccountDb.where({
		_openid: myid
	}).get().then(res => {
		var contract_set = res.data[0].create_contract_Set
		var ret_set = new Array()
		that.setData({
			list: ret_set
		})
		for (var contractId of contract_set) {
			contractDb.doc(contractId).get().then(res => {
				if (res.data.finish_img != null){
					ret_set.push(res.data)
					console.log(ret_set)
					that.setData({
						list: ret_set
					})
				}
			})
		}
	})
}

//获取协议总数
function getNum(that) {
	var contractDb = db.collection("Contracts")
	contractDb.count().then(res => {
		console.log("contractNum = "+ res.total)
		that.setData({
			contractNum: res.total
		})
	})
}

//通过id获取协议内容并更新页面
function getDataById(id, that) {
	that.setData({
		step: 2,
		_id: id
	})
	//分辨是否在链上
	db.collection('Accounts').where({
		_openid:app.globalData.openid
	}).get().then(async res => {
		that.setData({
			myContracts: res.data[0].contract_Set
		})

	})
	db.collection('Contracts').doc(that.data._id)
		.get().then(async res => {
			console.log(res)
			that.setData({
				title: res.data["title"],
				content: res.data["content"],
				peoplenumber: res.data["need_number"],
				peopleset: res.data["attenders"],
				_id: res.data["_id"],
				onChain: res.data["onChain"],
				hashId: res.data["HashId"],
				img: res.data["img"],
				finish_img: res.data["finish_img"]
			})
			if (res.data["_openid"] == app.globalData.openid){
				that.setData({
					canCancel:true
				})
			}
			if(res.data["onChain"] == true) {
				that.setData({
					isFinish: true
				})
				if (res.data["_openid"] == app.globalData.openid && res.data["finish_img"] == null) {
					that.setData({
						canUpload: true
					})
				}
			}
			//如果在链上，重新取
			if (that.data.onChain) {
				var json = await chainUtil.queryEvidence(that.data.hashId)
				var chainData = JSON.parse(json)
				that.setData({
					title: chainData.title,
					content: chainData.content,
					peoplenumber: chainData.need_number,
					peopleset: chainData.attenders,
					_id: chainData._id,
					img: chainData.img,
					canCancel:false
				})
				console.log("根据链上数据进行更新!")
			}
			//检查本人是否参加了
			var attendIndex = that.data.peopleset.indexOf(app.globalData.openid)
			console.log("attendIndex =  " + attendIndex)
			if (attendIndex > -1) {
				that.setData({
					canAttend: false,
					canRetreat: true,
					canReport: true,
					btnText: "已报名"
				})
				if (that.data.onChain) {
					that.setData({
						canRetreat: false
					})
				}
			}
			else {
				//检查是否人已满
				if (that.data.peoplenumber <= that.data.peopleset.length) {
					that.setData({
						canAttend: false,
						btnText: "人已满"
					})
				}
			}
			//转换img
			base64src(that.data.img, "tmp_base64src" , res => {
				that.setData({
					path: res
				})
				console.log("re1s = ", res)
				console.log("path = ", that.data.path)
			})
			base64src(that.data.finish_img, "tmp_finish_base64src", res => {
				that.setData({
					finish_img_path: res
				})
				console.log("res = ", res)
				console.log("finish path = ", that.data.finish_img_path)
			})
			
		})
}

module.exports = {
	formatTime: formatTime,
	getAccountInfo: getAccountInfo,
	getList: getList,
	getAppeal: getAppeal,
	getMyParticipate: getMyParticipate,
	getMyCreate: getMyCreate,
	getMyFinished: getMyFinished,
	getNum: getNum,
	getDataById: getDataById,
	base64src: base64src
}
