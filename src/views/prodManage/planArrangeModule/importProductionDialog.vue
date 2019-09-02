<template>
  <dj-dialog ref="dialog" @close="close" title="生产订单列表" width="800px">
    <div class="production-line">
      <span>选择生产线</span>
      <div :class="['line-box', line.id === checkedLine.id ? 'active' : ''] " v-for="line in prodLines" :key="line.id" @click="changeLine(line)">
        {{line.name}}
      </div>
    </div>
    <div class="transfer-wrap">
      <el-transfer v-model="checkedData[checkedLine.id]" :data="checkableMaterialData" @change="change"></el-transfer>
    </div>
  </dj-dialog>
</template>
<script>
  export default {
    name: 'importProductionDialog',
    data: function () {
      return {
        allMaterialData: [
          {
            key: '1',
            label: '备选项1',
            disabled: false
          },
          {
            key: '2',
            label: '备选项2',
            disabled: false
          },
          {
            key: '3',
            label: '备选项3',
            disabled: false
          }
        ],
        // checkableMaterialData: [],
        checkedLine: {},
        checkedData: {},
        prodLines: [
          {
            name: '一号线',
            id: 'line1'
          },
          {
            name: '二号线',
            id: 'line2'
          },
          {
            name: '三号线',
            id: 'line3'
          },
          {
            name: '四号线',
            id: 'line4'
          }
        ]
      };
    },
    computed: {
      checkableMaterialData() {
        let checkedId = {};
        Object.keys(this.checkedData).forEach(key=>{
          if (key !== 'undefined' && this.checkedLine.id !== key) {
            let ids = this.checkedData[key];
            Array.isArray(ids) && ids.forEach(id=>{
              checkedId[id] = true;
            });
          }
        });
        // console.log('checkedId', checkedId);
        return this.allMaterialData.filter(item=>!checkedId[item.key]);
      }
    },
    created() {
      this.change();
    },
    methods: {
      changeLine(line) {
        this.checkedLine = line;
      },
      change() {
        // console.log(this.checkedData);
        // let checkedId = {};
        // Object.keys(this.checkedData).forEach(key=>{
        //   if (key !== 'undefined') {
        //     let ids = this.checkedData[key];
        //     Array.isArray(ids) && ids.forEach(id=>{
        //       checkedId[id] = true;
        //     });
        //   }
        // });
        // this.checkableMaterialData = this.allMaterialData.filter(item=>!checkedId[item.key]);
        // console.log(this.checkableMaterialData)
        // console.log(checkedId);
      },
      open() {
        this.$refs.dialog.open();
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
<style lang="less" scoped>
  .line-box {
    cursor: pointer;
    display: inline-block;
    margin-left: 10px;
    border: 1px solid gray;
    padding: 5px;
    &.active {
      border: 1px solid deepskyblue;
    }
  }
</style>
