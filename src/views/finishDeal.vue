<template>
    <div>
        <!-- 检索的条件 -->
        <!--rules 验证规则 -->
        <el-form :inline="true" :model="dataForm"  ref="dataForm">
        
            <el-form-item prop="gmtCreate">
				<el-date-picker
					v-model="dataForm.gmtCreate"
					style="width: 160px;"
					type="date"
					size="medium"
					placeholder="创建日期"
					clearable="clearable"
				></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-select v-model="dataForm.status" class="input" placeholder="状态" size="medium" clearable="clearable">
                    <!-- 用roleList这个变量保存查询的结果，通过v-for输出到下拉列表中 -->
                    <el-option v-for="one in statusList" :label="one.status" :value="one.code" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="dataForm.marketType" class="input" placeholder="类型" size="medium" clearable="clearable">
                    <!-- 用roleList这个变量保存查询的结果，通过v-for输出到下拉列表中 -->
                    <el-option v-for="one in marketTypeList" :label="one.status" :value="one.code" />
                </el-select>
            </el-form-item>
            <!-- 查询的按钮 -->
            <el-form-item>
                <el-button size="medium" type="primary" @click="searchHandle()">查询</el-button> 
            </el-form-item>
            <el-form-item >
                <el-button
                    size="medium"
                    type="primary"
                    @click="addHandle()"
                >
                    新增
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
            <el-table-column
                prop="marketType"
                header-align="center"
                align="center"
                min-width="150"
                label="类型"
                :show-overflow-tooltip="true"
                :formatter="r => parse(r.marketType,marketTypeList)"
            />
            <el-table-column prop="warehouse" header-align="center" align="center" min-width="150" label="标题" />
            <el-table-column prop="depositRatio" header-align="center" align="center" min-width="150" label="副标题" />
            <!-- <el-table-column prop="city" header-align="center" align="center" min-width="150" label="城市" /> -->
            <el-table-column
                prop="status"
                header-align="center"
                align="center"
                min-width="150"
                label="状态"
                :show-overflow-tooltip="true"
                :formatter="r => parse(r.status,statusList)"
            />
            <el-table-column prop="remark" header-align="center" align="center" min-width="150" label="文字内容" />
            <el-table-column prop="gmtCreate" :formatter="r => formatDate(r.gmtCreate)" header-align="center" align="center" min-width="130" label="创建时间" />
            <el-table-column prop="gmtModified" :formatter="r => formatDate(r.gmtModified)" header-align="center" align="center" min-width="130" label="修改时间" />
            <el-table-column prop="picture" header-align="center" align="center" min-width="150" label="图片内容" >
                <template #default="scope">
                   <el-image 
							style="width: 100px; height: 100px"
                            v-if="scope.row.picture!=null && scope.row.picture!=''"
                            :src="bindIcon(scope.row.picture)"
                            :initial-index="4"
							:preview-src-list="bindPictrueList(scope.row.picture)"
                            fit="cover"
					></el-image>
                </template>
            </el-table-column>
            
            <!-- 操作的按钮 -->
            <el-table-column header-align="center" align="center" width="300" label="操作">
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
                        :disabled="scope.row.root"
                        @click="deleteHandle(scope.row.id)"
                    >
                        删除
                    </el-button>
                    <el-button
                        type="text"
                        size="medium"
                        @click="review(scope.row.id)"
                    >
                        上线
                    </el-button>
                    <el-button
                        type="text"
                        size="medium"
                        @click="finish(scope.row.id)"
                    >
                        结束
                    </el-button>

                   <el-button
                        type="text"
                        size="medium"
                        @click="offline(scope.row.id)"
                    >
                        下线
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
        <finish-deal-add-or-update v-if="addOrUpdateVisible" ref="finishDealAddOrUpdate" @refreshDataList="loadDataList"></finish-deal-add-or-update>
        <archive v-if="archiveVisible" ref="archive" @refreshDataList="loadDataList"></archive>
        <user-info-remark v-if="addRemarkVisible" ref="userInfoRemark" @refreshDataList="loadDataList"></user-info-remark>
    </div>
</template>

<script>
//引入弹窗页面
import FinishDealAddOrUpdate from './finishDeal-add-or-update.vue';
import UserInfoRemark from './user-info-remark.vue';
export default {
    components: {
        FinishDealAddOrUpdate,//注册给当前的用户管理页面
        UserInfoRemark
    },
    //模型层，定义变量
    data() {
        return {
             dataForm: {
                gmtCreate: null,
                status:null,
                marketType:null
            },
            dataList: [],
            statusList: [{"code":"1","status":"待上线"},{"code":"2","status":"已上线"}
            ,{"code":"3","status":"已结束"},{"code":"4","status":"已下线"}],
            marketTypeList:[{"code":0,"status":"企业价格"},{"code":1,"status":"产销率"},{"code":2,"status":"投标"}],
            taxTypeList:[{"code":0,"status":"未含税"},{"code":1,"status":"含税"}],
            cargoTypeList:[{"code":0,"status":"现货"},{"code":1,"status":"期货"}],
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
            pictureList:[],
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
                gmtCreate:that.dataForm.gmtCreate,
                status:that.dataForm.status,
                marketType:that.dataForm.marketType,
                toPage: that.pageIndexx,
                pageSize: that.pageSize
            };
            //提交ajax请求
            that.$http('finishDeal/listByPage', 'POST', data, true, function(resp) {
                that.dataList = resp.data.list;
                that.totalCount = resp.data.total;
                //进度条消息
                that.dataListLoading = false;
            });
        },
        bindIcon(icon) {
            if(icon != null){
                return this.$baseUrl + "img/" + icon.split(',')[0];
            }
        },
        bindPictrueList(icon) {
            if(icon != null){
                var list=[];
                icon.split(',').map(value=>{
                    list.push(this.$baseUrl + "img/" + value)
                })
                return list
            }    
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
                    if (this.dataForm.nickname == '') {
                        this.dataForm.nickname = null;
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
                this.$refs.finishDealAddOrUpdate.init();
            });
        },
        //修改的操作
        updateHandle: function(id) {
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.finishDealAddOrUpdate.init(id);
            });
        },

        //删除的操作
        deleteHandle: function(id) {
            let that = this;
            //大于0的再boolean上代表的是true
            let ids = id
                // ? [id]
                // : that.dataListSelections.map(item => {
                //     //完整用户记录中的主建id
                //       return item.id;
                //   });
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
                    that.$httpGet('finishDeal/removeFinishDeal', 'POST', {finishDealId: ids }, true, function(resp) {
                        if (resp.success) {
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
                    that.$httpGet('finishDeal/review', 'GET', { finishDealId: ids }, true, function(resp) {
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
        //结束
        finish: function(id){
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
                that.$confirm('确定要结束选中的记录？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    that.$httpGet('finishDeal/finish', 'GET', { finishDealId: ids }, true, function(resp) {
                        if (resp.success) {
                            that.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1200
                            });
                            that.loadDataList();
                        } else {
                            that.$message({
                                message: '未能结束记录',
                                type: 'warning',
                                duration: 1200
                            });
                        }
                    });
                });
            }
        },
        //下线
        offline: function(id){
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
                that.$confirm('确定要下线选中的记录？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    that.$httpGet('finishDeal/offline', 'GET', { finishDealId: ids }, true, function(resp) {
                        if (resp.success) {
                            that.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1200
                            });
                            that.loadDataList();
                        } else {
                            that.$message({
                                message: '未能下线记录',
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
        parse: function(value,enumlist){
        let name ;
        enumlist.map(status => {
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
    }
    
};
</script>

<style lang="less" scoped="scoped"></style>
