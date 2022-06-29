<template>
    <div>
        <!-- 检索的条件 -->
        <!--rules 验证规则 -->
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm">
        
            <el-form-item prop="nickname">
                <!-- 文本框 -->
                <!-- 输入的内容保存再dataForm -->
                <el-input
                    v-model="dataForm.nickname"
                    placeholder="昵称"
                    size="medium"
                    class="input"
                    clearable="clearable"
                />
            </el-form-item>
            
            
            <!-- 查询的按钮 -->
            <el-form-item>
                <el-button size="medium" type="primary" @click="searchHandle()">查询</el-button> 
            </el-form-item>
        </el-form>
        <!--主题页面是表格，数据从dataList获取
        border  加边框
            v-loading="dataListLoading" 是否显示滚动的进度条
            @selection-change="selectionChangeHandle"选中事件的回调函数
        -->
        <el-table 
            :data="dataList"
            border
            v-loading="dataListLoading"
            @selection-change="selectionChangeHandle"
            cell-style="padding: 4px 0"
            style="width: 100%;"
            size="medium"
        >
        <!-- 复选框 -->
            <el-table-column type="selection" header-align="center" align="center" width="50" />
            <!-- 数据的序号 -->
            <el-table-column type="index" header-align="center" align="center" width="100" label="序号">
                <template #default="scope">
                    <span>{{ (pageIndexx - 1) * pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <!-- 通过prop输出到表格中 -->
            <!-- <el-table-column prop="userName" header-align="center" align="center" min-width="100" label="用户" /> -->
            <el-table-column prop="nickname" header-align="center" align="center" min-width="150" label="昵称" />
            <el-table-column prop="name" header-align="center" align="center" min-width="150" label="姓名" />
            <el-table-column prop="phone" header-align="center" align="center" min-width="150" label="手机号" />
            <!-- <el-table-column prop="status" header-align="center" align="center" min-width="150" label="状态" /> -->
            <el-table-column
                prop="status"
                header-align="center"
                align="center"
                min-width="150"
                label="状态"
                :show-overflow-tooltip="true"
                :formatter="r => parse(r.status)"
            />
            <el-table-column prop="frontIdCard" header-align="center" align="center" min-width="150" label="身份证正面" >
                 <template #default="scope">
                    <el-image 
                            v-if="scope.row.frontIdCard != null"
							style="width: 100px; height: 100px"
							:src="scope.row.frontIdCard"
					></el-image>
                </template>
            </el-table-column>
            
            <el-table-column prop="backIdCard" header-align="center" align="center" min-width="150" label="身份证背面" >
                
                <template #default="scope">
                    <el-image 
                            v-if="scope.row.backIdCard != null"
							style="width: 100px; height: 100px"
							:src="scope.row.backIdCard"
					></el-image>
                </template>
            </el-table-column>
            <el-table-column prop="remark" header-align="center" align="center" min-width="150" label="备注" />
            <el-table-column prop="gmtCreate" :formatter="r => formatDate(r.gmtCreate)" header-align="center" align="center" min-width="130" label="创建时间" />
            <el-table-column prop="gmtModified" :formatter="r => formatDate(r.gmtModified)" header-align="center" align="center" min-width="130" label="修改时间" />
            <!-- 操作的按钮 -->
            <el-table-column header-align="center" align="center" width="150" label="操作">
                <!-- 当前这个template标签规定一个属性值scope，scope.row代表当前这条记录 -->
                <template #default="scope">
                    <el-button
                        type="text"
                        size="medium"
                        @click="updateHandle(scope.row.id)"
                    >
                        修改
                    </el-button>
                    <el-button
                        type="text"
                        size="medium"
                        @click="review(scope.row.id)"
                    >
                        审核
                    </el-button>
                    <el-button
                        type="text"
                        size="medium"
                        @click="reject(scope.row.id)"
                    >
                        拒绝
                    </el-button>
                   
                    <!-- <el-button
                        type="text"
                        size="medium"
                        :disabled="scope.row.root"
                        @click="deleteHandle(scope.row.id)"
                    >
                        删除
                    </el-button> -->
                </template>
            </el-table-column>
            
        </el-table>
        <!-- 分页控件 
         @size-change="sizeChangeHandle" 改变记录的条数
        @current-change="currentChangeHandle" 前后翻页触发

        :page-size="pageSize" 每次显示多少记录
        :total="totalCount" 一共多少条记录
        -->
        <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageIndexx"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
        <!-- 弹窗页面触发自定义事件  refreshDataList -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="loadDataList"></add-or-update>
        <user-info-remark v-if="addRemarkVisible" ref="userInfoRemark" @refreshDataList="loadDataList"></user-info-remark>
    </div>
</template>

<script>
//引入弹窗页面
import AddOrUpdate from './user-info-add-or-update.vue';
import UserInfoRemark from './user-info-remark.vue';
export default {
    components: {
        AddOrUpdate,//注册给当前的用户管理页面
        UserInfoRemark
    },
    //模型层，定义变量
    data() {
        return {
            dataForm: {
                nickname: ''
            },
            dataList: [],
            statusList: [],
            deptList: [],
            pageIndexx: 1, //第几页
            pageSize: 10, //每页的数量
            totalCount: 0, 
            dataListLoading: false,
            archiveVisible: false,
            dataListSelections: [], //勾选了表格中的复选框
            addOrUpdateVisible: false, // 添加了弹窗的页面-》 添加和修改用户信息
            addRemarkVisible: false, // 添加了弹窗的页面-》 添加和修改用户信息
            dimissVisible: false,  // 员工离职的时候有个弹窗 
            
            url: this.$baseUrl + 'img/00290f4022f44cbd8363ced013ab89a6.jpg',
        };
    },
    methods: {
        loadDataList: function() {
            let that = this;
            //进度条
            that.dataListLoading = true;
           
            //需要提交的数据
            let data = {
                nickname:that.dataForm.nickname,
                toPage: that.pageIndexx,
                pageSize: that.pageSize
            };
            //提交ajax请求
            that.$http('userInfo/listByPage', 'POST', data, true, function(resp) {
                resp.data.list.map(list =>{
                    if(list.backIdCard != null){
                        list.backIdCard = that.$baseUrl+"img/"+list.backIdCard
                    }

                    if(list.frontIdCard != null){
                        list.frontIdCard = that.$baseUrl+"img/"+list.frontIdCard
                    }
                    
                } )
                that.dataList = resp.data.list;
                that.totalCount = resp.data.total;

                
            
                //进度条消息
                that.dataListLoading = false;
            });
        },
        sizeChangeHandle(val) {
            this.pageSize = val;
            this.pageIndexx = 1;
            this.loadDataList();
        },
        currentChangeHandle(val) {
            this.pageIndexx = val;
            this.loadDataList();
        },
        loadStatusList: function() {
            let that = this;
            that.$httpGet('userInfo/toMap', 'GET', null, true, function(resp) {
                that.statusList = resp.data;
            });
        },
        //跟复选框相关
        selectionChangeHandle: function(val) {
            //这个val是选中数据的完整记录，不只是id
            this.dataListSelections = val;
        },
        //条件查询
        searchHandle: function() {
            this.$refs['dataForm'].validate(valid => {
                if (valid) {
                    this.$refs['dataForm'].clearValidate();
                    if (this.dataForm.username == '') {
                        this.dataForm.username = null;
                    }
                    if (this.pageIndexx != 1) {
                        this.pageIndexx = 1;
                    }
                    this.loadDataList();
                } else {
                    return false;
                }
            });
        },
        //添加的操作
        addHandle: function() {
            //把弹窗显示出来
            this.addOrUpdateVisible = true;
            //调用addOrUpdate的init函数，传入的是空值，代表是添加操作
            this.$nextTick(() => {
                this.$refs.addOrUpdate.init();
            });
        },
        //修改的操作
        updateHandle: function(id) {
            
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.addOrUpdate.init(id);
            });
        },


        reject:function(id){
            this.addRemarkVisible=true;
            //调用addOrUpdate的init函数，传入的是空值，代表是添加操作
            this.$nextTick(() => {
                this.$refs.userInfoRemark.init(id);
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
                            that.loadDataList();
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

        //删除的操作
        deleteHandle: function(id) {
            let that = this;
            //大于0的再boolean上代表的是true
            let ids = id
                ? [id]
                : that.dataListSelections.map(item => {
                    //完整用户记录中的主建id
                      return item.id;
                  });
            if (ids.length == 0) {
                that.$message({
                    message: '没有选中记录',
                    type: 'warning',
                    duration: 1200
                });
            } else {
                that.$confirm('确定要删除选中的记录？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    that.$httpGet('auth/account/remove', 'POST', { ids: ids }, true, function(resp) {
                        if (resp.data > 0) {
                            that.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1200
                            });
                            that.loadDataList();
                        } else {
                            that.$message({
                                message: '未能删除记录',
                                type: 'warning',
                                duration: 1200
                            });
                        }
                    });
                });
            }
        },
        formatDate: function(value){
           return dayjs(value).format("YYYY-MM-DD")
        },
        parse: function(value){
        let name ;
        this.statusList.map(status => {
            if(status.code == value){
                name =  status.status
            }
        })
        if(name != null){
            return name
        }
        },
        archive: function(taskId,description) {
			this.archiveVisible = true;
			this.$nextTick(() => {
				this.$refs.archive.init(taskId,description);
			});
		}
    },
    //created 钩子函数在实例被创建之后被调用
    //created 生命周期函数
    created: function() {
        this.loadDataList();
        //角色记录
        this.loadStatusList();
    
    }
    
};
</script>

<style lang="less" scoped="scoped"></style>
