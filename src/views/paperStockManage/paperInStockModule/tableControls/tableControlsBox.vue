<template>
  <div :class="['table-controls-box', disabled ? 'is-disabled' : '']">
    <p class="table-controls-box__text" v-show="!value" @click="handleClick">{{label}}</p>
    <slot v-if="value"></slot>
  </div>
</template>
<script>
  export default {
    name: 'tableControlsBox',
    props: {
      disabled: {},
      label: {},
      value: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      handleClick() {
        if (!this.disabled) {
          this.$emit('focus');
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .table-controls-box {
    height: 34px;
    &.is-disabled {
      cursor: not-allowed;
      color: #909399;
    }
  }
  .table-controls-box__text {
    height: 100%;
  }
</style>

