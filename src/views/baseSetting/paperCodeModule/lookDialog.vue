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
</style>
