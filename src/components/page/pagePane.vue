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
    position: relative;
    margin: 14px 32px;
    flex: 1 1;
    .page-pane_absolute {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
</style>
