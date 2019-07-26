<template>
  <div class="table-page rule-customize">
    <dj-table
      :data="tableData"
      :columns="tableColumns"
    >
      <div slot="btn">
        <el-button type="primary" @click="headerBtnAdd('stack')">新增叠单规则</el-button>
        <el-button type="primary" @click="headerBtnAdd('pack')">新增打包规则</el-button>
        <el-button type="primary" @click="closeSuoBian">关闭缩边</el-button>
      </div>
    </dj-table>
    <dj-dialog v-if="dialogType==='stack'" ref="dialog" @close="close('stack')" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增叠单规则': '编辑叠单规则'">
      <div class="rule-customize-dialog">
        <dj-form ref="stackForm" :form-data="stackFormData" :form-options="stackFormOptions"
                 :column-num="2" />
        <div v-for="(condition, index) in stackConditionFormData" :key="condition.key" class="condition-item">
          <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
          <div class="child-condition-list">
            <el-form :model="child" :rules="stackRules" ref="childConditionForm" v-for="(child, childIndex) in condition.child"
                     :key="child.time" >
              <el-col :span="7" v-if="childIndex===0">
                <el-form-item label="楞型" prop="lengxing">
                  <el-select v-model="child.lengxing">
                    <el-option v-for="option in lengxingOptions"
                               :label="option.label" :value="option.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="切数" prop="qieshu">
                  <el-select v-model="child.qieshu" multiple>
                    <el-option v-for="option in qieshuOptions"
                               :label="option.label" :value="option.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="片数：" prop="pianshu">
                  <el-input v-model="child.pianshu"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="3" class="button-col">
                <i class="el-icon-delete" v-if="childIndex===condition.child.length - 1"
                   @click.prevent="removeCondition(index,childIndex)"></i>
                <i class="el-icon-circle-plus" @click="addChildCondition(index)"
                   v-if="childIndex===condition.child.length - 1"></i>
              </el-col>
            </el-form>
          </div>
        </div>
        <el-button type="primary" @click.prevent="addCondition">添加条件</el-button>
      </div>
    </dj-dialog>
    <dj-dialog v-if="dialogType==='pack'" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增打包规则': '编辑打包规则'">
      <div class="rule-customize-dialog">
        <dj-form ref="form" :form-data="packFormData" :form-options="packFormOptions" :column-num="4"></dj-form>
        <div v-for="(condition, index) in packConditionFormData" :key="condition.key" class="condition-item">
          <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
          <div class="child-condition-list">
            <el-form :model="child" :rules="packRules" ref="childConditionForm" v-for="(child, childIndex) in condition.child"
                     :key="child.time" >
              <el-col :span="7" v-if="childIndex===0">
                <el-form-item label="层数" prop="cengshu">
                  <el-select v-model="child.cengshu">
                    <el-option v-for="option in cengshuOptions"
                               :label="option.label" :value="option.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="单位面积(m²)" prop="area" class="unit-area">
                  <dj-input  type="float" key="area" v-model.number="child.area"></dj-input>
                  <div>至</div>
                  <dj-input v-model.number="child.area"></dj-input>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="打包数量" prop="quantity">
                  <el-input v-model="child.quantity"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="3" class="button-col">
                <i class="el-icon-delete" v-if="childIndex===condition.child.length - 1"
                   @click.prevent="removeCondition(index,childIndex)"></i>
                <i class="el-icon-circle-plus" @click="addChildCondition(index)"
                   v-if="childIndex===condition.child.length - 1"></i>
              </el-col>
            </el-form>
          </div>
        </div>
        <el-button type="primary" @click.prevent="addCondition">添加条件</el-button>
      </div>
    </dj-dialog>
    <dj-dialog v-if="dialogType.includes('view')" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogType==='stack_view'?'查看打包规则': '查看叠单规则'">
      <div class="rule-customize-dialog">
        <div class="rule-view-header" v-if="dialogType==='stack_view'">
          <div class="rule-view-header-label">最小订单数： {{viewData.left}}</div>
          <div class="rule-view-header-label">最大堆叠单数： {{viewData.right}}</div>
        </div>
        <div class="rule-view-header" v-else>
          <div class="rule-view-header-label">单批打包重量(Kg)： {{viewData.left}}</div>
          <div class="rule-view-header-label">A楞型楞率： {{viewData.right}}</div>
          <div class="rule-view-header-label">B楞型楞率： {{viewData.right}}</div>
          <div class="rule-view-header-label">C楞型楞率： {{viewData.right}}</div>
          <div class="rule-view-header-label">E楞型楞率： {{viewData.right}}</div>
          <div class="rule-view-header-label">F楞型楞率： {{viewData.right}}</div>
        </div>
        <div class="rule-view-content">
          <dj-table
            border
            :data="viewData.tableData"
            :columns="viewTableColumns"
            :span-method="objectSpanMethod"
          ></dj-table>
        </div>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import ruleCustomizeService from '../../api/service/ruleCustomize';
  import {djForm} from 'djweb';
  const cengshuOptions = new Array(6).fill('').map((v, index)=>{
      return {
        value: index + 2,
        label: index + 2,
      };
    });

  export default {
    name: 'ruleCustomize',
    data() {
      return {
        dialogType: '',
        dialogTypeIsAdd: false,
        viewTableColumns: [],
        viewData: {
          left: '',
          right: '',
          tableData: []
        },

        tableData: [],
        tableColumns: [
          {label: '名称', prop: 'name'},
          {label: '规则类型', prop: 'type'},
          {label: '生效时间', prop: 'effectiveTime'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {label: '启用状态', prop: 'status', formatter: row => row.status ? '已启用' : '已失效'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.view(row)}>查看</a>
                  <a onClick={() => this.changeStatus(row)}>{row.status ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ],

        stackFormData: {
          name: '',
          shengchanxian: '',
          pianshu: '',
          mishu: '',
          diedanshu: '',
        },
        stackFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '规则名称',
              rules: [
                djForm.rules.required('规则名称不能为空'),
                {pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/g, message: '只可输入汉字、字母、数字'},
              ],
            },
            attrs: {
              maxLength: 40,
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'shengchanxian',
              label: '生产线',
              rules: [djForm.rules.required('请选择相应的生产线')],
            },
            attrs: {
              options: [{
                label: '一号线',
                value: '1',
              }, {
                label: '二号线',
                value: '2',
              }],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'pianshu',
              label: '订单最大片数',
              rules: [
                djForm.rules.required('订单最大片数不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              maxLength: 10,
              type: 'number'
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'mishu',
              label: '订单最小米数',
              rules: [
                djForm.rules.required('订单最小米数不能为空'),
                {type: 'number', message: '只可输入数字'},
                {type: 'number', max: 9999, message: '不能超过9999'},
              ],
            },
            attrs: {
              maxLength: 10,
              type: 'number'
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'diedanshu',
              label: '最大堆叠单数',
              rules: [
                djForm.rules.required('最大堆叠单数不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              maxLength: 10,
              type: 'number'
            }
          },
        ],
        stackConditionFormData: [
          {
            child: [
              {
                lengxing: '',
                qieshu: '',
                pianshu: '',
                time: Date.now()
              }
            ]
          },
        ],
        stackRules: {
          lengxing: [
            {required: true, message: '请选择楞型', trigger: 'change'}
          ],
          qieshu: [
            {required: true, message: '请选择切数', trigger: 'change'}
          ],
          pianshu: [
            {required: true, message: '请填写片数', trigger: 'change'}
          ]
        },
        packFormData: {
          name: '',
          zhongliang: '',
          aLengLv: '',
          bLengLv: '',
          cLengLv: '',
          eLengLv: '',
          fLengLv: '',
          cengshu: '',
          area: '',
          quantity: '',
        },
        packFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '新增规则名称',
              rules: [
                djForm.rules.required('新增规则名称不能为空'),
                {pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/g, message: '只可输入汉字、字母、数字'},
              ],
            },
            attrs: {
              maxLength: 40,
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'zhongliang',
              label: '单批打包重量',
              rules: [
                djForm.rules.required('单批打包重量不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
            listeners: {
              'input': (val) => {
                this.packFormData.zhongliang = val.toFixed(2);
              },
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'aLengLv',
              label: 'A楞型楞率',
              rules: [
                djForm.rules.required('A楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'bLengLv',
              label: 'B楞型楞率',
              rules: [
                djForm.rules.required('B楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'cLengLv',
              label: 'C楞型楞率',
              rules: [
                djForm.rules.required('C楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'eLengLv',
              label: 'E楞型楞率',
              rules: [
                djForm.rules.required('E楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'fLengLv',
              label: 'F楞型楞率',
              rules: [
                djForm.rules.required('F楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          }
        ],
        packConditionFormData: [
          {
            child: [
              {
                cengshu: '',
                area: '',
                quantity: '',
                time: Date.now()
              }
            ]
          },
        ],
        packRules: {
          cengshu: [
            {required: true, message: '请选择层数', trigger: 'change'}
          ],
          area: [
            {required: true, message: '请选择单位面积', trigger: 'change'}
          ],
          quantity: [
            {required: true, message: '请填写打包数量', trigger: 'change'}
          ]
        },
        lengxingOptions: [
          {
            label: 'A',
            value: 'chu',
          }, {
            label: 'B',
            value: 'gao',
          }, {
            label: 'C',
            value: 'da',
          }, {
            label: 'D',
            value: 'daa',
          }],
        qieshuOptions: [
          {
            label: 'A',
            value: 'chu',
          }, {
            label: 'B',
            value: 'gao',
          }, {
            label: 'C',
            value: 'da',
          }, {
            label: 'D',
            value: 'daa',
          }],
        cengshuOptions: cengshuOptions,
        rules: {
          lengxing: [
            {required: true, message: '请选择楞型', trigger: 'change'}
          ],
          qieshu: [
            {required: true, message: '请选择切数', trigger: 'change'}
          ],
          pianshu: [
            {required: true, message: '请填写片数', trigger: 'change'}
          ]
        },


      };
    },
    methods: {
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          if (rowIndex % 2 === 0) {
            return {
              rowspan: 2,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      },
      addChildCondition(index) {
        if (this.dialogType === 'stack') {
          this.stackConditionFormData[index].child.push({
            lengxing: '',
            qieshu: '',
            pianshu: '',
            time: Date.now()
          });
        } else {
          this.packConditionFormData[index].child.push({
            cengshu: '',
            area: '',
            quantity: '',
            time: Date.now()
          });
        }
      },
      headerBtnAdd(dialogType) {
        this.dialogTypeIsAdd = true;
        this.dialogType = dialogType;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      addCondition() {
        if (this.dialogType === 'stack') {
          this.stackConditionFormData.push({
            child: [
              {
                lengxing: '',
                qieshu: '',
                pianshu: '',
                time: Date.now()
              }
            ]
          });
        } else {
          this.packConditionFormData.push({
            child: [
              {
                cengshu: '',
                area: '',
                quantity: '',
                time: Date.now()
              }
            ]
          });
        }
      },
      removeCondition(index, childIndex) {
        // todo 增加删除动画
        const targetArr = this[this.dialogType + 'ConditionFormData'];
        if (targetArr[index].child.length === 1) {
          targetArr.splice(index, 1);
        } else {
          targetArr[index].child.splice(childIndex, 1);
        }
      },
      changeStatus(row) {
        // 接口
        if (row.status) {
          this.$confirm('您确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            ruleCustomizeService.list().then((res) => {
              this.$message('禁用成功', 'success');
              row.status = !row.status;
            });
          });
        } else {
          ruleCustomizeService.list().then((res) => {
            this.$message('启用成功', 'success');
            row.status = !row.status;
          });
        }
      },
      view(row) {
        let stack = [
          {label: '楞型', prop: 'id'},
          {label: '切数', prop: 'name'},
          {label: '片数', prop: 'amount1'},
        ];
        let pack = [
            {label: '层数', prop: 'id'},
            {label: '单位面积（m²）', prop: 'name'},
            {label: '打包数量', prop: 'amount1'},
          ];
        this.viewData = {
          left: 500,
          right: 600,
          tableData: [
            {
            id: '12987122',
            name: '王小虎',
            amount1: '234',
            amount2: '3.2',
            amount3: 10
          }, {
            id: '12987123',
            name: '王小虎',
            amount1: '165',
            amount2: '4.43',
            amount3: 12
          }, {
            id: '12987124',
            name: '王小虎',
            amount1: '324',
            amount2: '1.9',
            amount3: 9
          }, {
            id: '12987125',
            name: '王小虎',
            amount1: '621',
            amount2: '2.2',
            amount3: 17
          }, {
            id: '12987126',
            name: '王小虎',
            amount1: '539',
            amount2: '4.1',
            amount3: 15
          }]
        };
        this.dialogType = (row.type === '叠单规则' ? 'stack' : 'pack') + '_view';
        this.viewTableColumns = row.type === '叠单规则' ? stack : pack;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      edit(row) {
        this.dialogType = row.type === '叠单规则' ? 'stack' : 'pack';
        this.dialogTypeIsAdd = false;
        this.packFormData = this.$method.deepClone(row);
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      closeSuoBian() {

      },
      search(data) {
        this.getTableData({
          ...data
        });
      },
      async confirm(data) {
        let allTrue = true;
        // todo  不同表单、异步验证最终结果错误
        this.$refs.childConditionForm.map(child=>{
          child.validate(valid=>{
            if (!valid) {
              allTrue = false;
            }
          });
        });
        this.$refs.stackForm.validate(valid=>{
          if (!valid) {
            allTrue = false;
          }
        });
        if (allTrue) {
          ruleCustomizeService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        }
      },
      close() {
        if (this.dialogType === 'stack') {
          this.stackFormData = {
            name: '',
            shengchanxian: '',
            pianshu: '',
            mishu: '',
            diedanshu: '',
          };
          this.stackConditionFormData = [
            {
              child: [
                {
                  lengxing: '',
                  qieshu: '',
                  pianshu: '',
                  time: Date.now()
                }
              ]
            },
          ];
        } else {

        }
        this.dialogType = '';
      },
      getTableData(data) {
        ruleCustomizeService.list(data).then((res) => {
          this.tableData = res.list;
        });
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

  .rule-customize-dialog {
    width: 80vw;
    padding-top: 20px;
    .condition-item{
      display: flex;
      .el-form{
        display: flex;
        justify-content: flex-end;
      }
      .condition-index-label{
        margin-bottom: 22px;
        text-align: right;
      }
      .child-condition-list{

      }
      .button-col.el-col{
        margin-top: 8px;
        i.el-icon-delete,i.el-icon-circle-plus{
          font-size: 18px;
        }
        i.el-icon-delete{
          margin: 0 20px;
        }
        i.el-icon-circle-plus{
          color: #3554ea;
        }
      }
      /deep/ .unit-area{
        .el-form-item__label{
          line-height: 100px;
        }
        .el-form-item__content{
          display: flex;
          line-height: 100px;
        }
      }
    }
    /deep/ .dj-form .el-form-item .el-form-item__content{
      width: 60%;
    }
    .rule-view-header{
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      color: #000;
    }
  }
</style>
<style lang="less">
  .el-dialog__wrapper .el-dialog .el-dialog__body .dj-dialog-content [class*=el-col-].el-col-7 {
    width: 29.16667%;
     margin-right: unset;
  }
  .el-dialog__wrapper .el-dialog .el-dialog__body .dj-dialog-content [class*=el-col-].el-col-3 {
    width: 12.5%;
  }
  .el-dialog__wrapper .el-dialog .el-dialog__body .dj-dialog-content [class*=el-col-].el-col-6 {
    width: 25%;
  }
  .el-dialog__wrapper .el-dialog .el-dialog__body .dj-dialog-content [class*=el-col-] {
    width: unset;
    margin-right: unset;
  }
</style>
