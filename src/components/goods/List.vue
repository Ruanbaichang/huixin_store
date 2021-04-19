<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            @clear="getGoodsList"
            v-model="queryInfo.query"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 方法一跳转 -->
          <!-- <router-link to="goods/add">
            <el-button type="primary">添加商品</el-button></router-link
          > -->
          <!-- 方法二跳转 -->
          <el-button type="primary" @click="$router.push('goods/add')"
            >添加商品</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodslist" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <!-- 时间模板 -->
          <template slot-scope="scope">
            {{ scope.row.add_time | dateformat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="handleEditDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="商品名称">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <!-- 级联选择框 -->
        <!-- <el-row>
          <el-col>
            <span>选择商品分类:</span>
            <el-cascader
              v-model="selectedKeys"
              :options="catelist"
              clearable
              :props="{
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
              }"
              @change="handleCascaderChange"
            ></el-cascader>
          </el-col>
        </el-row> -->
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '', // 查询条件
        pagenum: 1, // 当前页
        pagesize: 10// 每页多少条
      },
      // 商品列表
      goodslist: [],
      // 总条数
      total: 0,
      editDialogVisible: false, // 控制对话框的显示
      editForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0
      },
      editFormRules: {
        goods_name: [{ required: true, message: '请输入商品名', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        // 商品分类数据列表
        goods_cat: [{ required: true, message: '请输入商品分类', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      console.log(res)
      this.total = res.data.total
      this.goodslist = res.data.goods
    },
    // 分页功能
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 根据Id删除对应用户消息
    removeGoodsById (id) {
      // 弹框询问用户是否删除数据
      this.$confirm('是否删除', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(async action => {
        const { data: res } = await this.$http.delete('goods/' + id)
        if (res.meta.status === 200) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
          // 刷新列表
          this.getGoodsList()
        }
      }).catch(() => {
        this.$message({
          message: '取消删除',
          type: 'error',
          showClose: true,
          duration: 3000
        })
      })
    },
    // 编辑用户
    handleEditDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击修改弹出层显示
    async showEditDialog (row) {
      const { data: res } = await this.$http.get('goods/' + row.goods_id)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editGoodsList () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起请求
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, { goods_name: this.editForm.goods_name, goods_price: this.editForm.goods_price, goods_number: this.editForm.goods_number, goods_weigth: this.editForm.goods_weigth })
        console.log(this.editForm.goods_id)
        console.log(res)
        if (res.meta.status === 200) {
          this.$message({
            message: '编辑成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
        } else {
          this.$message({
            message: '编辑失败',
            type: 'error',
            showClose: true,
            duration: 3000
          })
        }
        this.editDialogVisible = false
        this.getGoodsList()
      })
    }

  }
}
</script>
<style lang="less" scoped>
</style>
