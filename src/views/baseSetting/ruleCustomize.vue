<template>
  <div class="table-page rule-customize">
    <dj-table
      :data="tableData"
      :columns="tableColumns"
    >
      <div slot="btn">
        <el-button type="primary" @click="headerBtnAdd('stack')">新增叠单规则</el-button>
        <el-button type="primary" @click="headerBtnAdd('pack')">新增打包规则</el-button>
        <el-button type="primary" @click="preset">预设生产线</el-button>
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
            <el-form :model="child" :rules="rules" ref="childConditionForm" v-for="(child, childIndex) in condition.child"
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
        <div v-for="(condition, index) in stackConditionFormData" :key="condition.key" class="condition-item">
          <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
          <div class="child-condition-list">
            <el-form :model="child" :rules="rules" ref="childConditionForm" v-for="(child, childIndex) in condition.child"
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
  </div>
</template>

<script>
  import ruleCustomizeService from '../../api/service/ruleCustomize';
  import {djForm} from 'djweb';
  const cengshuOption = new Array(6).fill('').map((v, index)=>{
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
        dialogTypeIsAdd: null,

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
                  <a onClick={() => this.changeStatus(row)}>
                    {row.status ? '禁用' : '启用'}</a>
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
        packFormData: {
          name: '',
          zhongliang: '',
          type: '',
          lenglv: '',
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
            type: 'select',
            formItem: {
              prop: 'type',
              label: '原纸楞型',
              rules: [djForm.rules.required('请选择相应的原纸楞型')],
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
              prop: 'lenglv',
              label: '楞型楞率',
              rules: [
                djForm.rules.required('楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
                ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'cengshu',
              label: '层数',
              rules: [
                djForm.rules.required('请选择相应的层数'),
                ],
            },
            attrs: {
              options: cengshuOption
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'area',
              label: '单位面积',
              rules: [
                djForm.rules.required('单位面积不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.packFormData.area = val.toFixed(2);
              },
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'quantity',
              label: '打包数量',
              rules: [
                djForm.rules.required('打包数量不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.packFormData.quantity = val.toFixed(0);
              },
            },
          },
        ],
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
        ]

      };
    },
    methods: {
      addChildCondition(index) {
        this.stackConditionFormData[index].child.push({
          lengxing: '',
          qieshu: '',
          pianshu: '',
          time: Date.now()
        });
      },
      headerBtnAdd(dialogType) {
        this.dialogTypeIsAdd = true;
        this.dialogType = dialogType;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      preset() {

      },
      addCondition() {
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
      },
      removeCondition(index, childIndex) {
        this.stackConditionFormData[index].child.splice(childIndex, 1);
      },
      getTableData(data) {
        ruleCustomizeService.list(data).then((res) => {
          this.tableData = res.list;
        });
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
        // todo  异步验证最终结果错误
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
    }
    .child-condition{
      display: flex;
      justify-content: flex-end;
      padding-top: 10px;
    }
    /deep/ .dj-form .el-form-item .el-form-item__content{
      width: 60%;
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
