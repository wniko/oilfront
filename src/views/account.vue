<template>
    <div >
        <!-- 检索的条件 -->
        <!--rules 验证规则 -->
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm">
        
            <el-form-item prop="name">
                <!-- 文本框 -->
                <!-- 输入的内容保存再dataForm -->
                <el-input
                    v-model="dataForm.username"
                    placeholder="用户名"
                    size="medium"
                    class="input"
                    clearable="clearable"
                />
            </el-form-item>
            
            <!-- 查询数据库获得 -->
            <el-form-item>
                <el-select v-model="dataForm.role" class="input" placeholder="角色" size="medium" clearable="clearable">
                    <!-- 用roleList这个变量保存查询的结果，通过v-for输出到下拉列表中 -->
                    <el-option v-for="one in roleList" :label="one.name" :value="one.id" />
                </el-select>
            </el-form-item>
            
            
            <!-- 查询的按钮 -->
            <el-form-item>
                <el-button size="medium" type="primary" @click="searchHandle()">查询</el-button>
                <el-button
                    size="medium"
                    type="primary"
                    @click="addHandle()"
                >
                    新增
                </el-button>
                <el-button
                    size="medium"
                    type="danger"
                    @click="deleteHandle()"
                >
                    批量删除
                </el-button>
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
            <el-table-column prop="userName" header-align="center" align="center" min-width="100" label="用户名" />
            <el-table-column prop="passWord" header-align="center" align="center" min-width="150" label="密码" />
            <el-table-column
                prop="roleId"
                header-align="center"
                align="center"
                min-width="150"
                label="角色"
                :show-overflow-tooltip="true"
                :formatter="r => parse(r.roleId)"
            />
            <el-table-column prop="remark" header-align="center" align="center" min-width="130" label="备注" />
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
                    <!-- <el-button
                        type="text"
                        size="medium"
                        :disabled="scope.row.status == '离职' || scope.row.root"
                        @click="dimissHandle(scope.row.id)"
                    >
                        离职
                    </el-button> -->
                    <el-button
                        type="text"
                        size="medium"
                        :disabled="scope.row.root"
                        @click="deleteHandle(scope.row.id)"
                    >
                        删除
                    </el-button>
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
        <!-- 操作离职按钮 -->
    </div>
</template>

<script>
//引入弹窗页面
import AddOrUpdate from './account-add-or-update.vue';
export default {
    components: {
        AddOrUpdate//注册给当前的用户管理页面
    },
    //模型层，定义变量
    data() {
        return {
            dataForm: {
                username: ''
            },
            dataList: [],
            roleList: [],
            deptList: [],
            pageIndexx: 1, //第几页
            pageSize: 10, //每页的数量
            totalCount: 0, 
            dataListLoading: false,
            dataListSelections: [], //勾选了表格中的复选框
            addOrUpdateVisible: false, // 添加了弹窗的页面-》 添加和修改用户信息
            dimissVisible: false,  // 员工离职的时候有个弹窗 
            dataRule: {
                username: [{ required: false, pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '用户名格式错误' }]
            }
        };
    },
    methods: {
        loadDataList: function() {
            let that = this;
            //进度条
            that.dataListLoading = true;
           
            //需要提交的数据
            let data = {
                userName:that.dataForm.username,
                roleId:that.dataForm.role,
                toPage: that.pageIndexx,
                pageSize: that.pageSize
            };
            //提交ajax请求
            that.$http('auth/account/listByPage', 'POST', data, true, function(resp) {
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
        loadRoleList: function() {
            let that = this;
            // that.$http('/auth/role/getAllRole', 'GET', null, true, function(resp) {
            //     that.roleList = resp.data;
            // });
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
        this.roleList.map(role => {
            if(role.id == value){
                name =  role.name
            }
        })
        if(name != null){
            return name
        }
        }
    },
    //created 钩子函数在实例被创建之后被调用
    //created 生命周期函数
    created: function() {
        this.loadDataList();
        //角色记录
        this.loadRoleList();
    
    }
};
</script>

<style lang="less" scoped="scoped"></style>
