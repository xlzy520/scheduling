<template>
  <mc-el-select
    :style="{width: width+'px'}"
    :value="query"
    :multiple="type === 'multiple'"
    v-bind="getBind()"
    :class="getSelectWrapClass()"
    v-on="filterListeners"
    @input="valueChange">
    <el-option
      v-for="item in options_"
      v-bind="subAtrrs"
      :key="getLabel(item) + getValue(item)"
      :label="getLabel(item)"
      :value="getValue(item)"
      :disabled="item.disabled"></el-option>
  </mc-el-select>
</template>

<script>
  import McElSelect from "./McElSelect.vue";
  import { djSelect} from 'djweb';
  export default {
    extends: djSelect,
    name: 'McDjSelect',
    components: {
      McElSelect,
    }
  };
</script>
