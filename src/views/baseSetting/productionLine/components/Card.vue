<template>
  <div class="bs-card">
    <div class="bs-card-header">{{title}}</div>
    <div class="bs-card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="less" scoped>
  .bs-card{
    width: 100%;
    font-size: 14px;
    &-header{
      font-family:PingFang SC Medium,sans-serif;
      font-weight:500;
      background: #fafafa;
      color: #606266;
      padding: 15px;
    }
    &-content{
      padding: 20px 0 20px 10px;
      color: #606266;
    }
  }
</style>
