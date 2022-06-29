<template>
	<el-dialog
		:title="拒绝"
		:close-on-click-modal="false"
		v-model="visible"
		width="450px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="80px">
			<el-form-item label="备注" prop="remark">
				<el-input type="remark" v-model="dataForm.remark" size="medium" clearable />
			</el-form-item>
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
				id: null,
				remark:null
			}
		};
	},
	methods: {
		init: function(id) {
			let that = this;
			//如果id为null，说明是新增操作
			that.dataForm.id = id;
			that.visible = true;
			//加载列表数据的ajax请求放在下次dom更新来执行
			that.$nextTick(() => {
				that.$refs['dataForm'].resetFields();
			});
		},

		dataFormSubmit:function(){
			let that=this
			//先做表单校验
			that.$refs["dataForm"].validate(function(valid){
				if(valid){
					let data ={
						businessInfoId:that.dataForm.id,
						remark:that.dataForm.remark
					};
					that.$httpGet(`businessInfo/reject`,"POST",data,true,function(resp){
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
