<template>
  <div class="table-page production-line">
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增原纸品种': '编辑原纸品种'">
      <div class="production-line-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import productionLineService from '../../api/service/productionLine';
  import {djForm} from 'djweb';

  export default {
    name: 'productionLine',
    data() {
      return {
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
        productionLineService.list(data).then((res) => {
          this.tableData = res.list;
          this.pageTotal = 100
        });
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
          productionLineService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
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

  .production-line-dialog {
    width: 50vw;
  }
</style>
