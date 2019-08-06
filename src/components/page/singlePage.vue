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
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
