<template>
    <div class="paper-button">
      <el-popover
        placement="bottom"
        width="626"
        trigger="click">
        <div class="title clearfix">
          <span class="fl">原纸库存</span>
          <a class="fr operate" @click="retract">收起</a>
        </div>
        <p class="line"></p>
        <div class="paper-button-content">
          <el-collapse ref="collapse" accordion @change="getPaperStorage">
            <el-collapse-item v-for="item in paperSize_arr" :name="item[paperKeys.paperSize]">
              <template slot="title">
                <a class="operate disabled-button" @click.stop="changeEffect(item)">{{item['effected'] ? '禁用' : '启用'}}</a>
                <span class="paper-size-text">{{item[paperKeys.paperSize]}}</span>
              </template>
              <base-table :loading="isLoading_map[item[paperKeys.paperSize]] || false" :data="paperTableData_map[item[paperKeys.paperSize]]" :columns="tableColumns"></base-table>
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
    data: function () {
      return {
        paperKeys,
        paperSize_arr: [],
        paperTableData_map: {},
        tableColumns: [],
        isLoading_map: {}
      };
    },
    created() {
      this.getPaperSizeList();
    },
    methods: {
      changeEffect(item) {
        let post = {
          ...item
        };
        this.dj_api_extend(planArrangeService.changeEffect, post).then(res=>{
          this.$message(`该门幅已被${item['effected'] ? '禁用' : '启用'}`);
          item['effected'] = !item['effected'];
        });
      },
      getPaperSizeList() {
        this.dj_api_extend(planArrangeService.getPaperSizeList).then(res=>{
          this.paperSize_arr = res.list || [];
        }).finally(()=>{
          this.paperSize_arr = [
            {
              paperSize: '1800',
              effected: true
            },
            {
              paperSize: '1900',
              effected: false
            },
            {
              paperSize: '2000',
              effected: false
            },
            {
              paperSize: '2100',
              effected: true
            }
          ];
        });
      },
      getPaperStorage(paperSize) {
        // let paperSize = item[paperKeys.paperSize];
        if (this.paperTableData_map[paperSize] || !paperSize) {
          return;
        }
        this.$set(this.isLoading_map, paperSize, true);
        planArrangeService.getPaperSizeList({paperSize}).then(res=>{
          this.paperTableData_map[paperSize] = res.list || [];
        }).finally(()=>{
          this.$set(this.isLoading_map, paperSize, false);
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
    top: 11px;
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
    max-height: 350px;
    overflow: auto;
    margin: 0 20px;
  }
  .el-collapse {
    border-top: none;
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
    border-top: 1px solid rgb(235, 238, 245);;
    position: relative;
    left: 0;
    width: 650px;
    transform: translateX(-12px);
  }
</style>
