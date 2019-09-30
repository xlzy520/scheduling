<template>
  <single-page>
    <div class="production-line" v-loading="loading">
      <el-button type="primary" @click="addProdLine">新增</el-button>
      <el-tabs v-model="activeTab" @tab-click="tabClick">
        <el-tab-pane v-for="tab in tabsColumn" :key="tab.value" :label="tab.label" :name="tab.value"></el-tab-pane>
      </el-tabs>
      <div class="tab-right-btns">
        <el-button type="primary" @click="edit">编辑</el-button>
        <el-radio-group :value="lineStatus" @change="changeLineStatus" v-loading="statusLoading">
          <el-radio-button :label="1">启用</el-radio-button>
          <el-radio-button :label="0">禁用</el-radio-button>
        </el-radio-group>
      </div>
      <prod-line-content :line-id="idMap[Number(activeTab)-1]" ref="content"
                         :prod-line-data="prodLineData[Number(activeTab)-1]"
                         :prod-line-label="prodLineLabel"></prod-line-content>
      <edit-add ref="editAdd" v-if="dialogVisible" :dialog-type-is-add="dialogTypeIsAdd" @close="close" @get-data="getData"></edit-add>
    </div>
  </single-page>
</template>

<script>
  import productionLineService from '../../../api/service/productionLine';

  import ProdLineContent from './components/ProdLineContent';
  import EditAdd from './components/EditAdd';
  import SinglePage from "../../../components/page/singlePage";
const initProdLineData = {
  jccs: {
    commonTilemodel: [],
    lineSpeed: '',
    changeorderMinLength: '',
    firstorderWasteWith: '',
    lastorderMinLength: '',
    linePaperSizeModels: '',
  },
  zqj: {
    slimachNumbers: '',
    slimachWheelRows: '',
    slimachWheelCount: '',
    slimachWheelSamesideSpace: '',
    slimachWdoubleMinLength: '',
    slimachKnifeCount: '',
    slimachKnifeSpace: '',
    slimachKnifeChangetime: '',
  },
  fxj: {
    partlineMachineWidth: '',
    minCutLength: '',
    basketType: '',
    basketLength: '',
    stackCount: ''
  }
};
  export default {
    name: 'productionLine',
    components: {SinglePage, EditAdd, ProdLineContent},
    data() {
      return {
        loading: false,
        statusLoading: false,

        idMap: [],
        activeTab: '1',
        tabsColumn: [],
        lineStatus: '1',

        prodLineData: [
          initProdLineData
        ],
        prodLineLabel: Object.freeze({
          jccs: [
            {prop: 'lineSpeed', label: '生产车速(m/s)'},
            {prop: 'commonTilemodel', label: '常用楞型'},
            {prop: 'changeorderMinLength', label: '换纸最小米数(m)'},
            {prop: 'firstorderWasteWith', label: '首单最小修边(mm)'},
            {prop: 'lastorderMinLength', label: '尾单最小米数(m)'},
            {prop: 'linePaperSizeModels', label: '门幅范围(mm)'},
          ],
          zqj: [
            {prop: 'slimachNumbers', label: '纵切机数'},
            {prop: 'slimachWheelRows', label: '压轮排数'},
            {prop: 'slimachWheelCount', label: '单台压轮数'},
            {prop: 'slimachWheelSamesideSpace', label: '压轮最小间距(mm)'},
            {prop: 'slimachWdoubleMinLength', label: '双机压订单最小米数(m)'},
            {prop: 'slimachKnifeCount', label: '单台纵切刀数'},
            {prop: 'slimachKnifeSpace', label: '纵切刀间距(mm)'},
            {prop: 'slimachKnifeChangetime', label: '换单排刀时间(s)'},
          ],
          fxj: [
            {prop: 'partlineMachineWidth', label: '分线机宽度(m)'},
            {prop: 'minCutLength', label: '最小切长(mm)'},
            {prop: 'basketType', label: '吊篮类型'},
            {prop: 'basketLength', label: '吊篮长度(m)'},
            {prop: 'stackCount', label: '堆叠数'},
          ],
        }),

        dialogTypeIsAdd: false,
        dialogVisible: false,
      };
    },
    methods: {
      addProdLine() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
      },
      tabClick() {
        this.lineStatus = this.tabsColumn[this.activeTab - 1].isEffected;
        console.log(this.activeTab);
        console.log(this.idMap[Number(this.activeTab) - 1]);
        this.$refs.content.getOperationRecord();
      },
      changeLineStatus(val) {
        let post = {
          id: this.tabsColumn[this.activeTab - 1].id,
          effected: val ? 0 : 1,
        };
        let text = val ? '禁用' : '启用';
        this.$confirm(`确定${text}该条内容吗？`, '', {
          type: 'warning',
          showClose: false,
        }).then(() => {
          this.statusLoading = true;
          this.dj_api_extend(productionLineService.changeLineEffected, post).then(() => {
            // this.lineStatus = val;
            this.$message(`${text}成功`, 'success');
            this.tabsColumn[this.activeTab - 1].isEffected = val ? 0 : 1;
            this.tabClick();
          }).finally(() => {
            this.statusLoading = false;
          });
        });
      },

      getData(activeTab) {
        this.loading = true;
        productionLineService.list().then((res) => {
          let data = res.list;
          this.idMap = data.map(v=>v.id);
          this.prodLineData = [];
          this.tabsColumn = [];
          if (data.length > 0) {
            this.activeTab = activeTab || data[0].lineNum;
            data.map((v, index)=>{
              this.tabsColumn.push({
                label: v.lineNum + '号线',
                value: v.lineNum,
                id: v.id,
                isEffected: v.isEffected
              });
              this.prodLineData.push(this.$method.deepClone(initProdLineData));
                for (const item of Object.keys(this.prodLineLabel)) {
                const module = this.prodLineLabel[item];
                for (let i = 0; i < module.length; i++) {
                  const prop = module[i].prop;
                  if (item === 'jccs' && prop === 'linePaperSizeModels') {
                    this.prodLineData[index][item][prop] = v[prop].map(v=>{
                      return {
                        paperSize: v.paperSize,
                        id: v.id
                      };
                    });
                  } else {
                    this.prodLineData[index][item][prop] = v[prop];
                  }
                }
              }
            });
          }
          this.tabClick();
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        });
      },
      edit() {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        let copyData = JSON.parse(JSON.stringify(this.prodLineData[this.activeTab - 1]));
        copyData.jccs.commonTilemodel = copyData.jccs.commonTilemodel.split('、');
        this.$nextTick(()=>{
          this.$refs.editAdd.prodLineData = JSON.parse(JSON.stringify(copyData));
          this.$refs.editAdd.lineId = this.idMap[this.activeTab - 1];
          this.$refs.editAdd.lineNum = this.activeTab;
        });
      },
      close() {
        this.dialogVisible = false;
      },
    },
    created() {
      this.getData();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .production-line {
    padding: 24px 32px 0;
    @{deep} .el-tabs {
      margin-top: 12px;
      .el-tabs__header {
        margin: 0 0 16px;
      }
    }
    .tab-right-btns {
      float: right;
      transform: translateY(-54px);
      .el-button {
        padding: 10px 41px;
        margin-right: 8px;
      }
    }
  }
</style>
