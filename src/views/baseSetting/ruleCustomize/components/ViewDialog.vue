<template>
  <dj-dialog ref="dialog" @close="close" :has-footer="false" width="780px"
             :title="dialogType==='stack_view'?'查看叠单规则': '查看打包规则'">
    <div class="rule-view" v-loading="viewLoading">
      <dj-grid-box :data="dialogType==='stack_view'?stackDetail: packDetail" :column-num="2"
                   :col-rule="()=>12" class="rule-view-header">
        <template slot-scope="{item}">
          <div class="rule-view-header-item">
            <div class="header-item-label">{{item.label}}：</div>
            <div class="header-item-content">{{viewData[item.prop]}}</div>
          </div>
        </template>
      </dj-grid-box>
      <div class="rule-view-content">
        <dj-table
          border
          is-cache-columns
          :cache-columns-name="$store.getters.uids+'-'+ $route.name"
          :data="viewData.detailModels||viewData.packRuleDetails"
          :columns="viewTableColumns"
          :span-method="objectSpanMethod"
          :is-need-page="false"
        ></dj-table>
      </div>
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
          {prop: 'maxStackHeight', label: '订单最小米数'},
          {prop: 'maxStackCount', label: '最大堆叠单数'},
        ],
        packDetail: [
          {prop: 'eachPackWeight', label: '单批打包重量'},
          {prop: 'aTilemodelRate', label: 'A楞型楞率'},
          {prop: 'bTilemodelRate', label: 'B楞型楞率'},
          {prop: 'cTilemodelRate', label: 'C楞型楞率'},
          {prop: 'eTilemodelRate', label: 'E楞型楞率'},
          {prop: 'fTilemodelRate', label: 'F楞型楞率'},
        ],
        kind: {},
        position: 0,
        rowSpanArr: [],
      };
    },
    methods: {
      // 获取合并的数组
      getRowSpan() {
        this.rowSpanArr = [];
        const {packRuleDetails} = this.viewData;
        packRuleDetails.forEach((item, index) => {
          if (index === 0) {
            this.rowSpanArr.push(1);
            this.position = 0;
          } else {
            if (packRuleDetails[index].layer === packRuleDetails[index - 1].layer) {
              this.rowSpanArr[this.position] += 1; //项目名称相同，合并到同一个数组中
              this.rowSpanArr.push(0);
              packRuleDetails[index].layer = packRuleDetails[index - 1].layer;
            } else {
              this.rowSpanArr.push(1);
              this.position = index;
            }
          }
        });
      },
      objectSpanMethod({ row, rowIndex, columnIndex }) {
        if (this.dialogType === 'stack_view') {
            if (columnIndex === 0) {
              let num = this.kind[row.tilemodel || row.layer];
              if (rowIndex % num === 0) {
                return {
                  rowspan: num,
                  colspan: 1
                };
              } else {
                return {
                  rowspan: 0,
                  colspan: 0
                };
              }
            }
        } else {
          // 只合并区域位置
          if (columnIndex === 0) {
            const _row = this.rowSpanArr[rowIndex];
            return {
              rowspan: _row, //行
              colspan: 1 //列
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
          this.viewData = res;
          if (this.dialogType === 'stack_view') {
            res.detailModels.map(v=>{
              const key = v.tilemodel || v.layer;
              if (this.kind[key] === undefined) {
                this.kind[key] = 1;
              } else {
                this.kind[key] += 1;
              }
            });
          } else {
            this.getRowSpan();
          }
        }).finally(() => {
          this.viewLoading = false;
        });
      },
      close() {
        this.kind = {};
        this.$emit('close');
      }
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .rule-view {
    padding-top: 4px;//与距离scroll相加16px为20px
    &-header {
      padding: 0 10px;
      font-weight: bold;
      color: #000;
      &-item {
        display: flex;
        margin-bottom: 16px;
        line-height:22px;
        font-weight:400;
        .header-item-label{
          color:rgba(48,49,51,1);
          text-align: right;
          width: 98px;
        }
        .header-item-content{
          color:rgba(96,98,102,1);
          margin-left: 8px;
        }
      }
      &.stack {
        display: flex;
        justify-content: space-between;
      }
      @{deep} .el-row{
        .el-col.el-col-12:last-child{
          padding-left: 50px;
        }
      }
    }
    &-content {
      box-sizing: border-box;
      @{deep} .over-table{
        display: none;
      }
    }
  }
</style>
