<template>
  <div class="page-pane">
    <div class="page-pane_absolute">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'pagePane'
  };
</script>
<style lang="less" scoped>
  .page-pane {
    margin: 14px 32px;
    flex: 1 1;
    position: relative;
    .page-pane_absolute {
      position: absolute;
      height: 100%;
      width: 100%;
    }
  }
</style>
