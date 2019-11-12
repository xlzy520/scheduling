<template>
  <dj-select :value="value"
             collapse-tags
             type="multiple"
             :filterable="true"
             :options="$enum.fluteType"
             v-bind="$attrs"
             @input="input"
  ></dj-select>
</template>
<script>
  export default {
    name: 'fluteTypeSelect',
    props: ['value'],
    data: function () {
      return {};
    },
    created() {
    },
    methods: {
      input(arr) {
        let realArr;
        let lastValue = arr[arr.length - 1];
        if (lastValue === 'all') {
          realArr = [lastValue];
        } else {
          realArr = arr.filter(val => val !== 'all');
        }
        if (!arr.length) {
          realArr = ['all'];
        }
        this.$emit('input', realArr);
      }
    }
  };
</script>
<style lang="less" scoped>
  /deep/ .el-select__tags{
    display: flex;
    &>span{
      width: auto;
    }
  }
  /deep/ .el-input__inner {
    height: 32px !important;
  }
</style>
