<template>
  <div class="paper-supplier">
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
               :title="dialogTypeIsAdd?'新增原纸供应商': '编辑原纸供应商'">
      <div class="paper-supplier-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import paperSupplierService from '../../api/service/paperSupplier';
  import {djForm} from 'djweb';

  export default {
    name: 'paperSupplier',
    data() {
      return {
        searchConfig: [
          {label: '供应商编号：', key: 'num', type: 'input'},
          {label: '供应商名称：', key: 'name', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '供应商编号', prop: 'num'},
          {label: '供应商名称', prop: 'name'},
          {label: '地址', prop: 'address', width: 200},
          {label: '社会信用代码', prop: 'code'},
          {label: '法人代表', prop: 'legalRepresentative'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        formData: {
          num: '',
          name: '',
          address: '',
          code: '',
          legalRepresentative: ''
        },
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 100,
        dialogTypeIsAdd: null,
        dialogVisible: false
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: 'num',
              label: '供应商编号:',
              rules: [
                djForm.rules.required('供应商编号不能为空'),
                {pattern: /^\w+$/g, message: '只可输入数字、字符'},
              ],
            },
            attrs: {
              maxLength: 20,
              disabled: !this.dialogTypeIsAdd
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '供应商名称:',
              rules: [
                djForm.rules.required('供应商名称不能为空'),
                {pattern: /^\w+$/g, message: '只可输入数字、字符、汉字'},
              ],
            },
            attrs: {
              maxLength: 60,
              disabled: !this.dialogTypeIsAdd
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'address',
              label: '地址:',
              rules: [
                {pattern: /^\w+$/g, message: '只可输入数字、字符、汉字'},
              ],
            },
            attrs: {
              maxLength: 200,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'code',
              label: '社会信用代码:',
              rules: [
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              maxLength: 15,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'legalRepresentative',
              label: '法人代表:',
              rules: [
                {pattern: /^\w+$/g, message: '只可输入汉字', trigger: 'change'}
              ],
            },
            attrs: {
              maxLength: 30,
            },
          },
        ];
      }
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
        paperSupplierService.list(data).then((res) => {
          this.tableData = res.list;
        });
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
            paperSupplierService.list(data).then((res) => {
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
  .paper-supplier {
    .search {
      position: relative;
      height: 150px;
      overflow: hidden;
    }
  }

  @{deep} .operation {
    a {
      margin-right: 15px;
      cursor: pointer;
    }
  }

  .paper-supplier-dialog {
    width: 50vw;
    @{deep} .dj-form .el-form-item{
      width: 70%;
    }
  }
</style>
