<template>
  <dj-input-group connector="-">
    <dj-input placeholder="切长cm" :value="value[0]" @input="(val)=>input(val, 0)"></dj-input>
    <dj-input placeholder="切宽cm" :value="value[1]" @input="(val)=>input(val, 1)"></dj-input>
  </dj-input-group>
</template>
<script>
  import djInputGroup from './djInputGroup';
  export default {
    name: 'materialSizeInput',
    props: {
      value: {
        type: Array,
        default: () => []
      }
    },
    data: function () {
      return {};
    },
    created() {
    },
    methods: {
      input(val, key) {
        let _value = [...this.value];
        _value[key] = val;
        this.$emit('input', _value);
        this.$emit('change', _value);
      }
    },
    components: {djInputGroup}
  };
</script>
<style lang="less" scoped>
</style>
