<template>
  <single-page class="paper-supplier">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        :loading="loading"
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

    <lock-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm" width="780px"
               :title="dialogTypeIsAdd?'新增原纸供应商': '编辑原纸供应商'">
      <div class="paper-supplier-dialog" v-loading="dialogLoading">
        <dj-form ref="form" :form-data="formData"
                 :form-options="formOptions" :column-num="2" :col-rule="colRule" ></dj-form>
      </div>
    </lock-dialog>
  </single-page>
</template>

<script>
  import paperSupplierService from '../../api/service/paperSupplier';
  import loadingMixins from '../../mixins/loading';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";
  const initFormData = {
    supplierNumber: null,
    supplierName: null,
    address: null,
    socialCreditCode: null,
    legalRepresentative: null
  };
  export default {
    name: 'paperSupplier',
    components: {PagePane},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '供应商编号', key: 'supplierNumber', type: 'input'},
          {label: '供应商', key: 'supplierName', type: 'input'},
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
                <div class="td-btn-group">
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ],
        formData: initFormData,
        originFormData: {},
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
              maxlength: 20,
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
              maxlength: 60
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'socialCreditCode',
              label: '社会信用代码',
              rules: [
                formRules.word_number
              ],
            },
            attrs: {
              maxlength: 18,
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
              maxlength: 30,
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
              maxlength: 200,
            },
          },
        ];
      }
    },
    methods: {
      colRule(item) {
        if (item.formItem.prop === 'address') {
          return 24;
        } else {
          return 12;
        }
      },
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      getList(page) {
        this.loading = true;
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(paperSupplierService.list, post).then((res) => {
          this.tableData = res.list || [];
          this.pageTotal = res.total;
        }).finally(() => {
          this.loading = false;
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dialogLoading = true;
        this.dj_api_extend(paperSupplierService.getSupplierById, {id: row.id}).then(res=>{
          this.formData = res;
          this.originFormData = this.$method.deepClone(res);
        }).finally(() => {
          this.dialogLoading = false;
        });
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          if (!this.$method.equalsObjMessage(this.originFormData, this.formData)) {
            this.dialogLoading = true;
            let message;
            let api;
            let post = this.formData;
            post.socialCreditCode = post.socialCreditCode || undefined;
            post.legalRepresentative = post.legalRepresentative || undefined;
            post.address = post.address || undefined;
            if (this.dialogTypeIsAdd) {
              message = '新增成功';
              api = paperSupplierService.add;
            } else {
              message = '编辑成功';
              api = paperSupplierService.edit;
              post.id = this.formData.id;
            }
            this.dj_api_extend(api, post).then(() => {
              this.close();
              this.$refs.table.updateData();
              this.$message(message, 'success');
              this.dialogLoading = false;
            }).catch(() => {
              this.dialogLoading = false;
            }).finally(cb);
          } else {
            cb();
          }
        }, cb);
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
  .paper-supplier-dialog {
    @{deep} .dj-form .el-form-item {
      .el-form-item__content {
        width: auto;
      }
    }
    @{deep} .el-col-24 {
      .dj-input-content {
        width: auto;
      }
    }
  }
</style>
