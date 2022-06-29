<template>
		<el-dialog title="新增" width="1000px" :close-on-click-modal="false" v-model="visible" :show-close="false">
		<el-upload class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleVideoSuccess"
          :on-progress="uploadVideoProcess"
          :before-upload="beforeUploadVideo"
          >
         <video v-if="videoForm.Video !='' && videoFlag == false" :src="videoForm.Video" class="avatar"  width="320" height="240" controls="controls">
			 您的浏览器不支持视频播放</video>
         <i v-else-if="videoForm.Video =='' && videoFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
		<!-- 进度条 -->
          <el-progress v-if="videoFlag == true" type="circle" :percentage="videoUploadPercent" style="margin-top:30px;"></el-progress>
          视频
        </el-upload>
	</el-dialog>
</template>

<script>

export default {
	data: function() {
		return {
			visible: false,
			// url: this.$baseUrl + 'upload/uploadFile',
			taskId: '',
			picList: {},
			pic:'',
			disableBtn: false,
			btn: '确定',
			description: '',
			videoForm:{
          		Video:'',
          		videoUploadPercent:'',
          		videoUploadId:'',
        	},
        videoFlag:false,
		uploadUrl: this.$baseUrl + 'upload/uploadFile', //你要上传视频到你后台的地址
		};
	},
	methods: {
		init: function(id) {
			let that = this;
			that.visible = true;
			that.taskId = id;
			that.description = description
			that.btn = '执行归档';
			that.disableBtn = false;
			// that.$nextTick(() => {
			// 	that.$refs['upload'].clearFiles();
			// });
		},

		aaa: function() {
			let that = this;
			that.visible = true;
			that.taskId = id;
			that.description = description
			that.btn = '执行归档';
			that.disableBtn = false;
			// that.$nextTick(() => {
			// 	that.$refs['upload'].clearFiles();
			// });
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
      },
		successHandle: function(resp, file, fileList) {
			this.pic = resp.data;	
		},
		successHandles: function(resp, file, fileList) {
			this.pic = resp.data;	
		},
		removeHandle: function(file, fileList) {
			let that = this;
			let url = file.response.data;
			let path = this.picList[url];
			that.$httpGet('upload/deleteFile', 'POST', { fileName: file.response.data }, true, function(resp) {
				delete that.pic;
			});
		},
		cancel: function() {
			let that = this;
			if (Object.keys(that.pic).length > 0) {
				that.$httpGet('upload/deleteFile', 'POST', { fileName: that.pic }, true, function(resp) {
					delete that.pic;
				});
			}
			that.visible = false;
			// that.$refs['upload'].clearFiles();
		},
		archive:function(){
			let that=this
			that.btn="正在归档"
			that.disableBtn=true
			if(Object.keys(that.pic).length == 0){
				that.$message({
					message: '没有上传图片',
					type: 'error',
					duration: 1200,
				});
				return;
			}
			
			let data={
				taskId:that.taskId,
				path:that.pic
			}
			if(that.description == '正面'){
				that.$httpGet("approval/archiveTask","POST",data,true,function(resp){
				that.$message({
					message: '操作成功',
					type: 'success',
					duration: 1200,
				});
				that.visible=false
				that.$emit('refreshDataList');
			})
			}else{

			}
			
		},
		
	}
	
};
</script>

<style lang="less"></style>
