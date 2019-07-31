<template>
  <div class="table-page paper-kind">
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :column-type="['index']"
      :total="pageTotal"
      @update-data="pageChange"
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
    code: '',
    type: '',
    kezhong: '',
  };
  export default {
    name: 'paperCode',
    data() {
      return {
        tableData: [],
        tableColumns: [
          {label: '原纸代码', prop: 'code'},
          {label: '原纸类型', prop: 'type'},
          {label: '克重（g）', prop: 'kezhong'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {label: '启用状态', prop: 'status',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.status ? '' : 'status-off'}>
                  {row.status ? '已启用' : '已禁用'}
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
                    {row.status ? '禁用' : '启用'}</a>
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
              prop: 'code',
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
                this.formData.code = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'type',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择相应的原纸类型')],
            },
            attrs: {
              options: [{
                label: '普通瓦楞',
                value: '1',
              }, {
                label: '高强瓦楞',
                value: '2',
              }, {
                label: '牛卡',
                value: '3',
              }, {
                label: '再生',
                value: '4',
              }],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'kezhong',
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
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
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
      getTableData(data) {
        paperCodeService.list(data).then((res) => {
          this.tableData = res.list;
          this.pageTotal = 100;
        });
      },
      changeStatus(row) {
        // 接口
        if (row.status) {
          this.$confirm('您确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            paperCodeService.list().then((res) => {
              this.$message('禁用成功', 'success');
              row.status = !row.status;
            });
          });
        } else {
          paperCodeService.list().then((res) => {
            this.$message('启用成功', 'success');
            row.status = !row.status;
          });
        }
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.formData = this.$method.deepClone(row);
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(data) {
        this.getTableData({
          ...data,
          ...this.pageOptions,
        });
      },
      confirm(data) {
        this.$refs.form.validate(()=>{
          paperCodeService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
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
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },

    },
    created() {
      this.getTableData();
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
