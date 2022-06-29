	
<template>
	<el-dialog
		:title="参与的用户"
		:close-on-click-modal="false"
		v-model="visible"
		width="450px"
	>

		<el-table 
            :data="dataList"
            border
            cell-style="padding: 4px 0"
            style="width: 100%;"
            size="medium"
        >
		<el-table-column prop="nickname" header-align="center" align="center" min-width="150" label="昵称" />
		<el-table-column prop="tel" header-align="center" align="center" min-width="150" label="手机号" />
		</el-table>
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
			dataList: []
		};
	},
	methods: {
		
		init: function(obj) {
			let that = this;
			//如果id为null，说明是新增操作
			console.log(obj)
			that.dataList = obj;
			that.visible = true;
			//加载列表数据的ajax请求放在下次dom更新来执行
			// that.$nextTick(() => {
			// 	that.$refs['dataForm'].resetFields();
			// });
		},
		

		dataFormSubmit:function(){
			let that=this
			//先做表单校验
			that.$refs["dataForm"].validate(function(valid){
				if(valid){
					let data ={
						userInfoId:that.dataForm.id,
						remark:that.dataForm.remark
					};
					that.$httpGet(`userInfo/reject`,"POST",data,true,function(resp){
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
		}
	}
};
</script>

<style lang="less" scoped="scoped">
</style>
