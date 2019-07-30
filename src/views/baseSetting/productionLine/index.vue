<template>
  <div class="production-line">
    <el-button type="primary" @click="addLine">新增</el-button>
    <el-tabs stretch v-model="activeTab" @tab-click="tabClick">
      <el-tab-pane v-for="tab in tabsColumn" :key="tab.value" :label="tab.label" :name="tab.value"></el-tab-pane>
    </el-tabs>
    <div class="tab-right-btns">
      <el-button type="primary" @click="edit">修改</el-button>
      <el-radio-group v-model="lineStatus" @change="changeLineStatus">
        <el-radio-button label="on">启用</el-radio-button>
        <el-radio-button label="off">禁用</el-radio-button>
      </el-radio-group>
    </div>
    <prod-line-content :data="prodLineData" :prod-line-label="prodLineLabel"></prod-line-content>
    <edit-add :dialog-type-is-add="dialogTypeIsAdd" ></edit-add>
  </div>
</template>

<script>
  import productionLineService from '../../../api/service/productionLine';
  import {djForm} from 'djweb';

  import ProdLineContent from './components/ProdLineContent';
  import EditAdd from './components/EditAdd';

  export default {
    name: 'productionLine',
    components: {EditAdd, ProdLineContent},
    data() {
      return {
        activeTab: '1',
        tabsColumn: [
          {label: '一号线', value: '1'},
          {label: '二号线', value: '2'},
          {label: '三号线', value: '3'},
        ],
        lineStatus: 'on',

        prodLineData: {
          jccs: {
            lengxing: 'BE、BC',
            chesu: '200',
            huanzhi: '500',
            shoudan: '35',
            weidan: '80',
            menfu: '1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500、' +
              '1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500',
          },
          zqj: {
            zongqiejishu: '二台及以上',
            chesu: '两排',
            huanzhi: '12',
            shoudan: '80',
            weidan: '500',
            menfu1: '7',
            menfu2: '7',
            menfu3: '7',
          },
          fxj: {
            zongqiejishu: '50',
            chesu: '50',
            huanzhi: '大吊篮',
            shoudan: '80',
            weidan: '500',
          },
          czjl: [
            {
              a: '2019-04-08 09:44',
              b: '操作人',
              c: ' 操作内容'
            },
            {
              a: '2019-04-08 09:44',
              b: '操作人',
              c: ' 操作内容'
            }
          ],
        },
        prodLineLabel: {
          jccs: [
            {prop: 'lengxing', label: '常用楞型'},
            {prop: 'chesu', label: '生产车速(m/s)'},
            {prop: 'huanzhi', label: '换纸最小米数(m)'},
            {prop: 'shoudan', label: '首单最小修边(mm)'},
            {prop: 'weidan', label: '尾单最小米数(m)'},
            {prop: 'menfu', label: '门幅范围(mm)'}
          ],
          zqj: [
            {prop: 'zongqiejishu', label: '纵切机数'},
            {prop: 'chesu', label: '压轮排数'},
            {prop: 'huanzhi', label: '单台压轮数'},
            {prop: 'shoudan', label: '压轮最小间距(mm)'},
            {prop: 'weidan', label: '双机压订单最小米数(m)'},
            {prop: 'menfu1', label: '单台纵切刀数'},
            {prop: 'menfu2', label: '纵切刀间距(mm)'},
            {prop: 'menfu3', label: '换单排刀时间(s)'}
          ],
          fxj: [
            {prop: 'zongqiejishu', label: '分线机宽度(m)'},
            {prop: 'chesu', label: '最小切长(mm)'},
            {prop: 'huanzhi', label: '吊篮类型'},
            {prop: 'shoudan', label: '吊篮长度(m)'},
            {prop: 'weidan', label: '最小叠单米数(m)'}
          ],
        },

        dialogTypeIsAdd: null,
        dialogVisible: false,
      };
    },
    methods: {
      addLine() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      tabClick(val) {
        productionLineService.list({
          line: val
        }).then((res) => {

        });
      },
      changeLineStatus(val) {
        productionLineService.list({
          status: val
        }).then((res) => {

        });
      },

      getTableData(data) {
        productionLineService.list(data).then((res) => {
          // this.tableData = res.list;
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.formData = this.$method.deepClone(row);
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(data) {
        this.getTableData({
          ...data,
          ...this.pageOptions,
        });
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },

    },
    created() {
      this.getTableData();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .optional{
    width: 100%;
    min-height: 120px;
    margin-bottom: 20px;
    &-label{
      font-size: 14px;
      color: #606266;
      line-height: 34px;
      padding: 0 12px 0 0;
      margin: 0;
    }
    &-area{
      width: 100%;
      min-height: 80px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      border: 1px solid #eee;
      border-radius: 4px;
      &-item{
        text-align: center;
        font-size: 16px;
        min-width: 60px;
        height: 24px;
        line-height: 24px;
        padding: 5px 10px;
        margin: 5px;
        color: #747579;
        background: #f1f2f6;
        border-radius: 5px;
        cursor: pointer;
        user-select: none;
        &.selected{
          pointer-events: none;
          cursor: not-allowed;
          color: #45464a;
          background: #c2c3c7;
        }
      }
    }
  }
  .production-line{
    padding: 15px;
    @{deep} .el-tabs__nav-wrap{
      &:after{
        width: 30%;
      }
      .el-tabs__nav.is-stretch{
        min-width: 30%;
      }

    }
    .tab-right-btns{
      width: 300px;
      display: flex;
      justify-content: space-around;
      float: right;
      transform: translateY(-40px);
    }

  }
  .production-line-dialog {
    width: 80vw;
  }
</style>
