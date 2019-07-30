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
    &-header{
      font-size: 18px;
      font-weight: bold;
      background: #fafafa;
      color: #666;
      padding: 20px;
    }
    &-content{
      padding: 20px 0 20px 10px;
    }
  }
</style>
