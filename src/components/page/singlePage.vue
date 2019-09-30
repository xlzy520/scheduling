<template>
    <div class="single-page">
      <slot></slot>
    </div>
</template>
<script>
  export default {
    name: 'singlePage'
  };
</script>
<style lang="less" scoped>
  .single-page {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: auto;
    flex-direction: column;
  }
</style>
