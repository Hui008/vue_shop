<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-button type="primary" class="myRolesBtn" @click="addDialogVisible=true">添加角色</el-button>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbotton', i1 === 0 ? 'bdtop':'', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '': 'bdtop','vcenter']"  v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"  closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                      </el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- 渲染三级权限 -->
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete-solid" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
      <el-dialog title="添加角色"
                 :visible.sync="addDialogVisible"
                 width="50%"
                 @close="addDialogClosed">
        <!-- 内容主体区 -->
        <el-form :model="addRole"
                  ref="addRoleRef"
                  label-width="70px">
          <el-form-item label="角色 ID"
                        prop="roleId">
            <el-input v-model="addRole.roleId"></el-input>
          </el-form-item>
          <el-form-item label="角色名称"
                        prop="roleName">
            <el-input v-model="addRole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        prop="roleDesc">
            <el-input v-model="addRole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addrole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色的对话框 -->
      <el-dialog title="修改用户"
                 :visible.sync="editDialogVisible"
                 width="50%">
        <el-form ref="editFormRef" :model="editForm" label-width="70px">
          <el-form-item label="角色 ID">
            <el-input v-model="editForm.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的对话框 -->
      <el-dialog title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%">
        <!-- 树形控件 -->
        <el-tree
          :data="rightList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef">
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 添加角色的表单数据
      addRole: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制添加用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的角色信息
      editForm: {},
      // 控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      // 所有权限的数组
      rightList: [],
      // 属性控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 即将分配权限的角色id
      roleId: []
    }
  },
  created() {
    // 获取角色列表
    this.getRolesList()
  },
  methods: {
    // 从数据库获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
    },
    // 添加角色
    async addrole() {
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRole)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    // 删除角色
    async deleteRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      // 重新刷新列表
      this.getRolesList()
    },
    // 点击编辑角色 展示修改角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色数据失败')
      this.editForm = res.data
      this.editDialogVisible = true
      console.log(this.editForm)
    },
    // 监听修改用户对话框的关闭事件
    showEditDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 确认提交角色
    async editRoleInfo() {
      const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
        roleName: this.editForm.roleName,
        roleDesc: this.editForm.roleDesc
      })
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('修改角色信息失败')
      }
      // 关闭编辑角色信息框
      this.editDialogVisible = false
      this.getRolesList()
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // this.getRolesList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限内容
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取所有权限失败')
      this.rightList = res.data
      // 递归获取三级节点的Id
      this.defKeys = []
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归方式，获取所有三级权限id
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性 则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配用户权限失败')
      this.$message.success('分配用户权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .myRolesBtn {
    display: flex;
  }
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbotton {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    // 实现纵向居中对齐
    align-items: center;
  }
</style>
