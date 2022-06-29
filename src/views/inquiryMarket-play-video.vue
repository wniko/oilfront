	
<template>
	<el-dialog
		:title="播放视频"
		:close-on-click-modal="false"
		v-model="visible"
		:before-close="close"
		width="350px"
		ref="videoForm"
	>
            <video ref="sss" id="video" :src="videoForm.Video" class="avatar"  width="320" height="240" autoplay  controls="controls">
			 您的浏览器不支持视频播放</video> 
	</el-dialog>
</template>

<script>
import dayjs from 'dayjs';
export default {
	data: function() {
		return {
			visible: false, //是否显示弹窗
			dataForm: {
				id: null,
				remark:null
			},
			videoForm:{
          		Video:'',
          		videoUploadPercent:'',
          		videoUploadId:'',
        	},
		};
	},
	methods: {
		init: function(obj) {
			let that = this;
			that.videoForm.Video = this.$baseUrl +"img/"+obj;
			that.visible = true;
		},
		close(){
				this.videoForm = {
          		Video:'',
          		videoUploadPercent:'',
          		videoUploadId:'',
        	},
			this.visible = false
		}
	}
};
</script>

<style lang="less" scoped="scoped">
</style>
