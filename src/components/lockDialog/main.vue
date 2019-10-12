<template>
  <dj-dialog ref="dialog" v-bind="$attrs" v-on="$listeners">
    <!--<slot></slot>-->
    <div v-if="!($slots.footer || $slots['footer-confirm'])" slot="footer">
      <el-button :loading="isLoading" @click="closeCallback">取 消</el-button>
      <el-button :loading="isLoading" type="primary" @click="confirmCallback">确 认</el-button>
    </div>
    <template v-for="name in Object.keys($slots)" :slot="name">
      <slot :name="name"></slot>
    </template>
  </dj-dialog>
</template>
<script>
  export default {
    name: 'lockDialog',
    data: function () {
      return {
        isLoading: false
      };
    },
    created() {
    },
    methods: {
      open() {
        this.$refs.dialog.open();
      },
      close() {
        this.$refs.dialog.close();
      },
      closeCallback() {
        this.$emit('close');
      },
      confirmCallback() {
        this.isLoading = true;
        this.$emit('confirm', ()=>{
          this.isLoading = false;
        });
      },
    }
  };
</script>
<style lang="less" scoped>

</style>
