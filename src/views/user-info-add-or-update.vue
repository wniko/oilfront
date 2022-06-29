<template>
	<el-dialog
		:title="!dataForm.id ? '新增' : '修改'"
		:close-on-click-modal="false"
		v-model="visible"
		width="450px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="80px">
			  <!-- <el-form-item label="用户名" prop="role">
				<el-select
    				v-model="dataForm.account"
					filterable
					remote
					reserve-keyword
					placeholder="选择用户"
					:remote-method="remoteMethod"
					:loading="loading"
					style="width: 100%;"
					:disabled= true
				>
					<el-option
					v-for="item in roleList"
					:key="item.id"
					:label="item.userName"
					:value="item.id"
					/>
				</el-select>
			</el-form-item> -->
			<el-form-item label="昵称" prop="nickname" >
				<el-input type="nickname" v-model="dataForm.nickname" size="medium" disabled="true"  clearable />
			</el-form-item>
			<el-form-item label="姓名" prop="name">
				<el-input type="name" v-model="dataForm.name" size="medium" clearable />
			</el-form-item>
			<el-form-item label="手机号" prop="phone">
				<el-input type="phone" v-model="dataForm.phone" size="medium" clearable />
			</el-form-item>
			
			<el-upload
			ref="upload"
			:action="url"
			list-type="picture"
			accept=".jpg,.jpeg,.png"
			with-credentials="true"
			:limit="1"
			:before-upload="beforeUploadHandle"
			:on-success="frontIdCardSuccessHandle"
			:on-remove="removeHandle"
			:file-list="file"
			
		>
			<i class="el-icon-plus"></i>
			上传身份证正面
		</el-upload>
		<el-upload
			ref="upload"
			:action="url"
			list-type="picture"
			accept=".jpg,.jpeg,.png"
			with-credentials="true"
			:limit="1"
			:before-upload="beforeUploadHandle"
			:on-success="backIdCardSuccessHandles"
			:on-remove="removeHandle"
			:file-list="fileback"
			
		>
			<i class="el-icon-plus"></i>
			上传身份证背面
		</el-upload>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button  size="medium" @click="review(userInfoId)" >审核</el-button>
				<el-button  size="medium" @click="reject(userInfoId)">拒绝</el-button>
				<el-button size="medium" @click="visible = false">取消</el-button>
				<el-button type="primary" size="medium" @click="dataFormSubmit">修改</el-button>
			</span>
		</template>
	</el-dialog>
	<user-info-remark v-if="addRemarkVisible" ref="userInfoRemark" @refreshDataList="loadDataList"></user-info-remark>
</template>

<script>
import dayjs from 'dayjs';
import UserInfoRemark from './user-info-remark.vue';

export default {
	components: {
        UserInfoRemark
    },
	data: function() {
		return {
			visible: false, //是否显示弹窗
			dataForm: {
				id: null,
				account:null,
				// nickname: null,
				name: null,
				phone: null,
				frontIdCard: null,
				backIdCard:null
			},
			url: this.$baseUrl + 'upload/uploadFile',
			roleList: [], //角色下拉列表
			deptList: [], //
			file:[],
			fileback:[],
			//验证规则
			dataRule: {	
				account: [{ required: true, message: '没有指定用户' }]
			},
			accountId:null,
			userInfoId:null,
			addRemarkVisible:false
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
				that.file = []
				that.fileback =[] 
				that.userInfoId=null
				// that.$http('auth/role/getAllRole', 'GET', null, true, function(resp) {
                // 	that.roleList = resp.data;
            	// });
				//用id来判断是新增还是修改
				if (that.dataForm.id) {
					that.$httpGet('userInfo/getUserInfoById', 'POST', { id: id }, true, function(resp) {
						//给变量赋值
						that.userInfoId = resp.data.id,
						that.dataForm.account=resp.data.userName,
						that.dataForm.accountId = resp.data.accountId,
						that.dataForm.nickname = resp.data.nickname,
						that.dataForm.name= resp.data.name,
						that.dataForm.phone= resp.data.phone
						that.dataForm.frontIdCard= resp.data.frontIdCard,
						that.dataForm.backIdCard=resp.data.backIdCard
						if(resp.data.frontIdCard!=null){
								 that.file.push({ name: resp.data.frontIdCard, url: that.$baseUrl+"img/"+ resp.data.frontIdCard});
						}
						if(resp.data.backIdCard!=null){
								that.fileback.push({ name: resp.data.backIdCard, url: that.$baseUrl+"img/"+ resp.data.backIdCard});
						}
					});
				}
			});
		},
		remoteMethod:function(value){
			let that = this;
			that.$httpGet(`auth/account/getByUserName`,"GET",{userName:value},true,function(resp){
				 that.roleList = resp.data;
			});
		},
		loadDataList: function() {
			let that=this
				that.visible=false
				//调用父组件（用户管理页面）的方法，做数据的刷新
				that.$emit('refreshDataList');
		},
		dataFormSubmit:function(){
			let that=this
			//先做表单校验
			that.$refs["dataForm"].validate(function(valid){
				if(valid){
					let data = {
						id: that.dataForm.id == 0 ? null: that.userInfoId,
						
						accountId:that.dataForm.accountId ==null ?that.dataForm.account : that.dataForm.accountId,
						// nickname: that.dataForm.nickname,
						name: that.dataForm.name,
						phone: that.dataForm.phone,
						frontIdCard: that.dataForm.frontIdCard,
						backIdCard:that.dataForm.backIdCard
					};
					that.$http(`userInfo/${!that.dataForm.id?'saveUserInfo':'updateUserInfo'}`,"POST",data,true,function(resp){
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
		frontIdCardSuccessHandle: function(resp, file, fileList) {
			
			this.dataForm.frontIdCard = resp.data;	
		},
		backIdCardSuccessHandles: function(resp, file, fileList) {
			this.dataForm.backIdCard = resp.data;	
		},
		removeHandle: function(file, fileList) {
			let that = this;
			that.$httpGet('upload/deleteFile', 'POST', { fileName: file.response.data }, true, function(resp) {
				delete that.pic;
			});
		},
		//审核
        review: function(id){
            let that = this;
            let ids = id
                ? id: that.dataListSelections.map(item => {
                    //完整用户记录中的主建id
                      return item.id;
                  });
            if (ids.length == 0) {
                that.$message({
                    message: '没有选中记录',
                    type: 'warning',
                    duration: 1200
                });
            }else {
                that.$confirm('确定要审核选中的记录？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    that.$httpGet('userInfo/review', 'GET', { userInfoId: ids }, true, function(resp) {
                        if (resp.success) {
                            that.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1200
                            });
                            that.visible=false
							//调用父组件（用户管理页面）的方法，做数据的刷新
							that.$emit('refreshDataList');
                        } else {
                            that.$message({
                                message: '未能审核记录',
                                type: 'warning',
                                duration: 1200
                            });
                        }
                    });
                });
            }
        },
		reject:function(id){
            this.addRemarkVisible=true;
            //调用addOrUpdate的init函数，传入的是空值，代表是添加操作
            this.$nextTick(() => {
                this.$refs.userInfoRemark.init(id);
            });
        },
	}
};
</script>

<style lang="less" scoped="scoped">
</style>
