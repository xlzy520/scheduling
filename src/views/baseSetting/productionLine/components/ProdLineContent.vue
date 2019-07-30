<template>
  <div class="tab-content">
    <div class="left-content">
      <card title="基础参数">
        <dj-grid-box :data="ProdLineLabel.jccs" :row-rule="rowRule" :col-rule="colRule">
          <template slot-scope="{item}">
            <div class="bs-card-row">
              <div class="bs-card-label">{{item.label}}：</div>
              <div class="bs-card-value"> {{Data.jccs[item.prop]}}</div>
            </div>
          </template>
        </dj-grid-box>
      </card>
      <card title="纵切机" class="zqj">
        <dj-grid-box :data="ProdLineLabel.zqj" :column-num="zqjColumnNum" :col-rule="()=>zqjColRule">
          <template slot-scope="{item}">
            <div class="bs-card-row">
              <div class="bs-card-label">{{item.label}}：</div>
              <div class="bs-card-value"> {{Data.zqj[item.prop]}}</div>
            </div>
          </template>
        </dj-grid-box>
      </card>
    </div>
    <div class="right-content">
      <card title="分线机/横切机/吊篮">
        <dj-grid-box :data="ProdLineLabel.fxj" :column-num="3" :col-rule="()=>8">
          <template slot-scope="{item}">
            <div class="bs-card-row">
              <div class="bs-card-label">{{item.label}}：</div>
              <div class="bs-card-value"> {{Data.fxj[item.prop]}}</div>
            </div>
          </template>
        </dj-grid-box>
      </card>
      <card title="操作记录">
        <div v-for="record in Data.czjl" class="record-item">
          {{record.a}}&nbsp&nbsp{{record.b}}&nbsp&nbsp{{record.c}}
          <el-button type="primary" size="mini" @click="viewRecordDetail(record.id)">查看详情</el-button>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
  import Card from './Card';

  export default {
    name: 'ProdLineContent',
    components: {Card},
    props: {
      Data: {
        type: Object,
        default: () => {
        }
      },
      ProdLineLabel: {
        type: Object,
        default: () => {
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
      rowRule(item) {
        let map = {lengxing: 0, chesu: 0, huanzhi: 0, shoudan: 1, weidan: 1, menfu: 2};
        return map[item.prop];
      },
      colRule(item) {
        if (item.prop === 'menfu') {
          return 24;
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
      color: #8b8b8b;
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
        .bs-card-value {
          width: 84%;
        }
      }
    }
    .right-content {
      width: 40%;
      margin-left: 30px;
    }
  }
</style>
