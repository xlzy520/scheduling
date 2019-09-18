<template>
    <div class="paper-button">
      <el-popover
        placement="bottom"
        width="626"
        @show="show"
        trigger="click">
        <div class="title clearfix">
          <span class="fl">原纸库存</span>
          <a class="fr operate" @click="retract">收起</a>
        </div>
        <p class="line"></p>
        <div v-loading="isLoading" class="paper-button-content">
          <el-collapse ref="collapse" accordion @change="">
            <el-collapse-item v-for="item in paperSize_arr" :name="item[paperKeys.paperSize]">
              <template slot="title">
                <a class="operate disabled-button" @click.stop="changeEffect(item)">{{judgeEffect(item) ? '禁用' : '启用'}}</a>
                <span class="paper-size-text">{{item[paperKeys.paperSize]}}</span>
              </template>
              <base-table :cell-class-name="cellClassName" :data="item.tableData" :columns="tableColumns"></base-table>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-button type="primary" slot="reference">原纸库存</el-button>
      </el-popover>
    </div>
</template>
<script>
  import { orderKeys, cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import planArrangeService from "../../../api/service/planArrange";

  export default {
    name: 'paperButton',
    props: {
      value: {
        type: Array,
        default: ()=>[]
      }
    },
    computed: {
      value_map() {
        return this.value.reduce((map, str)=>{
          map[str] = true;
          return map;
        }, {});
      }
    },
    data: function () {
      return {
        paperKeys,
        paperSize_arr: [],
        tableColumns: [
          {
            prop: paperKeys.paperCode,
            label: '原纸代码'
          },
          {
            prop: 'totalLength',
            label: '库存米数'
          },
          {
            prop: 'expectLength',
            label: '预计米数'
          },
          {
            prop: 'totalCount',
            label: '库存件数'
          },
        ],
        isLoading: false,
      };
    },
    methods: {
      show() {
        this.getPaperSizeList();
      },
      cellClassName({row, column}) {
        if (column.property === 'expectLength' && row.isNotice) {
          return 'red';
        }
      },
      judgeEffect(item) {
        return !this.value_map[item[paperKeys.paperSize]]
      },
      changeEffect(item) {
        if (this.judgeEffect(item)) {
          this.$emit('input', [...this.value].concat([item[paperKeys.paperSize]]));
        } else {
          this.$emit('input', this.value.filter(str=>str !== item[paperKeys.paperSize]));
        }
        this.$message(`该门幅已被${!this.judgeEffect(item) ? '禁用' : '启用'}`);
      },
      getPaperSizeList() {
        this.isLoading = true;
        this.paperSize_arr = [];
        this.dj_api_extend(planArrangeService.getPaperSizeList).then((res = {})=>{
          this.paperSize_arr = Object.keys(res).map(key=>{
            let obj = {};
            obj[paperKeys.paperSize] = key;
            obj['tableData'] = res[key].reduce((arr, _obj, index)=>{
              if (Number(_obj['expectLength'] || 0) > Number(_obj['totalLength'] || 0)) {
                _obj.isNotice = true;
                arr[0].push(_obj);
              } else {
                arr[1].push(_obj);
              }
              if (res[key].length - 1 === index) {
                return arr[0].concat(arr[1]);
              } else {
                return arr;
              }
            }, [[], []]);
            return obj;
          });
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      retract() {
        this.$refs.collapse.activeNames = '';
      }
    }
  };
</script>
<style lang="less" scoped>
  .paper-button {
    position: absolute;
    right: 32px;
    top: 1px;
    z-index: 100;
    .el-button {
      padding: 10px 27px;
    }
  }
  .title {
    font-size: 16px;
    margin: 6px 8px 15px 8px;
  }
  .operate {
    color: #3654ea;
    cursor: pointer;
  }
  .disabled-button {
    position: absolute;
    right: 4px;
  }
  .paper-button-content {
    min-height: 60px;
    max-height: 350px;
    overflow: auto;
    margin: 0 20px;
  }
  .el-collapse {
    border: none;
    /deep/ .el-collapse-item__header {
      position: relative;
      /deep/ .el-collapse-item__arrow {
        position: absolute;
      }
    }
  }
  .paper-size-text {
    margin-left: 37px;
  }
  .line {
    border-top: 1px solid rgb(235, 238, 245);
    position: relative;
    left: 0;
    width: 650px;
    transform: translateX(-12px);
  }
  .base-table /deep/ .el-table__row td.red {
    color: red;
  }
  @media screen and (min-height: 850px) {
    .paper-button-content {
      max-height: 550px;
    }
  }
</style>
