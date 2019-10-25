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
  @deep: ~'>>>';
  .bs-card {
    width: 100%;
    font-size: 14px;
    line-height: 20px;
    &-header {
      padding: 17px;
      color: #606266;
      background: #fafafa;
      font-weight:600;
      line-height:20px;
    }
    &-content {
      padding: 24px 0 30px 16px;
      color: #606266;
      @{deep} .el-row {
        margin-bottom: 16px;
      }
    }
  }
</style>
