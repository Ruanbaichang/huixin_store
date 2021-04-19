<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-button type="primary" @click="showAddRole">添加角色</el-button>
      </el-row>
    </el-card>
    <!-- 角色列表区域 -->
    <el-table :data="roleList" border style="width: 100%">
      <!-- 添加展开列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row
            class="bdbottom vcenter"
            :class="{ bdtop: i1 === 0 }"
            v-for="(item1, i1) in scope.row.children"
            :key="item1.id"
          >
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{
                item1.authName
              }}</el-tag
              ><i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <el-row
                :class="{ bdtop: i2 !== 0 }"
                v-for="(item2, i2) in item1.children"
                :key="item2.id"
                class="vcenter"
              >
                <el-col :span="6">
                  <el-tag
                    type="success"
                    closable
                    @close="removeRightsById(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag
                  >
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag
                    type="warning"
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    closable
                    @close="removeRightsById(scope.row, item3.id)"
                    >{{ item3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index" label="#"> </el-table-column>
      <el-table-column prop="roleName" label="角色名称"> </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
      <el-table-column label="操作" width="300px">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditRole(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeRoleById(scope.row.id)"
            >删除</el-button
          >
          <el-button
            type="warning"
            icon="el-icon-setting"
            size="mini"
            @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        :data="rightslist"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed="handleAddDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="110px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="handleEditDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="110px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框显示隐藏
      setRightsDialogVisible: false,
      // 所有权限数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值
      defKeys: [],
      // 添加角色
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addDialogVisible: false,
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色色名称长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }, { min: 3, max: 20, message: '描述长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 编辑角色
      editForm: {
        roleName: '',
        roleDesc: '',
        roleId: ''
      },
      editDialogVisible: false,
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色色名称长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }, { min: 3, max: 20, message: '描述长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      }

    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      this.roleList = res.data
    },
    // 删除
    removeRightsById (role, rightId) {
      // 弹框询问用户是否删除数据
      this.$confirm('是否删除', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(async action => {
        // 点击是
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status === 200) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
          // 刷新列表
          role.children = res.data
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
    async showSetRightsDialog (role) {
      // 1.打开对话框之前清空数据,解决数据重复问题
      this.defKeys = []
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      this.rightslist = res.data
      // 方式1.不用递归
      // role.children.forEach(item1 => {
      //   item1.children.forEach(item2 => {
      //     item2.children.forEach(item3 => {
      //       this.defKeys.push(item3.id)
      //     })
      //   })
      // })
      // this.getLeafKeys(role)
      this.getLeafKeys(role, this.defKeys)
      // 2.打开对话框当道后面,解决数据重复问题
      this.setRightsDialogVisible = true
    },
    // 方式2.用递归,简化吧
    // getLeafKeys (node) {
    //   // 最后一级的元素
    //   if (!node.children) {
    //     this.defKeys.push(node.id)
    //   } else {
    //     node.children.forEach(subNode => {
    //       this.getLeafKeys(subNode)
    //     })
    //   }
    // }
    // 方式3.用递归,复杂版(多穿参数)
    getLeafKeys (node, arry) {
      // 最后一级的元素
      if (!node.children) {
        arry.push(node.id)
      } else {
        node.children.forEach(subNode => {
          this.getLeafKeys(subNode, arry)
        })
      }
    },
    // 获取所有选中及半选的内容
    async saveRights () {
      const rids = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 发送请求完成更新
      await this.$http.post('roles/' + this.roleId + '/rights', {
        // 将数组转换为 , 拼接的字符串
        rids: rids.join(',')
      })
      this.getRoleList()
      // 关闭对话框
      this.setRightsDialogVisible = false
    },
    handleAddDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    showAddRole () {
      this.addDialogVisible = true
    },
    addRole () {
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) return
        // 发起角色添加网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)
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
        this.getRoleList()
      })
    },
    // 编辑角色
    handleEditDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editRole () {
      this.$refs.editFormRef.validate(async validate => {
        if (!validate) return
        // 发起角色编辑网络请求
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })

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
        // 编辑完成关闭表单
        this.editDialogVisible = false
        // 刷新
        this.getRoleList()
      })
    },
    // 弹出对话框时获取数据
    async showEditRole (row) {
      const { data: res } = await this.$http.get('roles/' + row.id)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    removeRoleById (id) {
      // 弹框询问用户是否删除数据
      this.$confirm('是否删除', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(async action => {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status === 200) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
            duration: 3000
          })
          // 刷新列表
          this.getRoleList()
        }
      }).catch(() => {
        this.$message({
          message: '取消删除',
          type: 'error',
          showClose: true,
          duration: 3000
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
