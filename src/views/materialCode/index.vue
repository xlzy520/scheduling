<template>
  <div class="paper-kind">
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
    <dj-dialog ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增用料代码': '编辑用料代码'">
      <div class="paper-kind-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import materialCodeService from '../../api/service/materialCode';

  export default {
    name: 'materialCode',
    data() {
      return {
        searchConfig: [
          {label: '用料代码：', key: 'code', type: 'input'},
          {label: '平台材料名称：', key: 'platformMaterialName', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '用料代码', prop: 'code'},
          {label: '平台材料名称', prop: 'platformMaterialName'},
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
        formOptions: Object.freeze([
          {
            type: 'input',
            formItem: {
              prop: 'num',
              label: '用料编号',
              rules: [
                {required: true, message: '用料编号不能为空', trigger: 'change'},
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
              label: '用料代码',
              rules: [
                {required: true, message: '用料代码不能为空', trigger: 'change'},
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 10,
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'type',
              label: '用料类型',
              rules: [{required: true, message: '请选择相应的用料类型', trigger: 'change'}],
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
                {required: true, message: '克重不能为空', trigger: 'change'},
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu',
              label: '门幅',
              rules: [
                {required: true, message: '门幅不能为空', trigger: 'change'},
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseName',
              label: '仓库名称',
              rules: [{required: true, message: '请选择相应的仓库名称', trigger: 'change'}],
            },
            attrs: {
              options: [{
                label: '丽岙用料仓库1',
                value: 'chu',
              }, {
                label: '丽岙用料仓库2',
                value: 'gao',
              }, {
                label: '丽岙用料仓库3',
                value: 'da',
              }],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaName',
              label: '库区名称',
              rules: [{required: true, message: '请选择相应的库区名称', trigger: 'change'}],
            },
            attrs: {
              options: [{
                label: '用料1号仓库',
                value: 'chu',
              }, {
                label: '用料2号仓库',
                value: 'gao',
              }, {
                label: '用料3号仓库',
                value: 'da',
              }],
            },
          },
        ]),
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 100,
        dialogTypeIsAdd: null,
      };
    },
    methods: {
      add() {
        this.dialogTypeIsAdd = true;
        this.$refs.dialog.open();
      },
      getTableData(data) {
        materialCodeService.list(data).then((res) => {
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
            materialCodeService.list().then((res) => {
              this.$message('禁用成功', 'success');
              row.status = !row.status;
            });
          });
        } else {
          materialCodeService.list().then((res) => {
            this.$message('启用成功', 'success');
            row.status = !row.status;
          });
        }
      },
      edit(row) {
        this.dialogTypeIsAdd = false;
        this.formData = row;
        this.$refs.dialog.open();
      },
      search(data) {
        this.getTableData({
          ...data,
          ...this.pageOptions,
        });
      },
      confirm(data) {
        if (this.$refs.form.validate()) {
          materialCodeService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        }
      },
      close() {
        this.$refs.dialog.close();
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
  .paper-kind {
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

  .paper-kind-dialog {
    width: 50vw;
  }
</style>
