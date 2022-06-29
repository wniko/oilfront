<template>
	<el-dialog
		:title="!dataForm.id ? '新增' : '修改'"
		:close-on-click-modal="false"
		v-model="visible"
		width="450px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="80px">
			<el-form-item label="热点类型" prop="marketType" >
				<el-select
					v-model="dataForm.marketType"
					size="medium"
					placeholder="热点类型"
					style="width: 100%;"
					clearable
					value-key="id"
				>
					<el-option
						v-for="one in dataForm.marketTypeList"
						:key="one.code"
						:label="one.status"
						:value="one.code"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="标题" prop="warehouse" >
				<el-input type="warehouse" v-model="dataForm.warehouse" placeholder="标题" clearable />
			</el-form-item>
			<el-form-item label="副标题"  prop="depositRatio">
				<el-input type="depositRatio" v-model="dataForm.depositRatio" size="large" width="150px" clearable />
			</el-form-item>
			<el-form-item label="文字内容" prop="payment">
				<el-input type="remark" v-model="dataForm.remark" size="medium" clearable />
			</el-form-item>
			<!-- <el-form-item label="区域" prop="city"> -->
				<!-- <el-input type="city" v-model="dataForm.city" size="medium" clearable /> -->
				<!-- <el-select v-model="dataForm.city" class="input" placeholder="请选择区域" size="medium" clearable="clearable"> -->
                    <!-- 用roleList这个变量保存查询的结果，通过v-for输出到下拉列表中 -->
                    <!-- <el-option v-for="one in dataForm.cityList"  :value="one" /> -->
                <!-- </el-select> -->
			<!-- </el-form-item> -->
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
				marketType:null, // 报盘
				taxType:null,//含税/未含税
				dealType:null,  // 交易品种
				price:null,	 // 价格
				num:null,   //数量
				warehouse:null, // 仓库
				depositRatio:null,  //保证金比例
				payment:null,  // 付款期
				cargoType:null, // 现货/期货
				delivery:null,      // 提货期
				city:null, //长三角
				picture:null,// 多个图片名称用逗号分隔
				video:null,
				videoList:[],
				pictureList:[],
				cityList:["长三角","珠三角","环渤海"],
				marketTypeList:[{"code":0,"status":"企业价格"},{"code":1,"status":"产销率"},{"code":2,"status":"投标"}],
                taxTypeList:[{"code":0,"status":"未含税"},{"code":1,"status":"含税"}],
                cargoTypeList:[{"code":0,"status":"现货"},{"code":1,"status":"期货"}],
				remark:null
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
				marketType:[{ required: true, message: '没有指定热点类型' }], // 报盘
				// taxType:[{ required: true, message: '没有指定含税/未含税' }],//含税/未含税
				// dealType:[{ required: true, message: '没有指定交易品种' }],  // 交易品种
				// price:[{ required: true, message: '没有指定价格' }],	 // 价格
				// num:[{ required: true, message: '没有指定数量' }],   //数量
				warehouse:[{ required: true, message: '标题不得为空' }], // 仓库
				// depositRatio:[{ required: true, message: '没有指定保证金比例' }],  //保证金比例
				// payment:[{ required: true, message: '没有指定付款期' }],  // 付款期
				// cargoType:[{ required: true, message: '没有指定现货/期货' }], // 现货/期货
				// delivery:[{ required: true, message: '没有指定提货期' }],      // 提货期
				// city:[{ required: true, message: '没有指定区域' }], //长三角
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
					that.$httpGet('finishDeal/getFinishDeal', 'POST', { finishDealId: id }, true, function(resp) {
						that.dataForm.marketType= resp.data.marketType, // 报盘
						// that.dataForm.taxType= resp.data.taxType,//含税/未含税
						// that.dataForm.dealType= resp.data.dealType,  // 交易品种
						// that.dataForm.price= resp.data.price,	 // 价格		
						// that.dataForm.num = resp.data.num,   //数量
						that.dataForm.warehouse= resp.data.warehouse, // 仓库
						that.dataForm.depositRatio= resp.data.depositRatio,  //保证金比例
						// that.dataForm.payment= resp.data.payment,  // 付款期
						// that.dataForm.cargoType= resp.data.cargoType, // 现货/期货
						// that.dataForm.delivery= resp.data.delivery,      // 提货期
						// that.dataForm.city= resp.data.city, //长三角
						that.dataForm.remark = resp.data.remark,
						that.file = new Array()
						that.dataForm.pictureList =new Array()
						that.dataForm.videoList = new Array()
						if(resp.data.picture!=null && resp.data.picture != "") {
						  resp.data.picture.split(',').map(value=>{
							 that.dataForm.pictureList.push(value)
							 that.file.push({ name: value, url: that.$baseUrl+"img/"+ value});
						 }) 
						}
						// if(resp.data.video!=null && resp.data.video!=""){
						// 	that.dataForm.video=resp.data.video
						// 	that.dataForm.videoList.push({ name: resp.data.video, url: that.$baseUrl+"img/"+ resp.data.video})
						// 	that.videoForm.Video=that.$baseUrl + "img/" +resp.data.video
						// }
					});
				}
			});
		},
		dataFormSubmit:function(){
			let that=this
			//先做表单校验
			that.$refs["dataForm"].validate(function(valid){
				console.log(that.dataForm.pictureList)
				if(valid){
					let data = {
						id: that.dataForm.id == 0 ? null: that.dataForm.id,
						marketType:that.dataForm.marketType, // 报盘
						// taxType:that.dataForm.taxType,//含税/未含税
						// dealType:that.dataForm.dealType,  // 交易品种
						// price:that.dataForm.price,	 // 价格
						// num:that.dataForm.num,   //数量
						warehouse:that.dataForm.warehouse, // 仓库
						depositRatio:that.dataForm.depositRatio,  //保证金比例
						// payment:that.dataForm.payment,  // 付款期
						// cargoType:that.dataForm.cargoType, // 现货/期货
						// delivery:that.dataForm.delivery,      // 提货期
						// city:that.dataForm.city, //长三角
						remark:that.dataForm.remark,
						picture:that.dataForm.pictureList!=undefined?that.dataForm.pictureList.join(','):null// 多个图片名称用逗号分隔
					};
					
					that.$httpGet(`finishDeal/saveOrUpdate`,"POST",{data:JSON.stringify(data)},true,function(resp){
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
