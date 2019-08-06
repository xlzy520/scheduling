<template>
  <div>
    <dj-dialog ref="dialog" @close="close" width="1160px" title="打印标签" @confirm="confirm">
      <p>请确认打印信息</p>
      <base-table ref="table"
                  :data="tableData"
                  height="500px"
                  :columns="tableColumns"
                  @selection-change="selectionChange"
                  :column-type="['selection', 'index']">
      </base-table>
    </dj-dialog>
    <print-tag ref="print" :data="printData"></print-tag>
  </div>
</template>
<script>
  import {cylinderKeys, paperKeys} from "../../../utils/system/constant/dataKeys";
  import printTag from './printTag';

  export default {
    name: 'printTagDialog',
    data: function () {
      return {
        tableColumns: [
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号'
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型',
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)'
          },
          {
            prop: paperKeys.paperCode,
            label: '原纸代码'
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)'
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)'
          },
        ],
        tableData: [],
        selectList: [],
        printData: []
      };
    },
    created() {
      this.tableData = [
        {
          paperTubeNumber: 'TD324234432424',
          paperType: 1,
          gram: 23,
          paperCode: '32456434323',
          paperSize: 1800,
          weight: 'sadasdgdwsww',
          paperSupplier: '高威'
        },
        {
          paperTubeNumber: 'TD000000000000',
          paperType: 2,
          gram: 63,
          paperCode: 'dsfdsfdsfery',
          paperSize: 2100,
          weight: '2334',
          paperSupplier: '高威2'
        },
        {
          paperTubeNumber: 'TD000000000000',
          paperType: 2,
          gram: 63,
          paperCode: 'dsfdsfdsfery',
          paperSize: 2100,
          weight: '2334',
          paperSupplier: '高威2'
        },
        {
          paperTubeNumber: 'TD000000000000',
          paperType: 2,
          gram: 63,
          paperCode: 'dsfdsfdsfery',
          paperSize: 2100,
          weight: '2334',
          paperSupplier: '高威2'
        },
        {
          paperTubeNumber: 'TD000000000000',
          paperType: 2,
          gram: 63,
          paperCode: 'dsfdsfdsfery',
          paperSize: 2100,
          weight: '2334',
          paperSupplier: '高威2'
        }
      ];
    },
    methods: {
      selectionChange(selectList) {
        this.selectList = selectList;
      },
      confirm() {
        if (this.selectList.length) {
          this.printData = this.selectList;
          this.$nextTick(()=>{
            this.$refs.print.print();
          });
        } else {
          this.$message('请选择需要打印的纸筒', 'error');
        }
      },
      open(param) {
        this.$refs.dialog.open();
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
    components: {printTag}
  };
</script>
