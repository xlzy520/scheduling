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
    <div class="tab-content">
      <div class="left-content">
        <bs-card title="基础参数">
          <dj-grid-box :data="zycsReadOnlyFormOptions" :row-rule="rowRule" :col-rule="colRule">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{zycsReadOnlyFormData[item.prop]}}</div>
               </div>
            </template>
          </dj-grid-box>
        </bs-card>
        <bs-card title="纵切机" class="zqj">
          <dj-grid-box :data="zqjReadOnlyFormOptions" :column-num="4" :col-rule="()=>6">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{zqjReadOnlyFormData[item.prop]}}</div>
               </div>
            </template>
          </dj-grid-box>
        </bs-card>
      </div>
      <div class="right-content">
        <bs-card title="分线机/横切机/吊篮" class="fxj">
          <dj-grid-box :data="fxjReadOnlyFormOptions" :column-num="3" :col-rule="()=>8">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{fxjReadOnlyFormData[item.prop]}}</div>
              </div>
            </template>
          </dj-grid-box>
        </bs-card>
        <bs-card title="操作记录">
          <dj-grid-box :data="zycsReadOnlyFormOptions" :row-rule="rowRule" :col-rule="colRule">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{zycsReadOnlyFormData[item.prop]}}</div>
              </div>
            </template>
          </dj-grid-box>
        </bs-card>
      </div>
    </div>
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增原纸品种': '编辑原纸品种'">
      <div class="production-line-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import productionLineService from '../../api/service/productionLine';
  import {djForm} from 'djweb';
  import bsCard from './components/bs-card'

  export default {
    name: 'productionLine',
    components: {bsCard},
    data() {
      return {
        activeTab: '1',
        tabsColumn: [
          {label: '一号线', value: '1'},
          {label: '二号线', value: '2'},
          {label: '三号线', value: '3'},
        ],
        lineStatus: 'on',

        zycsReadOnlyFormData: {
          lengxing: 'BE、BC',
          chesu: '200',
          huanzhi: '500',
          shoudan: '35',
          weidan: '80',
          menfu: '1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500、' +
            '1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500',
        },
        zycsReadOnlyFormOptions: [
          {
            prop: 'lengxing',
            label: '常用楞型',
          },
          {
            prop: 'chesu',
            label: '生产车速(m/s)',
          },
          {
            prop: 'huanzhi',
            label: '换纸最小米数(m)',
          },
          {
            prop: 'shoudan',
            label: '首单最小修边(mm)'
          },
          {
            prop: 'weidan',
            label: '尾单最小米数(m)'
          },
          {
            prop: 'menfu',
            label: '门幅范围(mm)'
          }
        ],
        zycsFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'num',
              label: '原纸编号',
              rules: [
                djForm.rules.required('原纸编号不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 5,
            },
            listeners: {
              'input': (val) => {
                this.formData.num = val.toUpperCase();
              },
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'code',
              label: '原纸代码',
              rules: [
                djForm.rules.required('原纸代码不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.formData.code = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'type',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择相应的原纸类型')],
            },
            attrs: {
              options: [{
                label: '普通瓦楞',
                value: 'chu',
              }, {
                label: '高强瓦楞',
                value: 'gao',
              }, {
                label: '牛卡',
                value: 'da',
              }, {
                label: '再生',
                value: 'daa',
              }],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'kezhong',
              label: '克重',
              rules: [
                djForm.rules.required('克重不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
                ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu',
              label: '门幅',
              rules: [
                djForm.rules.required('门幅不能为空'),
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
                ],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseName',
              label: '仓库名称',
              rules: [
                djForm.rules.required('请选择相应的仓库名称'),
                ],
            },
            attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaName',
              label: '库区名称',
              rules: [
                djForm.rules.required('请选择相应的库区名称'),
                ],
            },
            attrs: {
              options: [{
                label: '原纸1号仓库',
                value: 'chu',
              }, {
                label: '原纸2号仓库',
                value: 'gao',
              }, {
                label: '原纸3号仓库',
                value: 'da',
              }],
            },
          },
        ],

        zqjReadOnlyFormData: {
          zongqiejishu: '两台及以上',
          chesu: '两排',
          huanzhi: '12',
          shoudan: '80',
          weidan: '500',
          menfu1: '7',
          menfu2: '7',
          menfu3: '7',
        },
        zqjReadOnlyFormOptions: [
          {
            prop: 'zongqiejishu',
            label: '纵切机数',
          },
          {
            prop: 'chesu',
            label: '压轮排数',
          },
          {
            prop: 'huanzhi',
            label: '单台压轮数',
          },
          {
            prop: 'shoudan',
            label: '压轮最小间距(mm)'
          },
          {
            prop: 'weidan',
            label: '双机压订单最小米数(m)'
          },
          {
            prop: 'menfu1',
            label: '单台纵切刀数'
          },
          {
            prop: 'menfu2',
            label: '纵切刀间距(mm)'
          },
          {
            prop: 'menfu3',
            label: '换单排刀时间(s)'
          }
        ],
        zqjFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'num',
              label: '原纸编号',
              rules: [
                djForm.rules.required('原纸编号不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 5,
            },
            listeners: {
              'input': (val) => {
                this.formData.num = val.toUpperCase();
              },
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'code',
              label: '原纸代码',
              rules: [
                djForm.rules.required('原纸代码不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.formData.code = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'type',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择相应的原纸类型')],
            },
            attrs: {
              options: [{
                label: '普通瓦楞',
                value: 'chu',
              }, {
                label: '高强瓦楞',
                value: 'gao',
              }, {
                label: '牛卡',
                value: 'da',
              }, {
                label: '再生',
                value: 'daa',
              }],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'kezhong',
              label: '克重',
              rules: [
                djForm.rules.required('克重不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu',
              label: '门幅',
              rules: [
                djForm.rules.required('门幅不能为空'),
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseName',
              label: '仓库名称',
              rules: [
                djForm.rules.required('请选择相应的仓库名称'),
              ],
            },
            attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaName',
              label: '库区名称',
              rules: [
                djForm.rules.required('请选择相应的库区名称'),
              ],
            },
            attrs: {
              options: [{
                label: '原纸1号仓库',
                value: 'chu',
              }, {
                label: '原纸2号仓库',
                value: 'gao',
              }, {
                label: '原纸3号仓库',
                value: 'da',
              }],
            },
          },
        ],

        fxjReadOnlyFormData: {
          zongqiejishu: '50',
          chesu: '50',
          huanzhi: '大吊篮',
          shoudan: '80',
          weidan: '500',
        },
        fxjReadOnlyFormOptions: [
          {
            prop: 'zongqiejishu',
            label: '分线机宽度(m)',
          },
          {
            prop: 'chesu',
            label: '最小切长(mm)',
          },
          {
            prop: 'huanzhi',
            label: '吊篮类型：',
          },
          {
            prop: 'shoudan',
            label: '吊篮长度(m)'
          },
          {
            prop: 'weidan',
            label: '最小叠单米数(m)'
          }
        ],
        fxjFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'num',
              label: '原纸编号',
              rules: [
                djForm.rules.required('原纸编号不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 5,
            },
            listeners: {
              'input': (val) => {
                this.formData.num = val.toUpperCase();
              },
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'code',
              label: '原纸代码',
              rules: [
                djForm.rules.required('原纸代码不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.formData.code = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'type',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择相应的原纸类型')],
            },
            attrs: {
              options: [{
                label: '普通瓦楞',
                value: 'chu',
              }, {
                label: '高强瓦楞',
                value: 'gao',
              }, {
                label: '牛卡',
                value: 'da',
              }, {
                label: '再生',
                value: 'daa',
              }],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'kezhong',
              label: '克重',
              rules: [
                djForm.rules.required('克重不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu',
              label: '门幅',
              rules: [
                djForm.rules.required('门幅不能为空'),
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseName',
              label: '仓库名称',
              rules: [
                djForm.rules.required('请选择相应的仓库名称'),
              ],
            },
            attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaName',
              label: '库区名称',
              rules: [
                djForm.rules.required('请选择相应的库区名称'),
              ],
            },
            attrs: {
              options: [{
                label: '原纸1号仓库',
                value: 'chu',
              }, {
                label: '原纸2号仓库',
                value: 'gao',
              }, {
                label: '原纸3号仓库',
                value: 'da',
              }],
            },
          },
        ],

        dialogTypeIsAdd: null,
        dialogVisible: false
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
      tabClick(){

      },
      changeLineStatus(val){

      },
      rowRule(item) {
        let map = {lengxing: 0, chesu: 0, huanzhi: 0, shoudan: 1, weidan: 1, menfu: 2};
        return map[item.prop];
      },
      colRule(item){
        if (item.prop === 'menfu') {
          return 24
        }
        return 8
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
      confirm(data) {
        this.$refs.form.validate(()=>{
          productionLineService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        });
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.$refs.form.resetFields();
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
  @{deep} .operation {
    a {
      margin-right: 15px;
      cursor: pointer;
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
    .tab-content{
      width: 100%;
      display: flex;
      .bs-card-row{
        display: flex;
        line-height: 1.5;
        color: #8b8b8b;
        .bs-card-label{
          width: 165px;
          text-align: right;
          padding: 5px;
        }
        .bs-card-value{
          padding: 5px;
        }
      }

      .left-content{
        width: 60%;
        .el-col-24{
          .bs-card-value{
            width: 84%;
          }
        }
        .zqj{
          .bs-card-label{
            width: 200px;
          }
          .bs-card-value{
            width: 50px;
          }
        }
      }
      .right-content{
        width: 40%;
        margin-left: 30px;
      }
    }
  }
  .production-line-dialog {
    width: 50vw;
  }
</style>
