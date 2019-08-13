<template>
  <dj-input-group>
    <dj-input v-for="num in 7" :value="value[num - 1]" @input="(val)=>input(val, num - 1)"></dj-input>
  </dj-input-group>
</template>
<script>
  import djInputGroup from './djInputGroup';
  export default {
    name: 'longitudinalPressureInput',
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
