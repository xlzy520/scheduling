<template>
  <div :class="['table-controls-box', disabled ? 'is-disabled' : '']">
    <p class="table-controls-box__text" v-show="!value" @click="handleClick">{{label}}</p>
    <slot v-if="value"></slot>
  </div>
</template>
<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';

  export default {
    name: 'tableControlsBox',
    directives: { Clickoutside },
    props: {
      disabled: {},
      label: {},
      value: {
        type: Boolean,
        default: false
      }
    },
    data: function () {
      return {};
    },
    created() {
    },
    methods: {
      handleClose() {
        console.log('blur');
        this.$emit('blur');
      },
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

