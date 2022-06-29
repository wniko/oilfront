<template>
	<el-dialog
		:title="!dataForm.id ? '新增' : '修改'"
		:close-on-click-modal="false"
		v-model="visible"
		width="450px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="80px">
			<el-form-item label="标题" prop="title" >
				<el-input type="title" v-model="dataForm.title" size="medium"   clearable />
			</el-form-item>
			<el-form-item label="意向价" prop="intentionPrice" >
				<el-input type="intentionPrice" v-model="dataForm.intentionPrice" size="medium"   clearable />
			</el-form-item>
			<el-form-item label="总采购量" prop="totalPurchaseNum" >
				<el-input type="totalPurchaseNum" v-model="dataForm.totalPurchaseNum" size="medium"  clearable />
			</el-form-item>
			<el-form-item label="仓库" prop="warehouse" >
				<el-input type="warehouse" v-model="dataForm.warehouse" size="medium"  placeholder="多个仓库已逗号分隔"  clearable />
			</el-form-item>
			<el-form-item label="保证金" prop="depositRatio" >
				<el-input type="depositRatio" v-model="dataForm.depositRatio" size="large" width="150px" clearable />
			</el-form-item>
			<el-form-item label="交货时间" prop="deliveryTime">
				<el-date-picker v-model="dataForm.deliveryTime" type="date" placeholder="交货时间" />
			</el-form-item>
			<el-form-item label="提货方式" prop="deliveryWay">
				<el-input type="deliveryWay" v-model="dataForm.deliveryWay" size="medium" clearable />
			</el-form-item>
			<el-form-item label="付款期" prop="payment">
				<el-input type="payment" v-model="dataForm.payment" size="medium" clearable />
			</el-form-item>
			<el-form-item label="提货期" prop="delivery">
				<el-input type="delivery" v-model="dataForm.delivery" size="medium" clearable />
			</el-form-item>
			<el-form-item label="地区" prop="delivery">
				<!-- <el-input type="city" v-model="dataForm.city" size="medium" clearable /> -->
				<el-select v-model="dataForm.city" class="input" placeholder="请选择地区" size="medium" clearable="clearable">
                    <!-- 用roleList这个变量保存查询的结果，通过v-for输出到下拉列表中 -->
                    <el-option v-for="one in dataForm.cityList"  :value="one" />
                </el-select>
			</el-form-item>
			<el-upload
			ref="upload"
			:action="url"
			list-type="picture"
			accept=".jpg,.jpeg,.png"
			with-credentials="true"
			:before-upload="beforeUploadHandle"
			:on-success="picSuccessHandle"
			:on-remove="removeHandle"
			:file-list="file"
			
		>
			<i class="el-icon-plus"></i>
			图片
		</el-upload>
		<el-upload class="avatar-uploader"
          :action="url"
          :show-file-list="true"
          :on-success="handleVideoSuccess"
          :on-progress="uploadVideoProcess"
          :before-upload="beforeUploadVideo"
		  :on-remove="removeVideo"
		  :file-list="dataForm.videoList"
          >
		<span style="float:left">
			<i class="el-icon-plus"/>
				视频
		</span>
         <video v-if="videoForm.Video !=''" :src="videoForm.Video" class="avatar"  width="320" height="240" controls="controls">
			 您的浏览器不支持视频播放</video>
         <!-- <i v-else-if="videoForm.Video ==''" class="el-icon-plus avatar-uploader-icon"></i> -->
		<!-- 进度条 -->
          <el-progress v-if="videoFlag == true" type="circle" :percentage="videoUploadPercent" style="margin-top:30px;"></el-progress>
        </el-upload>

		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button size="medium" @click="visible = false">取消</el-button>
				<el-button type="primary" size="medium" @click="dataFormSubmit">确定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script>
