<template>
  <dj-dialog ref="dialog" @close="close" :title="dialogType==='stack_view'?'查看叠单规则': '查看打包规则'">
    <div class="rule-view" v-loading="viewLoading">
      <dj-grid-box :data="dialogType==='stack_view'?stackDetail: packDetail" :column-num="2"
                   :col-rule="()=>12" class="rule-view-header">
        <template slot-scope="{item}">
          <div class="rule-view-header-label">{{item.label}}： {{viewData[item.prop]}}</div>
        </template>
      </dj-grid-box>
      <div class="rule-view-content">
        <dj-table
          border
          :data="viewData.detailModels||viewData.packRuleDetails"
          :columns="viewTableColumns"
          :span-method="objectSpanMethod"
          :is-need-page="false"
        ></dj-table>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="close">关闭查看</el-button>
    </div>
  </dj-dialog>
</template>

<script>
  import ruleCustomizeService from '@/api/service/ruleCustomize';

  export default {
    name: 'ViewDialog',
    props: ['dialogType'],
    data() {
      return {
        viewTableColumns: [],
        viewData: {},
        viewLoading: false,
        stackDetail: [
          {prop: 'produceLineName', label: '生产线'},
          {prop: 'maxOrderCut', label: '订单最大片数'},
          {prop: 'maxStackHeight', label: '最小订单刀数'},
          {prop: 'maxStackCount', label: '最大堆叠单数'},
        ],
        packDetail: [
          {prop: 'eachPackWeight', label: '单批打包重量(Kg)'},
          {prop: 'aTilemodelRate', label: 'A楞型楞率'},
          {prop: 'bTilemodelRate', label: 'B楞型楞率'},
          {prop: 'cTilemodelRate', label: 'C楞型楞率'},
          {prop: 'eTilemodelRate', label: 'E楞型楞率'},
          {prop: 'fTilemodelRate', label: 'F楞型楞率'},
        ],
        kind: {

        }
      };
    },
    methods: {
      objectSpanMethod({row, column, rowIndex, columnIndex}) {
        if (columnIndex === 0) {
          if (row.tilemodel === item && rowIndex === this.kind[row.tilemodel]) {
            return {
              rowspan: this.kind[row.tilemodel],
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      },
      view(row) {
        this.$refs.dialog.open();
        this.viewLoading = true;
        let stack = [
          {label: '楞型', prop: 'tilemodel'},
          {label: '切数', prop: 'cut'},
          {label: '片数', prop: 'piece'},
        ];
        let pack = [
          {label: '层数', prop: 'layer'},
          {label: '单位面积（m²）', prop: 'endUnitarea', formatter: row => row.startUnitarea + '-' + row.endUnitarea},
          {label: '打包数量', prop: 'packpiece'},
        ];
        this.viewTableColumns = row.typeName === '叠单规则' ? stack : pack;
        ruleCustomizeService.getRuleDetail({
          ruleId: row.id
        }).then(res => {
          if (row.typeName === '叠单规则') {
            res.detailModels.map(v=>{
              if (this.kind[v.tilemodel] === undefined) {
                this.kind[v.tilemodel] = 1;
              } else {
                this.kind[v.tilemodel] += 1;
              }
            });
            this.viewData = res;
          } else {
            this.viewData = res;
          }

        }).finally(() => {
          this.viewLoading = false;
        });
      },
      close() {
        this.$emit('close');
      }
    },
  };
</script>

<style lang="less" scoped>
  .rule-view {
    width: 40vw;
    &-header {
      padding: 0 10px;
      color: #000;
      font-weight: bold;
      &-label {
        padding: 5px 20px;
        padding-left: 0;
      }
      &.stack {
        display: flex;
        justify-content: space-between;
      }
    }
    &-content {
      box-sizing: border-box;
      padding-right: 20px;
    }
  }
</style>
