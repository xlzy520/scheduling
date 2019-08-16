<template>
  <single-page class="paper-supplier">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        :columns="tableColumns"
        :column-type="['index']"
        :total="pageTotal" height="100%"
        @update-data="getList"
      >
        <div slot="btn">
          <el-button type="primary" @click="add">新增</el-button>
        </div>
      </dj-table>
    </page-pane>

    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增原纸供应商': '编辑原纸供应商'">
      <div class="paper-supplier-dialog">
        <dj-form ref="form" :form-data="formData" labelWidth="120px"
                 :form-options="formOptions" :column-num="2"></dj-form>
      </div>
    </dj-dialog>
  </single-page>
</template>

<script>
  import paperSupplierService from '../../api/service/paperSupplier';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";
  const { rules } = djForm;
  const initFormData = {
    supplierNumber: '',
    supplierName: '',
    address: '',
    socialCreditCode: '',
    legalRepresentative: ''
  };
  export default {
    name: 'paperSupplier',
    components: {PagePane},
    data() {
      return {
        searchConfig: [
          {label: '供应商编号', key: 'supplierNumber', type: 'input'},
          {label: '供应商名称', key: 'supplierName', type: 'input'},
        ],
        tableData: [],
        tableColumns: [
          {label: '供应商编号', prop: 'supplierNumber'},
          {label: '供应商名称', prop: 'supplierName'},
          {label: '地址', prop: 'address', width: 200},
          {label: '社会信用代码', prop: 'socialCreditCode'},
          {label: '法人代表', prop: 'legalRepresentative'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
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
        ],
        formData: initFormData,
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        searchData: {}
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: 'supplierNumber',
              label: '供应商编号',
              rules: [
                djForm.rules.required('请输入供应商编号'),
                formRules.word_number
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
              prop: 'supplierName',
              label: '供应商名称',
              rules: [
                djForm.rules.required('请输入供应商名称'),
                formRules.word_number_chinese
              ],
            },
            attrs: {
              maxLength: 60
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'socialCreditCode',
              label: '社会信用代码',
              rules: [rules.required('请输入社会信用代码')],
            },
            attrs: {
              maxLength: 18,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'legalRepresentative',
              label: '法人代表',
              rules: [
                formRules.chinese
              ],
            },
            attrs: {
              maxLength: 30,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'address',
              label: '地址',
              rules: [
                formRules.word_number_chinese
              ],
            },
            attrs: {
              maxLength: 200,
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
      getList(page) {
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(paperSupplierService.list, post).then((res) => {
          this.tableData = res.list || [];
          this.pageTotal = res.total;
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dj_api_extend(paperSupplierService.getSupplierById, {id: row.id}).then(res=>{
          this.formData = res;
        });
        // this.formData = this.$method.deepClone(row);
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      confirm() {
        this.$refs.form.validate(()=>{
          let message;
          let api;
          let { supplierNumber, supplierName, address, socialCreditCode, legalRepresentative } = this.formData;
          let post = { supplierNumber, supplierName, address, socialCreditCode, legalRepresentative };
          if (this.dialogTypeIsAdd) {
            message = '新增成功';
            api = paperSupplierService.add;
          } else {
            message = '编辑成功';
            api = paperSupplierService.edit;
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
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.$refs.form.resetFields();
        this.formData = initFormData;
      },
    },
    mounted() {
      this.$refs.search.search();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .operation {
    a {
      cursor: pointer;
    }
  }

  .paper-supplier-dialog {
    width: 60vw;
    padding-top: 20px;
    @{deep} .dj-form .el-form-item{
      .el-form-item__content{
        width: auto;
      }
    }
  }
</style>
