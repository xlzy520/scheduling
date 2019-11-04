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
  import formRules from "../formRules";

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
                this.$rule.required('请输入供应商名称'),
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
  .material-code-dialog {
    @{deep} .dj-form .el-form-item {
      .el-form-item__label {
        float: unset;
      }
      .el-select.code {
        width: 100%;
        pointer-events: none;
      }
      .el-form-item__content {
        width: 100%;
        margin-left: 0 !important;
      }
      .el-input__suffix {
        display: none;
      }
      .el-select__tags .el-tag .el-tag__close {
        pointer-events: visible;
      }
      .el-select__tags-text {
        pointer-events: none;
        user-select: none;
      }
    }
    @{deep} .optional {
      width: 100%;
      margin-bottom: 20px;
      &-label {
        padding: 0 12px 0 0;
        margin: 0;
        font-size: 14px;
        line-height: 34px;
        color: #606266;
      }
      &-area {
        display: flex;
        height: 192px;
        padding-bottom: 10px;
        overflow-y: scroll;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        flex-wrap: wrap;
        align-content: flex-start;
        &-item {
          height: 24px;
          min-width: 50px;
          padding: 0 11px;
          margin-top: 12px;
          margin-left: 10px;
          font-size: 12px;
          line-height: 24px;
          color: #606266;
          text-align: center;
          cursor: pointer;
          background: #f0f2f5;
          border-radius: 3px;
          user-select: none;
        }
      }
    }
  }
</style>
