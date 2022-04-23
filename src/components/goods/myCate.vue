<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类区域 -->
      <el-button type="primary"
                 class="myCateBtn"
                 @click="showAddCateDialog">添加分类</el-button>

      <!-- 表格 -->
      <tree-table :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  border>
        <!-- 是否有效 -->
        <template slot="isok"
                  slot-scope="scope">
          <i class="el-icon-success"
             style="color : lightgreen"
             v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error"
             style="color : red"
             v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order"
                  slot-scope="scope">
          <el-tag size="mini"
                  v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success"
                  size="mini"
                  v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning"
                  size="mini"
                  v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt"
                  slot-scope="scope">
          <el-button type="primary"
                     icon="el-icon-edit"
                     size="mini"
                     @click="showCateFormDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     size="mini"
                     @click="showDeleteCateFormDialog(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[3, 5, 10, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>

    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%"
               @close="addDialogClosed">
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="100px">
        <el-form-item label="分类名称:"
                      prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader v-model="selectedKeys"
                       :options="parentCateList"
                       :props="{expandTrigger: 'hover', ...cascaderProps, checkStrictly: 'true' }"
                       @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="showEditCateForm"
      width="50%">
      <el-form v-model="editCateFormDialog" :rules="editCateFormrules" ref="editCateFormRef" label-width="70px">
        <el-form-item label="活动名称">
          <el-input v-model="editCateFormDialog.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditCateForm = false">取 消</el-button>
        <el-button type="primary" @click="editCateFormConfirm">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类层级,默认为一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: 'true', message: '请输入分类名称', tigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级别选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制编辑分类对话框的显示与隐藏
      showEditCateForm: false,
      // 查询到的分类信息
      editCateFormDialog: {},
      editCateFormDialogName: '',
      // 添加分类表单的验证规则对象
      editCateFormrules: {
        cat_name: [
          { required: 'true', message: '请输入分类名称', tigger: 'blur' }
        ]
      },
      // 控制删除对话框的显示与隐藏
      deleteCateDialog: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 数据库中获取商品列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // 将数据列表赋值给 cateList
      this.cateList = res.data.result
      // 将总数居条数赋值给 total
      this.total = res.data.total
    },
    // 监听 pagsize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类弹出框的显示
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级列表失败')
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // 父级分类的id
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        // eslint-disable-next-line no-useless-return
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确认按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', {
          cat_level: this.addCateForm.cat_level,
          cat_name: this.addCateForm.cat_name,
          cat_pid: this.addCateForm.cat_pid
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭
    addDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      // 父级分类的id
      this.addCateForm.cat_pid = 0
      // 为当前分类的等级赋值
      this.addCateForm.cat_level = 0
    },
    // 监听编辑按钮
    async showCateFormDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        console.log(res.meta.status)
        return this.$message.error('查询角色失败')
      }
      console.log(res.data)
      this.editCateFormDialog = res.data
      // this.editCateFormDialogName = res.data.cat_name
      this.showEditCateForm = true
    },
    // 监听确认提交编辑按钮
    async editCateFormConfirm() {
      const { data: res } = await this.$http.put('categories/' + this.editCateFormDialog.cat_id, { cat_name: this.editCateFormDialog.cat_name })
      if (res.meta.status !== 200) {
        console.log(res.meta.status)
        return this.$message.error('更新分类失败')
      }
      this.showEditCateForm = false
      this.getCateList()
      this.$message.success('更新分类成功')
    },
    // 监听删除按钮
    async showDeleteCateFormDialog(id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      // 重新刷新列表
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.myCateBtn {
  display: flex;
  margin-bottom: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
