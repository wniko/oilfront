<template>
    <div>
        <!-- 检索的条件 -->
        <!--rules 验证规则 -->
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm">
        
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
            <!-- <el-table-column prop="userName" header-align="center" align="center" min-width="100" label="用户" /> -->
            <el-table-column prop="title" header-align="center" align="center" min-width="150" label="标题" />
            <el-table-column prop="intentionPrice" header-align="center" align="center" min-width="150" label="意向价" />
            <el-table-column prop="surplusNum" header-align="center" align="center" min-width="150" label="剩余数量" />

            <el-table-column prop="warehouse" header-align="center" align="center" min-width="150" label="仓库" />
            <el-table-column prop="depositRatio" header-align="center" align="center" min-width="150" label="保证金比例" />
            <el-table-column prop="totalNum" header-align="center" align="center" min-width="150" label="拼单总数" />
            <el-table-column prop="startNum" header-align="center" align="center" min-width="150" label="起拼数量" />
            <el-table-column prop="loadTime" :formatter="r => formatDate(r.loadTime)" header-align="center" align="center" min-width="130" label="装货时间" />
            <el-table-column prop="payment" header-align="center" align="center" min-width="150" label="付款期" />
            <el-table-column prop="delivery" header-align="center" align="center" min-width="150" label="提货期" />
            <el-table-column prop="city" header-align="center" align="center" min-width="150" label="城市" />
            <el-table-column prop="picture" header-align="center" align="center" min-width="150" label="图片" >
                <template #default="scope">
                   <el-image 
                            v-if="scope.row.picture!=null && scope.row.picture!=''"
							style="width: 50px; height: 50px"
                            :src="bindIcon(scope.row.picture)"
                            :initial-index="4"
							:preview-src-list="bindPictrueList(scope.row.picture)"
                            fit="cover"
					></el-image>
                </template>
            </el-table-column>
            
            <el-table-column prop="video" header-align="center" align="center" min-width="150" label="视频" >
                <template #default="scope">
                <el-button
                        v-if="scope.row.video!=null &&scope.row.video!=''"
                        type="text"
                        size="medium"
                        @click="playing(scope.row.video)"
                    >
                        播放视频
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="accountList" header-align="center" align="center" min-width="150" label="已参与的用户" >
                <template #default="scope">
                <el-button
                        v-if="scope.row.accountList != null && scope.row.accountList.length > 0"
                        type="text"
                        size="medium"
                        @click="findAccount(scope.row.accountList)"
                    >
                        查看
                    </el-button>
                </template>
            </el-table-column>


            <el-table-column
                prop="status"
                header-align="center"
                align="center"
                min-width="150"
                label="状态"
                :show-overflow-tooltip="true"
                :formatter="r => parse(r.status,statusList)"
            />
            <el-table-column prop="remark" header-align="center" align="center" min-width="150" label="备注" />
            <el-table-column prop="gmtCreate" :formatter="r => formatDate(r.gmtCreate)" header-align="center" align="center" min-width="130" label="创建时间" />
            <el-table-column prop="gmtModified" :formatter="r => formatDate(r.gmtModified)" header-align="center" align="center" min-width="130" label="修改时间" />
            <!-- 操作的按钮 -->
            <el-table-column header-align="center" align="center" width="250" label="操作">
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
        <share-order-account v-if="addOrUpdateVisible" ref="shareOrderAccount" @refreshDataList="loadDataList"></share-order-account>
        <share-order-add-or-update v-if="addOrUpdateVisible" ref="shareOrderAddOrUpdate" @refreshDataList="loadDataList"></share-order-add-or-update>
        <share-order-play-video v-if="addOrUpdateVisible" ref="shareOrderPlayVideo" @refreshDataList="loadDataList"/>
    </div>
</template>

<script>
//引入弹窗页面
import ShareOrderAccount from './shareOrder-account.vue';
import ShareOrderAddOrUpdate from './shareOrder-add-or-update.vue';
import ShareOrderPlayVideo from './shareOrder-play-video.vue';
export default {
    components: {
        ShareOrderAccount,
        ShareOrderAddOrUpdate,
        ShareOrderPlayVideo
    },
    //模型层，定义变量
    data() {
        return {
            showViewer: false,
            dataForm: {
                gmtCreate: null,
                status:null
            },
            // statusList: [{"code":"1","status":"待审核"},{"code":"2","status":"已审核"}
            // ,{"code":"3","status":"已拒绝"},{"code":"4","status":"已结束"},{"code":"5","status":"已下线"}],
            statusList: [{"code":"1","status":"待上线"},{"code":"2","status":"已上线"}
            ,{"code":"3","status":"已结束"},{"code":"4","status":"已下线"}],
            dataList: [],
            deptList: [],
            pageIndexx: 1, //第几页
            pageSize: 10, //每页的数量
            totalCount: 0, 
            dataListLoading: false,
            archiveVisible: false,
            dataListSelections: [], //勾选了表格中的复选框
            addOrUpdateVisible: false, // 添加了弹窗的页面-》 添加和修改用户信息
            addRemarkVisible: false, // 添加了弹窗的页面-》 添加和修改用户信息
            cityList:["长三角","珠三角","环渤海"]
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
                toPage: that.pageIndexx,
                pageSize: that.pageSize
            };
            //提交ajax请求
            that.$http('shareOrder/listByPage', 'POST', data, true, function(resp) {
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
        onPreview(){
            //调用image组件中的大图浏览图片方法
            this.$nextTick(() => {
            this.$refs.preview.clickHandler();
            })
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
                this.$refs.shareOrderAddOrUpdate.init();
            });
        },
        //修改的操作
        updateHandle: function(id) {
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.shareOrderAddOrUpdate.init(id);
            });
        },
        playing: function(val){
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.shareOrderPlayVideo.init(val);
            });
        },
        //查看的操作
        findAccount: function(value) {
            this.addOrUpdateVisible = true;
            this.$nextTick(() => {
                this.$refs.shareOrderAccount.init(value);
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
                    that.$httpGet('shareOrder/review', 'GET', { shareOrderId: ids }, true, function(resp) {
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
                    that.$httpGet('shareOrder/finish', 'GET', { shareOrderId: ids }, true, function(resp) {
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
                    that.$httpGet('shareOrder/offline', 'GET', { shareOrderId: ids }, true, function(resp) {
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
    },
    //created 钩子函数在实例被创建之后被调用
    //created 生命周期函数
    created: function() {
        this.loadDataList();
    }
    
};
</script>

<style lang="less" scoped="scoped">
.hideImgDiv {
   .el-image{
    display: none;
  }
}
</style>
