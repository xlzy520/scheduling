<template>
  <dj-dialog ref="dialog" @close="close" title="查看详情" width="400px" :has-footer="false">
    <div class="dialog" style="height: 355px;">
      <classify-form ref="form" :form-data="formData" :config="[{formOptions}]"
                     :column-num="1" labelWidth="152px"></classify-form>
    </div>
  </dj-dialog>
</template>
<script>
  export default {
    name: 'lookDialog',
    data () {
      return {
        dialogLoading: false,
        formOptions: [
          {formItem: {prop: 'platformMaterialCode', label: '平台材料名称：'}},
          {formItem: {prop: 'dassdsa', label: '平台1料名称：'}},
        ],
        formData: {
          platformMaterialCode: 1000,
          dassdsa: 20000
        }
      };
    },
    methods: {
      open(detail) {
        this.$refs.dialog.open();
        const realContent = detail.substring(detail.indexOf('】') + 1, detail.length - 1);
        const items = realContent.split(';');
        const formDataItemArray = items.map(v=>v.split(':'));
        this.formData = this.$method.fromEntries(formDataItemArray);
        this.formOptions = formDataItemArray.map(v=>{
          return {formItem: {prop: v[0], label: v[0] + '：'}};
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
    }
  };
</script>
<style lang="less" scoped>
</style>
