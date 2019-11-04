<template>
  <lock-dialog width="400px" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增原纸代码': '编辑原纸代码'">
    <div class="paper-kind-dialog" v-loading="dialogLoading">
      <dj-form ref="form" :form-data="formData" :form-options="formOptions" :column-num="1"></dj-form>
    </div>
  </lock-dialog>
</template>
<script>
  import paperCodeService from '@/api/service/paperCode';
  import formRules from "../formRules";

  const initFormData = {
    paperCode: null,
    paperType: null,
    paperGram: null,
  };
  export default {
    name: 'lookDialog',
    data () {
      return {
        dialogLoading: false,
        optionalPaper: [],
        formData: initFormData,
        originFormData: {},
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'paperCode',
              label: '原纸代码',
              rules: [
                this.$rule.required('请输入原纸代码'),
                formRules.word_number
              ],
            },
            attrs: {
              maxlength: 10,
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
              rules: [this.$rule.required('请选择原纸类型')],
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
                this.$rule.required('请输入克重'),
                formRules.number,
                formRules.number5
              ],
            },
            attrs: {
              placeholder: '请输入该原纸最大克重',
              suffixIcon: "g"
            },
          },
        ],
        dialogTypeIsAdd: false
      };
    },
    methods: {
      open(isAdd, row) {
        this.$refs.dialog.open();
        if (!isAdd) {
          this.dialogLoading = true;
          this.dj_api_extend(paperCodeService.getPaperCodeByid, {id: row.id}).then(res=>{
            this.formData = res;
            this.originFormData = this.$method.deepClone(res);
          }).finally(() => {
            this.dialogLoading = false;
          });
        }
        this.dialogTypeIsAdd = isAdd;
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          if (!this.$method.equalsObjMessage(this.originFormData, this.formData)) {
            this.dialogLoading = true;
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
            post = this.$method.handleFormDataStartOrEndByZero(post, ['paperGram'], true);
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
        this.formData = initFormData;
        this.$refs.dialog.close();
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
