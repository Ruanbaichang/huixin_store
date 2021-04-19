<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-button type="primary" @click="showAddDialog">新增分类</el-button>
      </el-row>
      <!-- 分类表格:data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框):expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮) -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: green"
            v-if="!scope.row.cat_deleted"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 新增分类对话框 -->
    <el-dialog
      title="新增分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed="handleAddDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="分类名" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label=" 父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              label: 'cat_name',
              value: 'cat_id',
            }"
            @change="handleCascaderChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑分类"
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
        <el-form-item label="分类名" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate"> 确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        pagenum: 1, // 当前商品页数
        pagesize: 5 // 每页显示条数
      },
      total: 3, // 总共商品条数
      catelist: [], // 商品分类数据列表,默认为空
      columns: [{
        label: '分类列表',
        prop: 'cat_name'
      }, {
        label: '是否有效', // 标题
        prop: 'cat_deleted',
        type: 'template', // 定义为模板
        template: 'isOK'// 模板名称
      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      // 添加
      addDialogVisible: false, // 控制对话框的显示
      addForm: {
        cat_name: '',
        // 添加分类的父级id，0则表示父级为0.添加一级分类
        cat_pid: 0,
        // 添加分类的等级，0则表示添加一级分类
        cat_level: 0
      },
      addFormRules: {
        cat_name: [{ required: true, message: '请输入分类名', trigger: 'blur' }]
      },
      parentCateList: [], // 带选择的父分类列表
      selectedKeys: [], // 选中父分类id
      // 修改
      editDialogVisible: false, // 控制对话框的显示
      editForm: {
        cat_name: '',
        // 添加分类的父级id，0则表示父级为0.添加一级分类
        cat_pid: 0,
        // 添加分类的等级，0则表示添加一级分类
        cat_level: 0
      },
      editFormRules: {
        cat_name: [{ required: true, message: '请输入分类名', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    handleCascaderChange () {
      console.log(this.selectedKeys)
      // 如果用户选择了父级分类
      if (this.selectedKeys.length > 0) {
        // 则将数组中的最后一项设置为父级分类
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // level也要跟着发生变化
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      this.total = res.data.total
      this.catelist = res.data.result
    },
    // 分页
    handleSizeChange (val) {
    // 当pagesize发生改变时触发
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    handleCurrentChange (val) {
    // 当pagenum发生改变时触发
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    // 关闭表时清空数据
    handleAddDialogClosed () {
      this.$refs.addFormRef.resetFields()
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
      this.selectedKeys = []
    },
    // 新增
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status === 201) {
          this.$message({
            message: '添加成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
        } else {
          this.$message({
            message: '添加失败',
            type: 'error',
            showClose: true,
            duration: 3000
          })
        }
        this.addDialogVisible = false
        this.getCateList()
      })
    },
    showAddDialog () {
      // 调用下拉列表请求数据方法
      this.getParentCateList()
      this.addDialogVisible = true
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      this.parentCateList = res.data
    },
    // 点击弹出修改对话框
    async showEditDialog (row) {
      const { data: res } = await this.$http.get('categories/' + row.cat_id)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    handleEditDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id},${this.editForm.cat_name}`, {
          cat_name: this.editForm.cat_name
        })
        if (res.meta.status === 200) {
          this.$message({
            message: '修改成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
        } else {
          this.$message({
            message: '修改失败',
            type: 'error',
            showClose: true,
            duration: 3000
          })
        }
        this.editDialogVisible = false
        this.getCateList()
      })
    },
    // 删除
    removeCateById (row) {
      this.$confirm('是否删除', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(async action => {
        await this.$http.delete(`categories/${row.cat_id}`)
        this.$message({
          message: '删除成功',
          type: 'success',
          showClose: true,
          duration: 3000
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
