<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm" :title="dialogTypeIsAdd?'新增生产线': '编辑生产线'">
    <div class="production-line-dialog">
      <h4>基础参数</h4>
      <dj-form ref="form" :form-data="prodLineData.jccs" :form-options="formOptions.jccs" :column-num="4"></dj-form>
      <h4>纵切机</h4>
      <dj-form ref="form" :form-data="prodLineData.zqj" :form-options="formOptions.zqj" :column-num="4"></dj-form>
      <h4>分线机、横切机、吊篮</h4>
      <dj-form ref="form" :form-data="prodLineData.fxj" :form-options="formOptions.fxj"
               :column-num="4" :col-rule="()=> 6"></dj-form>
      <h4>门幅范围</h4>
      <div class="optional">
        <div class="optional-area" @click="selectPaper($event)">
          <div class="optional-area-item" :class="prodLineData.jccs.menfu.includes(code)?'selected': ''"
               v-for="code in optionalPaper" :key="code">{{code}}
          </div>
        </div>
      </div>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  import productionLineService from '../../../../api/service/productionLine';
  const ruleMoreThan9999 = {type: 'number',max: 9999, message: '不能大于9999', trigger: 'change'}
  const ruleMustNumber =  {type: 'number1', message: '只可输入数字', trigger: 'change'}
  export default {
    name: 'EditAdd',
    props: {
      dialogTypeIsAdd: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        prodLineData: {},
        formOptions: {
          jccs: [
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
                prop: 'commonTilemodel',
                label: '常用楞型',
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
                prop: 'lineSpeed',
                label: '生产车速',
                rules: [
                  djForm.rules.required('生产车速不能为空'),
                  ruleMustNumber],
              },
              attrs: {
                maxLength: 10,
                type: 'number'
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'changeorderMinLength',
                label: '换纸最小米数',
                rules: [
                  djForm.rules.required('换纸最小米数不能为空'),
                  ruleMustNumber
                ],
              },
              attrs: {
                maxLength: 10,
                type: 'number'
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'firstorderWasteWith',
                label: '首单最小修边',
                rules: [
                  djForm.rules.required('首单最小修边不能为空'),
                  ruleMustNumber
                ],
              },
              attrs: {
                maxLength: 10,
                type: 'number'
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'lastorderMinLength',
                label: '尾单最小米数',
                rules: [
                  djForm.rules.required('尾单最小米数不能为空'),
                  ruleMustNumber
                ],
              },
              attrs: {
                maxLength: 10,
                type: 'number'
              },
            },
          ],
          zqj: [
            {
              type: 'radio',
              formItem: {
                prop: 'slimachNumbers',
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
                prop: 'slimachWheelRows',
                label: '压轮排数',
                rules: [
                  djForm.rules.required('请选择相应的压轮排数')
                ],
              },
              attrs: {
                options: [{
                  label: '一排',
                  value: '1'
                }, {
                  label: '两排',
                  value: '2'
                }]
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachWheelCount',
                label: '单台压轮数',
                rules: [
                  djForm.rules.required('单台压轮数不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachWheelSamesideSpace',
                label: '压轮最小间距(mm)',
                rules: [
                  djForm.rules.required('压轮最小间距不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachWdoubleMinLength',
                label: '双机压订单',
                rules: [
                  djForm.rules.required('双机压订单不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachKnifeCount',
                label: '单台纵切刀数',
                rules: [
                  djForm.rules.required('单台纵切刀数不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachKnifeSpace',
                label: '纵切刀间距',
                rules: [
                  djForm.rules.required('纵切刀间距不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachKnifeChangetime',
                label: '换单排刀时间',
                rules: [
                  djForm.rules.required('换单排刀时间不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
          ],
          fxj: [
            {
              type: 'input',
              formItem: {
                prop: 'partlineMachineWidth',
                label: '分线机宽度',
                rules: [
                  djForm.rules.required('分线机宽度不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'minCutLength',
                label: '最小切长',
                rules: [
                  djForm.rules.required('最小切长不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'select',
              formItem: {
                prop: 'basketType',
                label: '吊篮类型',
                rules: [djForm.rules.required('请选择相应的吊篮类型')],
              },
              attrs: {
                options: [{
                  label: '大吊篮',
                  value: 'big',
                }, {
                  label: '小吊篮',
                  value: 'small',
                }],
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'basketLength',
                label: '吊篮长度',
                rules: [
                  djForm.rules.required('吊篮长度不能为空'),
                  ruleMoreThan9999
                ],
              },
              attrs: {
                type: 'number'
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'statckCount',
                label: '最小叠单米数',
                rules: [
                  djForm.rules.required('最小叠单米数不能为空'),
                  {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
                ],
              },
              attrs: {
                type: 'number'
              }
            }
          ],
        },
        optionalPaper: []
      };
    },
    methods: {
      confirm(data) {
        this.$refs.form.validate(() => {
          productionLineService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        });
      },
      close() {
        this.$emit('close')
      },
      selectPaper() {

      }
    },
    created() {
      let mock = [];
      for (let i = 0; i < 20; i++) {
        mock.push(800 + i * 100);
      }
      this.optionalPaper = mock;
    },
    mounted(){
      this.$refs.dialog.open()
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .production-line-dialog {
    width: 80vw;
  }
  @{deep} .optional{
    width: 100%;
    min-height: 120px;
    margin-bottom: 20px;
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
        color: #606266;
        background: #f0f2f5;
        border-radius: 5px;
        cursor: pointer;
        user-select: none;
        &.selected{
          pointer-events: none;
          cursor: not-allowed;
          color: #fff;
          background: #3654ea;
        }
      }
    }
  }
</style>
