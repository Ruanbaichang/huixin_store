<template>
  <div>
    <h3>用户列表组件</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStatusChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页
        size-change:每页多少条,pageSize改变时会触发
      current-change:当前页发生改变
      current-page:当前页
      page-size:每页多少条选择列表
      page-size:每页多少条
      total:总条数
      -->
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
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed="handleAddDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户"
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
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <div>
        <p>当前用户:{{ userInfo.username }}</p>
        <p>当前角色:{{ userInfo.role_name }}</p>
        <p>
          设置角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolelist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    var checkEmail = (rule, value, callback) => {
      if (/^\w+@\w+(\.\w+)+$/.test(value)) {
        callback()// 验证通过
      } else {
        callback(new Error('请输入正确的邮箱'))
      }
    }
    var checkMobile = (rule, value, callback) => {
      if (/^1[34578]\d{9}$/.test(value)) {
        callback()// 验证通过
      } else {
        callback(new Error('请输入正确的手机号码'))
      }
    }
    return {
      queryInfo: {
        query: '', // 查询条件
        pagenum: 1, // 当前页
        pagesize: 2// 每页条数
      },
      total: 0, // 总条数
      userlist: [], // 用户列表
      addDialogVisible: false, // 控制对话框显示
      // 添加用户的表单数据
      addForm: {
        usernaem: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '登录名长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }],

        mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }]
      },
      // 编辑用户数据
      editDialogVisible: false, // 控制对话框的显示
      editForm: {
        // username: '',
        // password: '',
        email: '',
        mobile: ''
      },
      // 编辑表单验证规则
      editFormRules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
      },
      // 控制显示分配角色对话框
      setRoleDialogVisible: false,
      // 保存正在操作的那个用户信息
      userInfo: {},
      // 保存所有的角色信息
      rolelist: [],
      // 保存用户选中的角色id
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      this.total = res.data.total
      this.userlist = res.data.users
      // 如果返回状态为异常状态则报错并返回
      // if (res.meta.status !== 200) {
      //   this.$message.error('获取用户列表失败')
      // } else {
      //   // 如果返回状态正常,将请求的数据保存在data中
      //   this.userList = res.data.users
      //   this.table = res.data.total
      // }
    },
    // 分页功能
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 监听switch开关状态改变
    async userStatusChange (row) {
      await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      this.$message({
        message: '修改成功',
        type: 'success',
        showClose: true,
        duration: 3000
      })
    },
    // 关闭时重置新增用户表单
    handleAddDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser () {
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) return
        // 发起用户添加网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
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
        // 添加完成关闭表单
        this.addDialogVisible = false
        // 刷新
        this.getUserList()
      })
    },
    // 编辑用户
    handleEditDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        // { email: this.editForm.email, mobile: this.editForm.mobile }可替换成this.editForm
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
        this.getUserList()
      })
    },
    // 点击修改弹出层显示
    async showEditDialog (row) {
      const { data: res } = await this.$http.get('users/' + row.id)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 根据Id删除对应用户消息
    removeUserById (id) {
      // 弹框询问用户是否删除数据
      this.$confirm('是否删除', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(async action => {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status === 200) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
          // 刷新列表
          this.getUserList()
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
    // 显示分配角色弹出层
    async showSetRoleDialog (userInfo) {
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
      // 获取角色下拉选择框数据
      const { data: res } = await this.$http.get('roles')
      this.rolelist = res.data
    },
    async setRole () {
      await this.$http.put('users/' + this.userInfo.id + '/role', {
        rid: this.selectedRoleId
      })
      this.$message({
        message: '分配角色成功',
        type: 'success',
        showClose: true,
        duration: 3000
      })
      // 刷新列表
      this.getUserList()
      // 关闭对话框
      this.setRoleDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
</style>
