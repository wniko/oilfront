<template>
	<el-dialog
		:title="!dataForm.id ? '新增' : '修改'"
		:close-on-click-modal="false"
		v-model="visible"
		width="500px"
	>
		<el-form :model="dataForm" ref="dataForm"  label-width="80px">
			<el-form-item label="昵称" prop="nickname" >
				<el-input type="nickname" v-model="dataForm.nickname" size="medium" disabled="true"  clearable />
			</el-form-item>
			<el-form-item label="公司名称" prop="businessName">
				<el-input type="businessName" v-model="dataForm.businessName" size="medium" clearable />
			</el-form-item>
			<el-form-item label="联系人" prop="businessLinkman">
				<el-input type="businessLinkman" v-model="dataForm.businessLinkman" size="medium" clearable />
			</el-form-item>
			<el-form-item label="联系号码" prop="phone">
				<el-input type="phone" v-model="dataForm.phone" size="medium" clearable />
			</el-form-item>
			<el-form-item label="公司地址" prop="businessAddress">
				<el-input type="businessAddress" v-model="dataForm.businessAddress" size="medium" clearable />
			</el-form-item>
			<el-upload
			ref="upload"
			:action="url"
			list-type="picture"
			accept=".jpg,.jpeg,.png"
			with-credentials="true"
			:limit="1"
			:before-upload="beforeUploadHandle"
			:on-success="businessPictureSuccessHandle"
			:on-remove="removeHandle"
			:file-list="file"
		>
			<i class="el-icon-plus"></i>
			上传营业执照
		</el-upload>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button  size="medium" @click="review(businessInfoId)">审核</el-button>
				<el-button  size="medium" @click="reject(businessInfoId)">拒绝</el-button>
				<el-button size="medium" @click="visible = false">取消</el-button>
				<el-button type="primary" size="medium" @click="dataFormSubmit">确定</el-button>
			</span>
		</template>
	</el-dialog>
	<business-info-remark v-if="addRemarkVisible" ref="businessInfoRemark" @refreshDataList="loadDataList"></business-info-remark>
</template>

<script>
import dayjs from 'dayjs';
import businessInfoRemark from './businessInfo-remark.vue';
import router from '../router/index.js';
export default {
	components: {
        businessInfoRemark
    },
	data: function() {
		return {
			visible: false, //是否显示弹窗
			dataForm: {
				id: null,
				nickname: null,
				businessName: null,
				businessLinkman: null,
				phone:null,
				businessAddress:null,
				businessPicture: null,
				accountid:null
			},
			url: this.$baseUrl + 'upload/uploadFile',
			roleList: [], //角色下拉列表
			deptList: [], //
			file:[],
			fileback:[],
			accountId:null,
			businessInfoId:null,
			addRemarkVisible: false
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
				that.businessInfoId=null
				//用id来判断是新增还是修改
				if (that.dataForm.id) {
					that.$httpGet('businessInfo/getBusinessInfo', 'POST', { accountId:that.dataForm.id}, true, function(resp) {
						//给变量赋值
						that.businessInfoId = resp.data.id,
						that.dataForm.nickname= resp.data.nickname,
						that.dataForm.businessName= resp.data.businessName,
						that.dataForm.businessLinkman= resp.data.businessLinkman
						that.dataForm.phone= resp.data.phone,
						that.dataForm.businessAddress=resp.data.businessAddress,
						that.dataForm.accountid= resp.data.accountid
						if(resp.data.businessPicture!=null){
								 that.file.push({ name: resp.data.businessPicture, url: that.$baseUrl+"img/"+ resp.data.businessPicture});
						}
					});
				}
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
						id: that.dataForm.id == 0 ? null: that.businessInfoId,
						businessName: that.dataForm.businessName,
						businessLinkman: that.dataForm.businessLinkman,
						phone: that.dataForm.phone,
						businessPicture: that.dataForm.businessPicture,
						businessAddress:that.dataForm.businessAddress,
						accountid:that.dataForm.accountid
					};
					that.$http(`businessInfo/${!that.dataForm.id?'saveUserInfo':'updateBusinessInfo'}`,"POST",data,true,function(resp){
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
		businessPictureSuccessHandle: function(resp, file, fileList) {
			this.dataForm.businessPicture = resp.data;	
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
                    that.$httpGet('businessInfo/review', 'GET', { businessInfoId: ids }, true, function(resp) {
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
                this.$refs.businessInfoRemark.init(id);
            });
			
        },
	}
};
</script>

<style lang="less" scoped="scoped">
</style>