import dayjs from 'dayjs';
export default {
	data: function() {
		return {
			visible: false, //是否显示弹窗
			dataForm: {
				title:null, // 标题
				intentionPrice:null,//意向价
				totalPurchaseNum:null,  // 总采购量
				warehouse:null,	 // 仓库
				depositRatio:null, // 保证金比例
				deliveryTime:null,  //交货时间
				deliveryWay:null, // 提货方式
				payment:null,      // 付款期
				delivery:null,    // 提货期
				city:null, //长三角
				picture:null,// 多个图片名称用逗号分隔
				video:null,
				videoList:[],
				pictureList:[],
				cityList:["长三角","珠三角","环渤海"]
			},
			videoForm:{
				Video:'',
          		videoUploadPercent:'',
          		videoUploadId:'',
				videoName:''
        	},
			url: this.$baseUrl + 'upload/uploadFile',
			deptList: [], //
			file:[],
			fileback:[],
			//验证规则
			dataRule: {	
				title: [{ required: true, message: '没有输入标题' }],
				intentionPrice: [{ required: true, message: '没有输入意向价' }],
				totalPurchaseNum: [{ required: true, message: '没有指定总采购量' }],
				warehouse: [{ required: true, message: '没有指定仓库' }],
				depositRatio: [{ required: true, message: '没有指定保证金比例' }],
				deliveryWay: [{ required: true, message: '没有指定提货方式' }],
				deliveryTime: [{ required: true, message: '没有指定交货时间' }],
				payment: [{ required: true, message: '没有指定付款期' }],
				delivery: [{ required: true, message: '没有指定提货期' }],
				city: [{ required: true, message: '没有指定城市' }]
			}
		};
	},
	methods: {
		init: function(id) {
			let that = this;
			//如果id为null，说明是新增操作
			that.dataForm.id = id || 0;
			that.visible = true;
			//加载列表数据的ajax请求放在下次dom更新来执行
			that.$nextTick(() => {
				//把datafrom的数据复位，
				//dataForm这个就是再上面ref设置了
				that.$refs['dataForm'].resetFields();
				that.videoForm.Video = ''
				that.file = undefined
				that.dataForm.pictureList = undefined
				that.dataForm.videoList  = undefined
				//用id来判断是新增还是修改
				if (that.dataForm.id) {
					that.$httpGet('inquiryMarket/getInquiryMarketInfo', 'POST', { inquiryMarketId: id }, true, function(resp) {
						that.dataForm.title = resp.data.title,
						that.dataForm.intentionPrice= resp.data.intentionPrice,//意向价
						that.dataForm.totalPurchaseNum= resp.data.totalPurchaseNum,  // 总采购量
						that.dataForm.warehouse = resp.data.warehouse,	 // 仓库
						that.dataForm.depositRatio= resp.data.depositRatio, // 保证金比例
						that.dataForm.deliveryTime= resp.data.deliveryTime,  // 交货时间
						that.dataForm.deliveryWay= resp.data.deliveryWay,   //提货方式
						that.dataForm.payment= resp.data.payment,      // 付款期
						that.dataForm.delivery= resp.data.delivery,    // 提货期
						that.dataForm.city= resp.data.city //长三角
						that.file = new Array()
						that.dataForm.pictureList =new Array()
						that.dataForm.videoList = new Array()
						if(resp.data.picture!=null && resp.data.picture != "") {
						  resp.data.picture.split(',').map(value=>{
							 that.dataForm.pictureList.push(value)
							 that.file.push({ name: value, url: that.$baseUrl+"img/"+ value});
						 }) 
						}
						if(resp.data.video!=null && resp.data.video!=""){
							that.dataForm.video=resp.data.video
							that.dataForm.videoList.push({ name: resp.data.video, url: that.$baseUrl+"img/"+ resp.data.video})
							that.videoForm.Video=that.$baseUrl + "img/" +resp.data.video
						}
					});
				}
			});
		},
		dataFormSubmit:function(){
			let that=this
			//先做表单校验
			that.$refs["dataForm"].validate(function(valid){
				if(valid){
					let data = {
						id: that.dataForm.id == 0 ? null: that.dataForm.id,
						title:that.dataForm.title,
						intentionPrice:that.dataForm.intentionPrice,//意向价
						totalPurchaseNum:that.dataForm.totalPurchaseNum,  // 总采购量
						warehouse:that.dataForm.warehouse,	 // 仓库
						depositRatio:that.dataForm.depositRatio, // 保证金比例
						deliveryTime:that.dataForm.deliveryTime,  // 交货时间
						deliveryWay:that.dataForm.deliveryWay,    //提货方式
						payment:that.dataForm.payment,      // 付款期
						delivery:that.dataForm.delivery,    // 提货期
						city:that.dataForm.city, //长三角
						picture:that.dataForm.pictureList!=undefined?that.dataForm.pictureList.join(','):null,// 多个图片名称用逗号分隔,
						video:that.dataForm.video
					};
					
					that.$httpGet(`inquiryMarket/${!that.dataForm.id?'publish':'updateInquiryMarket'}`,"POST",{data:JSON.stringify(data)},true,function(resp){
						if(resp.success){
							that.$message({
								message: '操作成功',
								type: 'success',
								duration: 1200
							});
							that.visible=false
							//调用父组件（用户管理页面）的方法，做数据的刷新
							that.$emit('refreshDataList');
						}
						else{
							that.$message({
								message: '操作失败',
								type: 'error',
								duration: 1200
							});
						}
					});
				}
			})
		},
		beforeUploadHandle: function(file) {
			if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
				this.$message.error('只支持jpg、png格式的图片！');
				return false;
			}
			return true;
		},
		picSuccessHandle: function(resp, file, fileList) {
			if(this.dataForm.pictureList == null) {
				this.dataForm.pictureList = new Array()
			}
			this.dataForm.pictureList.push(resp.data);	
		},
		removeHandle: function(file, fileList) {
			let that = this;
			that.$httpGet('upload/deleteFile', 'POST', { fileName: file.name }, true, function(resp) {
				for (let i=0; i<that.dataForm.pictureList.length; i++){
					if (that.dataForm.pictureList[i] == file.name){
						that.dataForm.pictureList.splice(i, 1)
					}
				}
			});
		},
		removeVideo:function(file, fileList){
			let that = this;
			that.$httpGet('upload/deleteFile', 'POST', { fileName: file.response==undefined ? file.name : file.response.data }, true, function(resp) {
				that.videoForm.Video=''
				that.dataForm.video=''
				that.dataForm.videoList=undefined
			});
		},
		uploadVideoProcess(event, file, fileList){
          this.videoFlag = true;
          this.videoUploadPercent = parseInt(file.percentage.toFixed(0))
      },
 
      beforeUploadVideo(file) {
          const isLt10M = file.size / 1024 / 1024  < 10;
          if (['video/mp4', 'video/ogg', 'video/flv','video/avi','video/wmv','video/rmvb'].indexOf(file.type) == -1) {
              this.$message.error('请上传正确的视频格式');
              return false;
          }
          if (!isLt10M) {
              this.$message.error('上传视频大小不能超过10MB哦!');
              return false;
          }
	  },
      //上传成功方法
      handleVideoSuccess(res, file) {
          this.videoFlag = false;
          this.videoUploadPercent = 0;
          this.videoForm.videoUploadId = res.filename
          this.videoForm.Video = this.$baseUrl +"img/"+res.data;
		  this.dataForm.video = res.data
      },
	}
};
</script>

<style lang="less" scoped="scoped">
</style>
