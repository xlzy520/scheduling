<template>
  <lock-dialog  width="780px" ref="dialog" @close="close" @confirm="confirm"
                :title="dialogTypeIsAdd?'新增原纸供应商': '编辑原纸供应商'">
    <div class="paper-supplier-dialog" v-loading="dialogLoading">
      <dj-form ref="form" :form-data="formData"
               :form-options="formOptions" :column-num="2" :col-rule="colRule" ></dj-form>
    </div>
  </lock-dialog>
</template>
<script>
  import paperSupplierService from '@/api/service/paperSupplier';

  export default {
    name: 'lookDialog',
    data () {
      return {
        dialogLoading: false,
        formData: {},
        originFormData: {},
        dialogTypeIsAdd: false
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
                this.$rule.required('请输入供应商编号'),
                this.$rule.word_number
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
                this.$rule.required('请输入供应商名称'),
                this.$rule.word_number_chinese
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
                this.$rule.word_number
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
                this.$rule.chinese
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
                this.$rule.word_number_chinese
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
      open(isAdd, row) {
        this.$refs.dialog.open();
        if (!isAdd) {
          this.dialogLoading = true;
          this.dj_api_extend(paperSupplierService.getSupplierById, {id: row.id}).then(res=>{
            this.formData = res;
            this.originFormData = this.$method.deepClone(res);
          }).finally(() => {
            this.dialogLoading = false;
          });
        }
        this.dialogTypeIsAdd = isAdd;
      },
      colRule(item) {
        if (item.formItem.prop === 'address') {
          return 24;
        } else {
          return 12;
        }
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
              this.$message(message, 'success');
              this.dialogLoading = false;
              this.$emit('confirm');
              this.close();
            }).catch(() => {
              this.dialogLoading = false;
            }).finally(cb);
          } else {
            cb();
          }
        }, cb);
      },
      close() {
        this.$refs.form.resetFields();
        this.$refs.dialog.close();
        this.formData = {};
        this.$emit('close');
      },
    }
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
