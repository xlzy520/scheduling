<template>
  <div class="table-page paper-kind">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
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
               :title="dialogTypeIsAdd?'新增原纸品种': '编辑原纸品种'">
      <div class="paper-kind-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import paperKindService from '../../../api/service/paperKind';
  import {djForm} from 'djweb';

  export default {
    name: 'paperKind',
    data() {
      return {
        searchConfig: [
          {label: '原纸编号：', key: 'num', type: 'input'},
          {label: '原纸代码：', key: 'code', type: 'input'},
          {label: '门幅：', key: 'menfu', type: 'input', attrs: {type: 'number'}},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '原纸编号', prop: 'num'},
          {label: '原纸代码', prop: 'code'},
          {label: '原纸类型', prop: 'type'},
          {label: '克重（g）', prop: 'kezhong'},
          {label: '门幅（mm）', prop: 'menfu'},
          {label: '仓库名称', prop: 'warehouseName'},
          {label: '库区名称', prop: 'warehouseAreaName'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {label: '启用状态', prop: 'status', formatter: row => row.status ? '启用' : '禁用'},
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
        ]),
        formData: {
          num: '',
          code: '',
          type: '',
          kezhong: '',
          menfu: '',
          warehouseName: '',
          warehouseAreaName: '',
        },
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'num',
              label: '原纸编号',
              rules: [
                djForm.rules.required('原纸编号不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 5,
            },
            listeners: {
              'input': (val) => {
                this.formData.num = val.toUpperCase();
              },
            },
          },
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
                value: 'chu',
              }, {
                label: '高强瓦楞',
                value: 'gao',
              }, {
                label: '牛卡',
                value: 'da',
              }, {
                label: '再生',
                value: 'daa',
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
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu',
              label: '门幅',
              rules: [
                djForm.rules.required('门幅不能为空'),
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
                ],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseName',
              label: '仓库名称',
              rules: [
                djForm.rules.required('请选择相应的仓库名称'),
                ],
            },
            attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaName',
              label: '库区名称',
              rules: [
                djForm.rules.required('请选择相应的库区名称'),
                ],
            },
            attrs: {
              options: [{
                label: '原纸1号仓库',
                value: 'chu',
              }, {
                label: '原纸2号仓库',
                value: 'gao',
              }, {
                label: '原纸3号仓库',
                value: 'da',
              }],
            },
          },
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 100,
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
        paperKindService.list(data).then((res) => {
          this.tableData = res.list;
        });
      },
      changeStatus(row) {
        // 接口
        if (row.status) {
          this.$confirm('您确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            paperKindService.list().then((res) => {
              this.$message('禁用成功', 'success');
              row.status = !row.status;
            });
          });
        } else {
          paperKindService.list().then((res) => {
            this.$message('启用成功', 'success');
            row.status = !row.status;
          });
        }
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.formData = row;
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
        this.$refs.form.validate(valid=>{
          if (valid) {
            paperKindService.list(data).then((res) => {
              this.close();
              const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
              this.$message(message, 'success');
            });
          }
        });
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.$refs.form.resetFields();
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
    a {
      margin-right: 15px;
      cursor: pointer;
    }
  }

  .paper-kind-dialog {
    width: 50vw;
  }
</style>
