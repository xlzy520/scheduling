<template>
    <div class="print-page" :style="style">
      <slot></slot>
    </div>
</template>
<script>
  export default {
    name: 'print-page',
    props: {
      horizontal: {
        type: String,
        default: 'center'
      },
      vertical: {
        type: String,
        default: 'center'
      },
    },
    computed: {
      style() {
        return {
          display: 'flex',
          justifyContent: this.horizontal,
          alignItems: this.vertical
        };
      }
    },
    data: function () {
      return {};
    },
    created() {
    },
    methods: {}
  };
</script>
<style lang="less" scoped>
  .print-page {
    height: 100%;
    page-break-after: always;
  }
</style>
