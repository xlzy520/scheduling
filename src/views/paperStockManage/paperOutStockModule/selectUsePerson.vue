<template>
    <dj-dialog ref="dialog" @close="close" width="700px" title="选择责任部门/责任人" @confirm="confirm">
      <el-tree :data="data" @node-click="handleNodeClick"></el-tree>
    </dj-dialog>
</template>
<script>
  export default {
    name: 'selectUsePerson',
    data: function () {
      return {
        data: []
      };
    },
    created() {
    },
    methods: {
      confirm() {
      },
      open(param) {
        this.$refs.dialog.open();
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      handleNodeClick() {

      }
    }
  };
</script>
