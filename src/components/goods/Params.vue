<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert
        title="注意:只允许为第三级分类设置参数"
        type="warning"
        show-icon
      >
      </el-alert>
      <!-- 级联选择框 -->
      <el-row>
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
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisbled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数table -->
          <el-table :data="manyTableData" border style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="{ row }">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in row.attr_vals"
                  :key="index"
                  closable
                  @close="removeAttrVals(index, row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
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
                  @click="removeParamsById(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disable="isBtnDisbled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性table -->
          <el-table :data="onlyTableData" border style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="{ row }">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in row.attr_vals"
                  :key="index"
                  closable
                  @close="removeAttrVals(index, row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作" width="300px">
              <template slot-scope="scope">
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
                  @click="removeParamsById(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + cateTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed="handleAddDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="110px"
      >
        <el-form-item :label="cateTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + cateTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="handleEditDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="110px"
      >
        <el-form-item :label="cateTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      catelist: [], // 分类列表
      selectedKeys: [1, 3, 6], // 用户在级联下拉菜单中选中的分类id
      activeName: 'many', // 默认选中tab标签名称
      manyTableData: [], // 保存动态参数列表
      onlyTableData: [], // 保存静态属性列表
      // 添加
      addDialogVisible: false, // 控制对话框的显示
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名', trigger: 'blur' }]
      },
      // 编辑
      editDialogVisible: false, // 控制对话框的显示
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名', trigger: 'blur' }]
      }
      // inputVisible: false, // 控制输入框显示隐藏
      // inputValue: ''

    }
  },
  created () {
    this.getCateList()
    this.getParamsList()// todo
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      this.catelist = res.data
    },
    // 级联选中框选中发生变化会触发这个函数
    handleCascaderChange () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.getParamsList()
    },
    // 点击标签页触发事件
    handleTabClick () {
      this.getParamsList()
    },
    async getParamsList () {
      const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', {
        params: {
          sel: this.activeName
        }
      })
      res.data.forEach((item, index) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // res.data[index].attr_vals = item.attr_vals.split(' ')
        // 控制文本框显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        // 获取的是动态参数
        this.manyTableData = res.data
      } else {
        // 获取的是静态属性
        this.onlyTableData = res.data
      }
    },
    // 添加对话框
    handleAddDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories/' + this.cateId + '/attributes', {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
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
        this.getParamsList()
      })
    },
    // 编辑对话框
    handleEditDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/ ${this.cateId} /attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
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
        this.getParamsList()
      })
    },
    // 点击此数据把当前的值传入输入框中修改
    async showEditDialog (row) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${row.attr_id}`, { params: { attr_sel: this.activeName } })
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 删除
    removeParamsById (row) {
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '是',
        canacelButtonText: '否',
        type: 'warning'
      }).then(async action => {
        await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
        this.$message({
          message: '删除成功',
          type: 'success',
          showClose: true,
          duration: 3000
        })
        this.getParamsList()
      })
    },
    // 可编辑输入框显示
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // 方法一:  $nextTick方法的作用,就是当页面上元素被重新渲染之后,才会指定回调函数在的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
      //   方法二
    //   this.$nextTick(() => {
    //     this.$refs.saveTagInput.focus()
    //   })
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
      } else {
        // 保存本地
        row.attr_vals.push(row.inputValue.trim())
        row.inputVisible = false
        row.inputValue = ''
        // 调用请求
        this.saveAttrVals(row)
      }
    },
    // 公共请求
    async  saveAttrVals (row) {
      // 发送请求
      await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      this.$message({
        message: '修改成功',
        type: 'success',
        showClose: true,
        duration: 3000
      })
    },
    removeAttrVals (index, row) {
      // 保存本地
      row.attr_vals.splice(index, 1)
      // 发送请求
      this.saveAttrVals(row)
    }

  },
  computed: {
    // 如果选择的长度小不等于3,则清空输入框
    isBtnDisbled () {
      return this.selectedKeys.length !== 3
    },
    // 拼接字符串
    cateId () {
      return this.selectedKeys[this.selectedKeys.length - 1]
    },
    // 判断弹出对话框的标题
    cateTitle () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
