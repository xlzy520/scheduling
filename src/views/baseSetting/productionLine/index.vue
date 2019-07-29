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
       <card title="基础参数">
          <dj-grid-box :data="jccsReadOnlyFormOptions" :row-rule="rowRule" :col-rule="colRule">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{productionLineData.jccsReadOnlyFormData[item.prop]}}</div>
               </div>
            </template>
          </dj-grid-box>
       </card>
       <card title="纵切机" class="zqj">
          <dj-grid-box :data="zqjReadOnlyFormOptions" :column-num="zqjColumnNum" :col-rule="()=>zqjColRule">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{productionLineData.zqjReadOnlyFormData[item.prop]}}</div>
               </div>
            </template>
          </dj-grid-box>
       </card>
      </div>
      <div class="right-content">
       <card title="分线机/横切机/吊篮">
          <dj-grid-box :data="fxjReadOnlyFormOptions" :column-num="3" :col-rule="()=>8">
            <template slot-scope="{item}">
              <div class="bs-card-row">
                <div class="bs-card-label">{{item.label}}：</div>
                <div class="bs-card-value"> {{productionLineData.fxjReadOnlyFormData[item.prop]}}</div>
              </div>
            </template>
          </dj-grid-box>
       </card>
       <card title="操作记录">
          <div v-for="record in productionLineData.czjl" class="record-item">
            {{record.a}}&nbsp&nbsp{{record.b}}&nbsp&nbsp{{record.c}}
            <el-button type="primary" size="mini" @click="viewRecordDetail(record.id)">查看详情</el-button>
          </div>
       </card>
      </div>
    </div>
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增生产线': '编辑生产线'">
      <div class="production-line-dialog">
        <h4>基础参数</h4>
        <dj-form ref="form" :form-data="productionLineData.jccsReadOnlyFormData" :form-options="jccsFormOptions" :column-num="4"></dj-form>
        <h4>纵切机</h4>
        <dj-form ref="form" :form-data="productionLineData.zqjReadOnlyFormData" :form-options="zqjFormOptions" :column-num="4"></dj-form>
        <h4>分线机、横切机、吊篮</h4>
        <dj-form ref="form" :form-data="productionLineData.fxjReadOnlyFormData" :form-options="fxjFormOptions"
                 :column-num="4" :col-rule="()=> 6"></dj-form>
        <h4>门幅范围</h4>
        <div class="optional">
          <div class="optional-label">可选原纸</div>
          <div class="optional-area" @click="selectPaper($event)">
            <div class="optional-area-item" :class="productionLineData.jccsReadOnlyFormData.menfu.includes(code)?'selected': ''"
                 v-for="code in optionalPaper" :key="code">{{code}}</div>
          </div>
        </div>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import productionLineService from '../../../api/service/productionLine';
  import {djForm} from 'djweb';
  import Card from './components/Card';

  export default {
    name: 'productionLine',
    components: {Card},
    data() {
      return {
        activeTab: '1',
        tabsColumn: [
          {label: '一号线', value: '1'},
          {label: '二号线', value: '2'},
          {label: '三号线', value: '3'},
        ],
        lineStatus: 'on',

        productionLineData: {
          jccsReadOnlyFormData: {
            lengxing: 'BE、BC',
            chesu: '200',
            huanzhi: '500',
            shoudan: '35',
            weidan: '80',
            menfu: '1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500、' +
              '1200、1250、1300、1500、1200、1250、1300、1500、1200、1250、1300、1500',
          },
          zqjReadOnlyFormData: {
            zongqiejishu: '二台及以上',
            chesu: '两排',
            huanzhi: '12',
            shoudan: '80',
            weidan: '500',
            menfu1: '7',
            menfu2: '7',
            menfu3: '7',
          },
          fxjReadOnlyFormData: {
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

        jccsReadOnlyFormOptions: [
          {prop: 'lengxing', label: '常用楞型'},
          {prop: 'chesu', label: '生产车速(m/s)'},
          {prop: 'huanzhi', label: '换纸最小米数(m)'},
          {prop: 'shoudan', label: '首单最小修边(mm)'},
          {prop: 'weidan', label: '尾单最小米数(m)'},
          {prop: 'menfu', label: '门幅范围(mm)'}
        ],
        jccsFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '生产线名称',
              rules: [
                djForm.rules.required('生产线名称不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'lengxing',
              label: '常用楞型',
              rules: [
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              key: 'multiple',
              type: 'multiple',
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
              prop: 'chesu',
              label: '生产车速',
              rules: [djForm.rules.required('生产车速不能为空')],
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
              prop: 'huanzhi',
              label: '换纸最小米数',
              rules: [
                djForm.rules.required('换纸最小米数不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
                ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'shoudan',
              label: '首单最小修边',
              rules: [
                djForm.rules.required('首单最小修边不能为空'),
                {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
                ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'weidan',
              label: '尾单最小米数',
              rules: [
                djForm.rules.required('尾单最小米数不能为空'),
                ],
            }
          },
        ],

        zqjReadOnlyFormOptions: [
          {prop: 'zongqiejishu', label: '纵切机数'},
          {prop: 'chesu', label: '压轮排数'},
          {prop: 'huanzhi', label: '单台压轮数'},
          {prop: 'shoudan', label: '压轮最小间距(mm)'},
          {prop: 'weidan', label: '双机压订单最小米数(m)'},
          {prop: 'menfu1', label: '单台纵切刀数'},
          {prop: 'menfu2', label: '纵切刀间距(mm)'},
          {prop: 'menfu3', label: '换单排刀时间(s)'}
        ],
        zqjFormOptions: [
          {
            type: 'radio',
            formItem: {
              prop: 'zongqiejishu',
              label: '纵切机数',
              rules: [
                djForm.rules.required('请选择相应的纵切机数'),
              ],
            },
            attrs: {
              options: [{
                label: '一台',
                value: '1'
              }, {
                label: '二台及以上',
                value: '2'
              }]
            },
          },
          {
            type: 'radio',
            formItem: {
              prop: 'chesu',
              label: '压轮排数',
              rules: [
                djForm.rules.required('请选择相应的压轮排数')
              ],
            },
            attrs: {
              options: [{
                label: '一台',
                value: '1'
              }, {
                label: '二台及以上',
                value: '2'
              }]
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'huanzhi',
              label: '单台压轮数',
              rules: [
                djForm.rules.required('单台压轮数不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'shoudan',
              label: '压轮最小间距(mm)',
              rules: [
                djForm.rules.required('压轮最小间距不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'weidan',
              label: '双机压订单',
              rules: [
                djForm.rules.required('双机压订单不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu1',
              label: '单台纵切刀数',
              rules: [
                djForm.rules.required('单台纵切刀数不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu2',
              label: '纵切刀间距',
              rules: [
                djForm.rules.required('纵切刀间距不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'menfu3',
              label: '换单排刀时间',
              rules: [
                djForm.rules.required('换单排刀时间不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
        ],

        fxjReadOnlyFormOptions: [
          {prop: 'zongqiejishu', label: '分线机宽度(m)'},
          {prop: 'chesu', label: '最小切长(mm)'},
          {prop: 'huanzhi', label: '吊篮类型'},
          {prop: 'shoudan', label: '吊篮长度(m)'},
          {prop: 'weidan', label: '最小叠单米数(m)'}
        ],
        fxjFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'zongqiejishu',
              label: '分线机宽度',
              rules: [
                djForm.rules.required('原纸编号不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 5,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'chesu',
              label: '最小切长',
              rules: [
                djForm.rules.required('最小切长不能为空'),
                {pattern: /^\w+$/g, message: '只可输入字母、数字'},
              ],
            },
            attrs: {
              maxLength: 10,
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'huanzhi',
              label: '吊篮类型',
              rules: [djForm.rules.required('请选择相应的吊篮类型')],
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
              prop: 'shoudan',
              label: '吊篮长度',
              rules: [
                djForm.rules.required('吊篮长度不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'weidan',
              label: '最小叠单米数',
              rules: [
                djForm.rules.required('最小叠单米数不能为空'),
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
        dialogVisible: false,

        zqjColumnNum: 4,
        zqjColRule: 6,

        optionalPaper: []
      };
    },
    methods: {
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
      this.zqjGetColRule();
      this.zqjGetColumnNum();
      let mock = [];
      for (let i = 0; i < 20; i++) {
        mock.push(800 + i * 100);
      }
      this.optionalPaper = mock;
      window.addEventListener('resize', ()=>{
        this.zqjGetColRule();
        this.zqjGetColumnNum();
      });
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
    .tab-content{
      width: 100%;
      display: flex;
      .bs-card-row{
        display: flex;
        line-height: 1.5;
        color: #8b8b8b;
        padding: 5px 0;
        .bs-card-label{
          text-align: left;
        }
        .bs-card-value{

        }
      }
      .record-item{
        line-height: 40px;
      }

      .left-content{
        width: 60%;
        .el-col-24{
          .bs-card-value{
            width: 84%;
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
    width: 80vw;
  }
</style>
