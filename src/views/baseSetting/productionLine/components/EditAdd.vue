<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm" :title="dialogTypeIsAdd?'新增生产线': '编辑生产线'">
    <div class="production-line-dialog">
      <h4>基础参数</h4>
      <dj-form ref="form1" :form-data="prodLineData.jccs" :form-options="formOptions.jccs" :column-num="columnNum"></dj-form>
      <h4>纵切机</h4>
      <dj-form ref="form2" :form-data="prodLineData.zqj" :form-options="formOptions.zqj" :column-num="columnNum"></dj-form>
      <h4>分线机、横切机、吊篮</h4>
      <dj-form ref="form3" :form-data="prodLineData.fxj" :form-options="formOptions.fxj"
               :column-num="columnNum" :col-rule="()=>columnNum===4?6:8"></dj-form>
      <h4>门幅范围</h4>
      <div class="optional">
        <div class="optional-area" @click="selectPaper($event)">
          <div class="optional-area-item" :class="isIncludesPaper(code)?'selected': ''"
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

  const ruleMoreThan9999 = {type: 'number', max: 9999, message: '不能大于9999', trigger: 'change'};
  const ruleMustNumber = {type: 'number', message: '只可输入数字', trigger: 'change'};
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
        columnNum: 4,
        prodLineData: {
          jccs: {
            commonTilemodel: [],
            lineSpeed: 222,
            changeorderMinLength: 222,
            firstorderWasteWith: 222,
            lastorderMinLength: 222,
            linePaperSizeModels: [],
          },
          zqj: {
            slimachNumbers: 1,
            slimachWheelRows: 1,
            slimachWheelCount: 222,
            slimachWheelSamesideSpace: 222,
            slimachWdoubleMinLength: 222,
            slimachKnifeCount: 222,
            slimachKnifeSpace: 222,
            slimachKnifeChangetime: 222,
          },
          fxj: {
            partlineMachineWidth: 222,
            minCutLength: 222,
            basketType: '',
            basketLength: 222,
            statckCount: 222,
          }
        },
        formOptions: {
          jccs: [
            {
              type: 'custom',
              key: 'commonTilemodel',
              formItem: {
                prop: 'commonTilemodel',
                label: '常用楞型',
              },
              attrs: {
                default: []
              },
              component: {
                props: ['value', 'default'],
                render(h) {
                  // 全选逻辑
                  const input = (arr) => {
                    let realArr;
                    let lastValue = arr[arr.length - 1];
                    if (lastValue === 'all') {
                      realArr = [lastValue];
                    } else {
                      realArr = arr.filter(val => val !== 'all');
                    }
                    this.$emit('input', realArr);
                  };
                  return (
                    <dj-select value={this.value}
                               collapse-tags
                               type="multiple"
                               default={this.default}
                               options={this.$enum.fluteType}
                               onInput={input}
                    ></dj-select>
                  );
                }
              }
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
                key: 'float',
                type: 'float',
                maxLength: 10,
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
                  value: 1
                }, {
                  label: '二台及以上',
                  value: 2
                }]
              },
              listeners: {
                change: (val)=>{
                  if (val === '1') {
                    console.log(5);
                    this.$set(this.formOptions.zqj[4].formItem, 'rules', [
                      ruleMoreThan9999
                    ]);
                  } else {
                    this.$set(this.formOptions.zqj[4].formItem, 'rules', [
                      djForm.rules.required('双机压订单不能为空'),
                      ruleMoreThan9999
                    ]);
                  }
                }
              }
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
                  value: 1
                }, {
                  label: '两排',
                  value: 2
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
                label: '压轮最小间距',
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
                rules: [],
              },
              attrs: {
                options: [{
                  label: '大吊篮',
                  value: 1,
                }, {
                  label: '小吊篮',
                  value: 2,
                }],
              },
              listeners: {
                change: (val)=>{
                  this.prodLineData.fxj.statckCount = '';
                  const cache = {
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
                  };
                  if (val === 2) {
                    if (this.prodLineData.fxj.basketLength !== '') {
                      this.prodLineData.fxj.basketLength = '';
                    }
                    this.formOptions.fxj.splice(4, 0, cache);
                  } else {
                    this.formOptions.fxj.splice(4, 1);
                  }
                }
              }
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
            }
          ],
        },
        optionalPaper: [],
        cache: {}
      };
    },
    methods: {
      confirm() {
        const formMap = ['1', '2', '3'];
        const formValidate = new Promise((resolve) => {
          let allIsTrue = [];
          formMap.map((v, index)=>{
            this.$refs['form' + v].validate(() => {
              allIsTrue.push(true);
              if (index === 2) {
                resolve(allIsTrue);
              }
            });
          });
        });
        formValidate.then(res=>{
          if (res.length === 3 && res.every(v=>v)) {
            if (this.isModify()) {
              this.$confirm('是否保存填写内容？', '', {
                type: 'warning',
                showClose: false,
              }).then(() => {
                const params = Object.keys(this.prodLineData).reduce((sum, val)=>{
                  sum = Object.assign(sum, this.prodLineData[val]);
                  return sum;
                }, {});
                params.linePaperSizeModels = params.linePaperSizeModels.map(v=>{return {paperSize: v};});
                params.commonTilemodel = params.commonTilemodel.join(',');
                productionLineService.addLine(params).then((res) => {
                  this.$emit('close');
                  const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
                  this.$message(message, 'success');
                  this.$emit('getData');
                });
              });
            } else {
              this.$message('未修改', 'info');
              return false;
            }
          }
        });

      },
      isModify() {
        const params = Object.keys(this.prodLineData).reduce((sum, val)=>{
          sum = Object.assign(sum, this.prodLineData[val]);
          return sum;
        }, {});
        const keysArr = Object.keys(params);
        let modify = keysArr.findIndex(v=> {
          if (typeof params[v] !== 'object') {
            return params[v] !== this.cache[v];
          } else {
            let arrDiff = params[v].findIndex((v1, index)=> v1 !== this.cache[v][index]);
            if (arrDiff > -1) {
              return true;
            }
          }
        });
        return modify > -1;
      },
      close() {
        if (this.isModify()) {
          this.$confirm('生产线信息未保存，确认是否关闭？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.$emit('close');
          });
        } else {
          this.$emit('close');
        }
      },
      isIncludesPaper(code) {
        const { linePaperSizeModels } = this.prodLineData.jccs;
        return linePaperSizeModels.includes(code);
      },
      selectPaper(evt) {
        let { innerText: code, className } = evt.target;
        code = Number(code);
        let linePaperSizeModels = this.prodLineData.jccs.linePaperSizeModels;
        if (code && className.includes('optional-area-item')) {
          if (this.isIncludesPaper(code)) {
            const index = linePaperSizeModels.findIndex(v=>v === code);
            linePaperSizeModels.splice(index, 1);
          } else {
            linePaperSizeModels.push(code);
          }
        }
      },
      getColumnNum() {
        const width = window.innerWidth;
        this.columnNum = width < 1367 ? 3 : 4;
      },
    },
    created() {
      let mock = [];
      for (let i = 0; i < 33; i++) {
        mock.push(900 + i * 50);
      }
      this.optionalPaper = mock;
    },
    mounted() {
      this.$nextTick(()=>{
        this.$refs.dialog.open();
        let deepCloneData = this.$method.deepClone(this.prodLineData);
        this.cache = Object.keys(deepCloneData).reduce((sum, val)=>{
          sum = Object.assign(sum, deepCloneData[val]);
          return sum;
        }, {});
        this.getColumnNum();
        window.addEventListener('resize', ()=>{
          this.getColumnNum();
        });
      });
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .production-line-dialog {
    width: 80vw;
    h4{
      padding: 10px 0;
    }
  }
  @{deep} .optional{
    width: 100%;
    min-height: 120px;
    margin-bottom: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    &-area{
      width: 100%;
      min-height: 80px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      border: 1px solid #eee;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 15px;
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
          color: #fff;
          background: #3654ea;
        }
      }
    }
  }
</style>
