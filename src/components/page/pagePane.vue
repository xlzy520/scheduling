<template>
  <div :class="['page-pane', isMargin ? 'is-margin' : '']">
    <div class="page-pane_absolute">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'pagePane',
    props: {
      isMargin: {
        type: Boolean,
        default: true
      }
    }
  };
</script>
<style lang="less" scoped>
  .page-pane {
    position: relative;
    flex: 1 1;
    &.is-margin {
      margin: 0 32px;
    }
    .page-pane_absolute {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
</style>
