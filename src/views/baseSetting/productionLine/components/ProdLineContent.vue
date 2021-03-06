<template>
  <div class="tab-content">
    <div class="tab-content-item">
      <div class="left-content">
        <card title="基础参数">
          <dj-grid-box :data="ProdLineLabel.jccs" :row-rule="rowRule" :col-rule="colRule">
            <template slot-scope="{item}">
              <div class="bs-card-row jccs">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value" v-if="item.prop !== 'linePaperSizeModels'">{{ProdLineData.jccs[item.prop]}}</div>
                <div class="bs-card-value" v-else>{{handlePaperSize(ProdLineData.jccs[item.prop])}}</div>
              </div>
            </template>
          </dj-grid-box>
        </card>
      </div>
      <div class="right-content">
        <card title="分线机/横切机/吊篮">
          <dj-grid-box :data="ProdLineLabel.fxj" :column-num="fxjColumnNum" :col-rule="()=>fxjColRule">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label" v-if="ProdLineData.fxj[item.prop]">{{item.label}}：</div>
                <div class="bs-card-value" v-if="item.prop !== 'basketType'"> {{ProdLineData.fxj[item.prop]}}</div>
                <div class="bs-card-value" v-else> {{ProdLineData.fxj[item.prop]===1?'大吊篮':'小吊篮'}}</div>
              </div>
            </template>
          </dj-grid-box>
        </card>
      </div>
    </div>
    <div class="tab-content-item">
      <div class="left-content">
        <card title="纵切机">
          <dj-grid-box :data="ProdLineLabel.zqj" :column-num="zqjColumnNum" :col-rule="()=>zqjColRule">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{ProdLineData.zqj[item.prop]}}</div>
              </div>
            </template>
          </dj-grid-box>
        </card>
      </div>
      <div class="right-content">
        <card title="操作记录" v-loading="loading">
          <div class="record">
            <div v-for="record in records" class="record-item">
              <div class="time">{{record.operateTime.substr(0,16)}}</div>
              <div class="">{{record.operator}}</div>
              <div class="detail" :title="record.operateDetail">{{formatDetail(record.operateDetail)}}</div>
              <a class="view-btn" v-if="record.operaType" @click="viewRecordDetail(record.operateDetail)">查看详情</a>
            </div>
          </div>
        </card>
      </div>
    </div>
    <look-dialog v-if="visible" ref="dialog" @close="close"></look-dialog>
  </div>
</template>

<script>
  import Card from './Card';
  import record from "../../../../api/service/record";
  import lookDialog from "./lookDialog";
  export default {
    name: 'ProdLineContent',
    components: {Card, lookDialog},
    props: {
      ProdLineData: {
        type: Object,
        default: () => {
          return {
            jccs: [],
            zqj: [],
            fxj: []
          };
        }
      },
      ProdLineLabel: {
        type: Object,
        default: () => {
          return {
            jccs: [],
            zqj: [],
            fxj: []
          };
        }
      },
      lineId: {
        type: String,
        default: null
      }
    },
    data() {
      return {
        zqjColumnNum: 4,
        zqjColRule: 6,
        fxjColumnNum: 3,
        fxjColRule: 8,
        records: [],
        loading: false,
        visible: false,
      };
    },
    methods: {
      formatDetail(detail) {
        const lastIndex = detail.lastIndexOf('】');
        return detail.substr(0, lastIndex + 1);
      },
      handlePaperSize(arr = []) {
        if (arr.length > 0) {
          return arr.map(v=>v.paperSize).join('，') + '。';
        }
        return '';
      },
      rowRule(item) {
        let map = {commonTilemodel: 0, lineSpeed: 0, changeorderMinLength: 1, firstorderWasteWith: 1,
          lastorderMinLength: 1, linePaperSizeModels: 2};
        return map[item.prop];
      },
      colRule(item) {
        if (item.prop === 'linePaperSizeModels') {
          return 24;
        }
        if (item.prop === 'commonTilemodel') {
          return 16;
        }
        if (['statckCount', 'commonTilemodel'].includes(item.prop)) {
          return 16;
        }
        return 8;
      },
      viewRecordDetail(detail) {
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.dialog.open(detail);
        });
      },
      close() {
        this.visible = false;
      },
      layout() {
        const width = window.innerWidth;
        this.zqjColRule = width < 1400 ? 8 : 6;
        this.zqjColumnNum = width < 1400 ? 3 : 4;
        this.fxjColRule = width < 1400 ? 12 : 8;
        this.fxjColumnNum = width < 1400 ? 2 : 3;
      },
      getOperationRecord() {
        this.$nextTick(() => {
          this.loading = true;
          this.dj_api_extend(record.list, {
            sourceId: this.lineId
          }).then((res) => {
            this.records = res.list || [];
          }).finally(() => {
            this.loading = false;
          });
        });
      }
    },
    created() {
     this.layout();
      window.addEventListener('resize', ()=>{
        this.layout();
      });

    },
    beforeDestroy() {
      window.removeEventListener('resize', ()=>this.layout);
    }
  };
</script>

<style lang="less" scoped>
  .tab-content {
    position: relative;
    display: flex;
    width: 100%;
    flex-direction: column;
    &-item {
      display: flex;
    }
    .bs-card-row {
      display: flex;
      line-height: 20px;
      .bs-card-label {
        text-align: left;
      }
    }
    .left-content {
      width: 1083px;
      .el-col-24 {
        .jccs {
          .bs-card-value {
            width: 84%;
          }
          .bs-card-label {
            width: 110px;
          }
        }
      }
      .el-col-16 {
        .jccs {
          .bs-card-label {
            width: 85px;
          }
          .bs-card-value {
            width: 95%;
            word-break: break-all;
          }
        }
      }
    }

    @media screen and (max-width: 1367px) {
      .left-content {
        width: 800px;
        .el-col-24 {
          .jccs {
            .bs-card-value {
              width: 75%;
            }
          }
        }
      }
    }
    .right-content {
      width: 400px;
      margin-left: 80px;
      flex-grow: 1;
      .record {
        max-height: 340px;
        overflow: auto;
        .record-item {
          display: flex;
          margin-bottom: 16px;
          .detail {
            margin-right: 24px;
          }
          div {
            margin-right: 16px;
          }
          .view-btn {
            cursor: pointer;
          }
        }
      }
    }

    @media screen and (max-width: 1600px) {
      .right-content {
        width: 600px;
      }
    }
  }
</style>
