<template>
	<el-dialog
		:title="!dataForm.id ? '新增' : '修改'"
		:close-on-click-modal="false"
		v-model="visible"
		width="450px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="80px">
			<el-form-item label="用户名" prop="username">
				<el-input v-model="dataForm.username" size="medium" clearable />
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<el-input type="password" v-model="dataForm.password" size="medium" clearable />
			</el-form-item>
			
			<el-form-item label="角色" prop="role">
				<el-select
					v-model="dataForm.role"
					size="medium"
					placeholder="选择角色"
					style="width: 100%;"
					clearable
				>
					<el-option
						v-for="one in roleList"
						:key="one.id"
						:label="one.name"
						:value="one.id"
						:disabled="one.roleName == '管理员'"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="备注" prop="remark">
				<el-input v-model="dataForm.remark" size="medium" clearable />
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
				username: null,
				password: null,
				remark: null,
				role: null,
				status: 1
			},
			roleList: [], //角色下拉列表
			deptList: [], //
			//验证规则
			dataRule: {
				username: [{ required: true, pattern: '^[a-zA-Z0-9]{5,20}$', message: '用户名格式错误' }],
				password: [{ required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误' }],		
				role: [{ required: true, message: '角色不能为空' }],
				status: [{ required: true, message: '状态不能为空' }]
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
			
				// that.$http('auth/role/getAllRole', 'GET', null, true, function(resp) {
                // 	that.roleList = resp.data;
            	// });
				//用id来判断是新增还是修改
				if (that.dataForm.id) {
					that.$httpGet('auth/account/getById', 'POST', { id: id }, true, function(resp) {
						console.log(resp)
						//给变量赋值
						that.dataForm.username = resp.data.userName;
						that.dataForm.password = resp.data.passWord;
						// that.dataForm.name = resp.name;
						that.dataForm.role = resp.data.roleId;
						that.dataForm.remark = resp.remark;
						// that.dataForm.status = resp.status;
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
						userName: that.dataForm.username,
						passWord: that.dataForm.password,
						roleId: that.dataForm.role,
						remark: that.dataForm.remark,
						// status: that.dataForm.status
					};
					that.$http(`auth/account/${!that.dataForm.id?'save':'update'}`,"POST",data,true,function(resp){
						if(resp.data==1){
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
