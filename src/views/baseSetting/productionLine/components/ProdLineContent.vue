<template>
  <div class="tab-content">
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
      <card title="分线机/横切机/吊篮">
        <dj-grid-box :data="ProdLineLabel.fxj" :column-num="3" :col-rule="colRule">
          <template slot-scope="{item}">
            <div class="bs-card-row">
              <div class="bs-card-label">{{item.label}}：</div>
              <div class="bs-card-value" v-if="item.prop !== 'basketType'"> {{ProdLineData.fxj[item.prop]}}</div>
              <div class="bs-card-value" v-else> {{ProdLineData.fxj[item.prop]===1?'大吊篮':'小吊篮'}}</div>
            </div>
          </template>
        </dj-grid-box>
      </card>
      <!--<card title="操作记录">-->
        <!--<div v-for="record in ProdLineData.czjl" class="record-item">-->
          <!--{{record.a}}&nbsp&nbsp{{record.b}}&nbsp&nbsp{{record.c}}-->
          <!--<el-button type="primary" size="mini" @click="viewRecordDetail(record.id)">查看详情</el-button>-->
        <!--</div>-->
      <!--</card>-->
    </div>
  </div>
</template>

<script>
  import Card from './Card';

  export default {
    name: 'ProdLineContent',
    components: {Card},
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
      }
    },
    data() {
      return {
        zqjColumnNum: 4,
        zqjColRule: 6,
      };
    },
    methods: {
      handlePaperSize(arr = []) {
        if (arr.length > 0) {
          return arr.map(v=>v.paperSize).join('，') + '。';
        }
        return '';
      },
      rowRule(item) {
        let map = {commonTilemodel: 0, lineSpeed: 0, changeorderMinLength: 0, firstorderWasteWith: 1,
          lastorderMinLength: 1, linePaperSizeModels: 2};
        return map[item.prop];
      },
      colRule(item) {
        if (item.prop === 'linePaperSizeModels') {
          return 24;
        }
        if (item.prop === 'statckCount') {
          return 16;
        }
        return 8;
      },
      zqjGetColumnNum() {
        const width = window.innerWidth;
        this.zqjColumnNum = width < 1400 ? 3 : 4;
      },
      zqjGetColRule() {
        const width = window.innerWidth;
        this.zqjColRule = width < 1400 ? 8 : 6;
      },
      viewRecordDetail(id) {

      },
    },
    created() {
      this.zqjGetColRule();
      this.zqjGetColumnNum();
      window.addEventListener('resize', ()=>{
        this.zqjGetColRule();
        this.zqjGetColumnNum();
      });
    }
  };
</script>

<style lang="less" scoped>
  .tab-content {
    width: 100%;
    display: flex;
    .bs-card-row {
      display: flex;
      line-height: 1.5;
      padding: 5px 0;
      .bs-card-label {
        text-align: left;
      }
      .bs-card-value {

      }
    }
    .record-item {
      line-height: 40px;
    }

    .left-content {
      width: 60%;
      .el-col-24 {
        .jccs{
          .bs-card-value {
            width: 84%;
          }
          .bs-card-label {
            width: 125px;
          }
        }
      }
    }
    .right-content {
      width: 40%;
      margin-left: 30px;
    }
  }
</style>
