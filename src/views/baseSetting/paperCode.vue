<template>
  <div class="table-page paper-kind">
    <dj-table
      ref="table"
      :data="tableData"
      :columns="tableColumns"
      :column-type="['index']"
      :total="pageTotal"
      @update-data="getList"
    >
      <div slot="btn">
        <el-button type="primary" @click="add">新增</el-button>
      </div>
    </dj-table>
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增原纸代码': '编辑原纸代码'">
      <div class="paper-kind-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions" :column-num="1"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import paperCodeService from '../../api/service/paperCode';
  import {djForm} from 'djweb';
  const initFormData = {
    paperCode: '',
    paperType: '',
    paperGram: '',
  };
  export default {
    name: 'paperCode',
    data() {
      return {
        tableData: [],
        tableColumns: [
          {label: '原纸代码', prop: 'paperCode'},
          {label: '原纸类型', prop: 'paperTypeName'},
          {label: '克重（g）', prop: 'paperGram'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.isEffected ? '' : 'status-off'}>
                  {row.isEffected ? '已启用' : '已禁用'}
                </div>
              );
            }
          },
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.isEffected ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ],
        formData: initFormData,
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'paperCode',
              label: '原纸代码',
              rules: [
                djForm.rules.required('原纸代码不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.formData.paperCode = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'paperType',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择相应的原纸类型')],
            },
            attrs: {
              options: this.$enum.paperType._arr
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'paperGram',
              label: '克重',
              rules: [
                djForm.rules.required('克重不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
                ],
            },
            attrs: {
              type: 'number',
            },
          },
        ],
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false
      };
    },
    methods: {
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      getList(page) {
        this.dj_api_extend(paperCodeService.list, page).then((res) => {
          let list = res.list || [];
          list.forEach(obj=>{
            obj.paperTypeName = this.$enum.paperType._swap[obj.paperType] && this.$enum.paperType._swap[obj.paperType].label;
          });
          this.tableData = list;
          this.pageTotal = res.total;
        });
      },
      changeStatus(row) {
        // 接口
        let post = {
          id: row.id,
          effected: row.isEffected ? 0 : 1,
        };
        if (row.isEffected) {
          this.$confirm('确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.dj_api_extend(paperCodeService.changeEffected, post).then((res) => {
              this.$message('禁用成功', 'success');
              row.isEffected = !row.isEffected;
            });
          });
        } else {
          this.dj_api_extend(paperCodeService.changeEffected, post).then((res) => {
            this.$message('禁用成功', 'success');
            row.isEffected = !row.isEffected;
          });
        }
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dj_api_extend(paperCodeService.getPaperCodeByid, {id: row.id}).then(res=>{
          this.formData = res;
        });
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      confirm() {
        this.$refs.form.validate(()=>{
          let message;
          let api;
          let post = {
            paperCode: this.formData.paperCode,
            paperType: this.formData.paperType,
            paperGram: this.formData.paperGram,
          };
          if (this.dialogTypeIsAdd) {
            message = '新增成功';
            api = paperCodeService.add;
          } else {
            message = '编辑成功';
            api = paperCodeService.edit;
            post.id = this.formData.id;
          }
          this.dj_api_extend(api, post).then((res) => {
            this.close();
            this.$refs.table.updateData();
            this.$message(message, 'success');
          });
        });
      },
      close() {
        this.$refs.form.resetFields();
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.formData = initFormData;
      },
    },
    mounted() {
      this.$refs.table.changePage(1);
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .operation {
    line-height: 1;
    a {
      padding: 2px 10px;
      cursor: pointer;
      &:not(:last-child){
        border-right: 1px solid #f0f2f5;
      }
    }
  }
  @{deep} .status-off{
    color: #afb1b5;
  }

  .paper-kind-dialog {
    padding-top: 20px;
  }
</style>
