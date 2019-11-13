<template>
  <single-page v-loading="loading">
    <div v-if="isEmpty" class="empty-area">
      <span class="production-line__empty-text">
        <i class="cl-common- dj-common-Nodata"></i><span class="empty-text">暂无数据</span>
      </span>
      <el-button type="primary" @click="addProdLine" class="add-btn">立即新增</el-button>
    </div>
    <div class="production-line" v-else>
      <el-button type="primary" @click="addProdLine">新增</el-button>
      <div class="header-tab">
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
      </div>
      <prod-line-content :line-id="idMap[Number(activeTab)-1]" ref="content"
                         :prod-line-data="prodLineData[Number(activeTab)-1]"
                         :prod-line-label="prodLineLabel"></prod-line-content>
    </div>
    <edit-add ref="editAdd" v-if="dialogVisible" :dialog-type-is-add="dialogTypeIsAdd"
              @close="close" @get-data="getData"></edit-add>
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
      stackMinCutLength: '',
      lastorderMinLength: '',
      tailMinWidthWaste: '',
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
        isEmpty: true,

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
            {prop: 'stackMinCutLength', label: '单单堆叠最小切长 (cm)'},
            {prop: 'lastorderMinLength', label: '尾单最小米数(m)'},
            {prop: 'tailMinWidthWaste', label: '尾单最小修边(mm)'},
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
        this.$refs.content.getOperationRecord();
      },
      changeLineStatus(val) {
        let post = {
          id: this.tabsColumn[this.activeTab - 1].id,
          effected: val ? 0 : 1,
        };
        let text = val ? '禁用' : '启用';
        this.$method.tipBox(`确定${text}该条内容吗？`, () => {
          this.statusLoading = true;
          return this.dj_api_extend(productionLineService.changeLineEffected, post).then(() => {
            // this.lineStatus = val;
            this.$message(`${text}成功`, 'success');
            this.tabsColumn[this.activeTab - 1].isEffected = val ? 0 : 1;
            this.tabClick();
          }).finally(() => {
            this.statusLoading = false;
          });
        });
      },
      changeTabsScrollWidth() {
        const ele = document.querySelector('.el-tabs__nav-wrap');
        const cardWidth = document.querySelector('.left-content').getBoundingClientRect().width;
        ele.style.width = cardWidth + 'px';
      },
      bindResize() {
        window.addEventListener('resize', ()=>this.changeTabsScrollWidth());
      },
      getData(activeTab) {
        this.loading = true;
        productionLineService.list().then((res) => {
          let data = res.list;
          this.isEmpty = res.total === 0;
          if (!this.isEmpty) {
            this.idMap = data.map(v => v.id);
            this.prodLineData = [];
            this.tabsColumn = [];
            this.activeTab = activeTab || data[0].lineNum;
            data.map((v, index) => {
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
                    this.prodLineData[index][item][prop] = v[prop].map(v => {
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
            this.$nextTick(() => {
              this.tabClick();
              this.changeTabsScrollWidth();
            });
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      edit() {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        let copyData = JSON.parse(JSON.stringify(this.prodLineData[this.activeTab - 1]));
        if (copyData.jccs.commonTilemodel) {
          copyData.jccs.commonTilemodel = copyData.jccs.commonTilemodel.split('、');
        }
        this.$nextTick(() => {
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
    mounted() {
      this.bindResize();
    },
    beforeDestroy() {
      window.removeEventListener('resize', ()=>this.changeTabsScrollWidth());
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';

  .production-line {
    padding: 24px 32px 0;
    .header-tab{
      display: flex;
      justify-content: space-between;
    }
    @{deep} .el-tabs {
      margin-top: 12px;

      &__header {
        margin: 0 0 16px;
      }
    }

    .tab-right-btns {
      margin-top: 15px;
      .el-button {
        padding: 10px 41px;
        margin-right: 8px;
      }
    }
  }

  .empty-area {
    display: flex;
    flex-direction: column;
    margin: auto;

    .production-line__empty-text {
      display: flex;
      margin-bottom: 16px;
      color: #909399;

      i {
        display: block;
        width: 25.43px;
        height: 25.43px;
        font-size: 25.43px;
        color: #C0C4CC;
      }

      .empty-text {
        margin-left: 9px;
        width: 80px;
        height: 28px;
        font-size: 20px;
        font-weight: 500;
        color: rgba(192, 196, 204, 1);
        line-height: 28px;
      }
    }
  }
</style>
