<template>
  <div class="production-line">
    <el-button type="primary" @click="addProdLine">新增</el-button>
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
    <prod-line-content :prod-line-data="prodLineData[Number(activeTab)-1]" :prod-line-label="prodLineLabel"></prod-line-content>
    <edit-add ref="editAdd" v-if="dialogVisible" :dialog-type-is-add="dialogTypeIsAdd" @close="close"></edit-add>
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
        activeTab: '',
        tabsColumn: [],
        lineStatus: 'on',

        prodLineData: [
          {
            jccs: {
              commonTilemodel: '',
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
              statckCount: '',
            }
          },
        ],
        prodLineLabel: {
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
            {prop: 'statckCount', label: '最小叠单米数(m)'}
          ],
        },

        dialogTypeIsAdd: false,
        dialogVisible: false,
      };
    },
    methods: {
      addProdLine() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
      },
      tabClick(val) {
        productionLineService.list({
          line: val
        }).then((res) => {

        });
      },
      changeLineStatus(val) {
        if (val === 'off') {
          this.$confirm('您确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            productionLineService.list({
              status: val
            }).then((res) => {

            });
          });
        } else {
          productionLineService.list({
            status: val
          }).then((res) => {

          });
        }
      },

      getData(data) {
        const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        productionLineService.list(data).then((res) => {
          const data = [
            {
              "id": "604de70e-b638-4f26-8b60-df184a0de3f9",
              "lineId": "1",
              "defaultLine": "",
              "partlineMachineWidth": 11.00,
              "minCutLength": 1000,
              "basketType": 10,
              "basketLength": 90,
              "statckCount": 90,
              "slimachNumbers": 43,
              "slimachWheelRows": 90,
              "slimachWheelCount": 42,
              "slimachWheelSamesideSpace": 80,
              "slimachWdoubleMinLength": 3244,
              "slimachKnifeCount": 90,
              "slimachKnifeSpace": 90,
              "slimachKnifeChangetime": 90,
              "commonTilemodel": "BC,BE",
              "lineSpeed": 30.00,
              "firstorderWasteWith": 43,
              "changeorderMinLength": 60,
              "lastorderMinLength": 60,
              "isEffected": "",
              "isDeleted": "",
              "createtime": "",
              "updatetime": "",
              "supplierId": "",
              "operator": "",
              "linePaperSizeModels": [
                {
                  "id": "",
                  "lineId": "",
                  "paperSize": 800,
                  "createTime": "",
                  "updateTime": ""
                },
                {
                  "id": "",
                  "lineId": "",
                  "paperSize": 1800,
                  "createTime": "",
                  "updateTime": ""
                }
              ]
            },
            {
              "id": "604de70e-b638-4f26-8b60-df184a0de3f1",
              "lineId": "2",
              "defaultLine": "",
              "partlineMachineWidth": 22.00,
              "minCutLength": 1000,
              "basketType": 10,
              "basketLength": 90,
              "statckCount": 90,
              "slimachNumbers": 43,
              "slimachWheelRows": 90,
              "slimachWheelCount": 42,
              "slimachWheelSamesideSpace": 80,
              "slimachWdoubleMinLength": 3244,
              "slimachKnifeCount": 90,
              "slimachKnifeSpace": 90,
              "slimachKnifeChangetime": 90,
              "commonTilemodel": "BC,BE",
              "lineSpeed": 30.00,
              "firstorderWasteWith": 43,
              "changeorderMinLength": 60,
              "lastorderMinLength": 60,
              "isEffected": "",
              "isDeleted": "",
              "createtime": "",
              "updatetime": "",
              "supplierId": "",
              "operator": "",
              "linePaperSizeModels": [
                {
                  "id": "",
                  "lineId": "",
                  "paperSize": 150,
                  "createTime": "",
                  "updateTime": ""
                }
              ]
            },
            {
              "id": "604de70e-b638-4f26-8b60-df184a0de3f2",
              "lineId": "3",
              "defaultLine": "",
              "partlineMachineWidth": 33.00,
              "minCutLength": 1000,
              "basketType": 10,
              "basketLength": 90,
              "statckCount": 90,
              "slimachNumbers": 43,
              "slimachWheelRows": 90,
              "slimachWheelCount": 42,
              "slimachWheelSamesideSpace": 80,
              "slimachWdoubleMinLength": 3244,
              "slimachKnifeCount": 90,
              "slimachKnifeSpace": 90,
              "slimachKnifeChangetime": 90,
              "commonTilemodel": "BC,BE",
              "lineSpeed": 30.00,
              "firstorderWasteWith": 43,
              "changeorderMinLength": 60,
              "lastorderMinLength": 60,
              "isEffected": "",
              "isDeleted": "",
              "createtime": "",
              "updatetime": "",
              "supplierId": "",
              "operator": "",
              "linePaperSizeModels": [
                {
                  "id": "",
                  "lineId": "",
                  "paperSize": 150,
                  "createTime": "",
                  "updateTime": ""
                }
              ]
            },
            ];
          this.prodLineData = [];
          if (data.length > 0) {
            data.map((v, index)=>{
              this.activeTab = data[0].lineId;
              this.tabsColumn.push({
                label: chnNumChar[v.lineId] + '号线',
                value: v.lineId
              });
              this.prodLineData.push({
                jccs: {
                  commonTilemodel: '',
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
                  statckCount: '',
                }});
              for (const item of Object.keys(this.prodLineLabel)) {
                const module = this.prodLineLabel[item];
                for (let i = 0; i < module.length; i++) {
                  const prop = module[i].prop;
                  if (item === 'jccs' && prop === 'linePaperSizeModels') {
                    this.prodLineData[index][item][prop] = v[prop].map(v=>v.paperSize);
                  } else {
                    this.prodLineData[index][item][prop] = v[prop];
                  }
                }
              }
            });
          }
        });
      },
      edit() {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.$nextTick(()=>{
          this.$refs.editAdd.prodLineData = this.$method.deepClone(this.prodLineData[this.activeTab - 1]);
        });
      },
      search(data) {
        this.getData({
          ...data,
          ...this.pageOptions,
        });
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
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
</style>
