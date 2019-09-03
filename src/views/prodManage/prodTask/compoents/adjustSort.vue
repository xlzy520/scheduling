<template>
  <dj-dialog title="调整排序" ref="dialog" @close="close" @confirm="orderSort" >
    <div v-loading="loading">
      <dj-form :form-data="formData" ref="form" :form-options="formOptions" ></dj-form>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  import formRules from "../../../baseSetting/formRules";
  import prodTaskService from '@/api/service/prodTask';
export default {
  name: 'adjustSort',
  data() {
    return {
      formData: {
        sort: ''
      },
      formOptions: [
        {
          type: 'input',
          formItem: {
            prop: 'paperGram',
            label: '订单排序',
            rules: [
              djForm.rules.required('请输入订单排序'),
              formRules.number,
              formRules.number5
            ],
          }
        },
      ],
      loading: false
    };
  },
  methods: {
    orderSort() {
      this.$refs.form.validate(()=>{
        this.loading = true;
        this.dj_api_extend(prodTaskService.processe, this.formData).then(() => {
          this.$message('调整排序成功', 'success');
          this.close();
          this.$emit('confirm');
        }).finally(() => {
          this.loading = false;
        });
      });
    },
    close () {
      this.$emit('close');
    },
    open() {
      this.$refs.dialog.open();
    }
  },
};
</script>

<style lang="less" scoped>

</style>
