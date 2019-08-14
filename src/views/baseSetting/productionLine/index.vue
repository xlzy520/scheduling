<template>
  <div class="production-line" v-loading="loading">
    <el-button type="primary" @click="addProdLine">新增</el-button>
    <el-tabs stretch v-model="activeTab" @tab-click="tabClick">
      <el-tab-pane v-for="tab in tabsColumn" :key="tab.value" :label="tab.label" :name="tab.value"></el-tab-pane>
    </el-tabs>
    <div class="tab-right-btns">
      <el-button type="primary" @click="edit">修改</el-button>
      <el-radio-group :value="lineStatus" @change="changeLineStatus" v-loading="statusLoading">
        <el-radio-button :label="1">启用</el-radio-button>
        <el-radio-button :label="0">禁用</el-radio-button>
      </el-radio-group>
    </div>
    <prod-line-content :prod-line-data="prodLineData[Number(activeTab)-1]" :prod-line-label="prodLineLabel"></prod-line-content>
    <edit-add ref="editAdd" v-if="dialogVisible" :dialog-type-is-add="dialogTypeIsAdd" @close="close" @getData="getData"></edit-add>
  </div>
</template>

<script>
  import productionLineService from '../../../api/service/productionLine';

  import ProdLineContent from './components/ProdLineContent';
  import EditAdd from './components/EditAdd';

  export default {
    name: 'productionLine',
    components: {EditAdd, ProdLineContent},
    data() {
      return {
        loading: false,
        statusLoading: false,

        idMap: [],
        activeTab: '',
        tabsColumn: [],
        lineStatus: '1',

        prodLineData: [
          {
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
            }
          },
        ],
        prodLineLabel: Object.freeze({
          jccs: [
            {prop: 'commonTilemodel', label: '常用楞型'},
            {prop: 'lineSpeed', label: '生产车速(m/s)'},
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
      },
      changeLineEffectedApi(val, text) {
        this.statusLoading = true;
        productionLineService.changeLineEffected({
          effected: Math.pow(0, val),
          id: this.tabsColumn[this.activeTab - 1].id
        }).then(() => {
          this.$message(text, 'success');
          this.tabsColumn[this.activeTab - 1].isEffected =  Math.pow(0, this.lineStatus);
          this.tabClick();
        }).finally(()=>{
          this.statusLoading = false;
        });
      },
      changeLineStatus(val) {
        if (val) {
          this.$confirm('确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.lineStatus = val;
            this.changeLineEffectedApi(val, '禁用成功');
          });
        } else {
          this.lineStatus = val;
          this.changeLineEffectedApi(val, '启用成功');
        }
      },

      getData(activeTab) {
        this.loading = true;
        productionLineService.list().then((res) => {
          let data = res.list;
          this.idMap = data.map(v=>v.id);
          this.prodLineData = [];
          this.tabsColumn = [];
          if (data.length > 0) {
            data.map((v, index)=>{
              this.activeTab = activeTab || data[0].lineNum;
              this.tabsColumn.push({
                label: v.lineNum + '号线',
                value: v.lineNum,
                id: v.id,
                isEffected: v.isEffected
              });
              this.prodLineData.push({
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
                }});
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
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        });
      },
      edit() {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.$nextTick(()=>{
          let copyData = this.$method.deepClone(this.prodLineData[this.activeTab - 1]);
          copyData.jccs.commonTilemodel = copyData.jccs.commonTilemodel.split(',');
          this.$refs.editAdd.prodLineData = copyData;
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
  .production-line{
    padding: 15px;
    @{deep} .el-tabs__nav-wrap{
      width: 70%;
      .el-tabs__nav.is-stretch{
        min-width: 80%;
      }
      .el-tabs__item{
        max-width: 180px;
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
</style>
