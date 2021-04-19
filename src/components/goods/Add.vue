<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- :active需要数值型,所以-0 -->
      <el-steps
        fiex-grow="1"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab区域 -->
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weigth">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="{
                  expandTrigger: 'hover',
                  label: 'cat_name',
                  value: 'cat_id',
                }"
                @change="handleCascaderChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox
                  :label="subItem"
                  border
                  v-for="(subItem, subIndex) in item.attr_vals"
                  :key="subIndex"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.arrt_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action:表示图片要上传的api地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              list-type="picture"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button class="addBtn" type="primary" @click="add"
              >提交商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="PreviewDialogVisible"
      width="50%"
    >
      <img :src="previewUrl" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 默认打开页
      activeIndex: '4',
      addForm: {
        goods_name: '', // 名称
        goods_price: 0, // 价格
        goods_weight: 0, // 重量
        goods_number: 0, // 数量
        goods_cat: [1, 3, 6], // todo商品所属分类数值
        pics: [], // 图片
        goods_introduce: '', // 介绍
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        // 商品分类数据列表
        goods_cat: [{ required: true, message: '请输入商品分类', trigger: 'blur' }]
      },
      catelist: [],
      manyTableData: [], // 动态参数
      onlyTableData: [], // 静态属性
      // 图片上传的headers请求头对象挂上token
      headersObj: {
        Authorization: sessionStorage.token
      },
      previewUrl: '',
      PreviewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
    this.tabClicked()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      this.catelist = res.data
    },
    handleCascaderChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 级联选择框选中三个以下数据会被清空,有三个数据才能进入下一个页面
    beforeTabLeave (activeName, oldActiveName) {
      // activeName要去的name,oldActiveName从tab的name  切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        return false
      }
      return true
    },
    // 基本信息切换时发起请求数据
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: 'many' } })
        res.data.forEach((item, index) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: 'only' } })
        this.onlyTableData = res.data
        console.log(res.data)
      }
    },
    // 处理图片删除操作
    handleRemove (file, fileList) {
      // console.log(file, fileList)
      const tmpPath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(t => t.pic === tmpPath)
      this.addForm.pics.splice(index, 1)
    },
    // 处理与初图片的预览操作
    handlePreview (file) {
      this.previewUrl = file.response.data.url
      this.PreviewDialogVisible = true
    },
    // 监听图片上传事件
    handleUploadSuccess (response, file, fileList) {
      // 把临时临时路径保存到一个obj对象
      const obj = { pic: response.data.tmp_path }
      // 把图片推送到addForm里面
      this.addForm.pics.push(obj)
    },
    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message({
            message: '请填写必要的数据',
            type: 'error',
            showClose: true,
            duration: 3000
          })
        }
        // 表单处理深拷贝,不改变原数据
        const formData = _.cloneDeep(this.addForm)
        formData.goods_cat = this.addForm.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(' ')
          })
        })
        // 处静态态属性
        this.onlyTableData.forEach(item => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(' ')
          })
        })
        formData.attrs = this.addForm.attrs
        // 发起请求
        const { data: res } = await this.$http.post('goods/', formData)
        if (res.meta.status !== 201) {
          this.$message({
            message: res.meta.msg,
            type: 'error',
            showClose: true,
            duration: 3000
          })
        } else {
          this.$router.push('/goods')
        }
      })
    }
  },
  computed: {
    // 拼接
    cateId () {
      return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
// .el-checkbox.is-borderd + el-checkbox.el-checkbox.is-borderd {
//   margin-left: 0;
// }
.addBtn {
  margin-top: 10px;
}
</style>
