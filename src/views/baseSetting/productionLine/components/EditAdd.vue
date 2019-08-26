<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm" :title="dialogTypeIsAdd?'新增生产线': '编辑生产线'">
    <div class="production-line-dialog" v-loading="loading">
      <h4>基础参数</h4>
      <dj-form ref="form1" :form-data="prodLineData.jccs" :form-options="formOptions.jccs" :column-num="3"></dj-form>
      <h4>纵切机</h4>
      <dj-form ref="form2" :form-data="prodLineData.zqj" :form-options="formOptions.zqj" :column-num="3"></dj-form>
      <h4>分线机、横切机、吊篮</h4>
      <dj-form ref="form3" :form-data="prodLineData.fxj" :form-options="formOptions.fxj"
               :column-num="3" :col-rule="()=>8"></dj-form>
      <h4>门幅范围</h4>
      <div class="optional">
        <div class="optional-area">
          <div class="optional-area-item" :class="isIncludesPaper(code)?'selected': ''"
               v-for="code in optionalPaper" :key="code" :title="code" @click="selectPaper(code)">{{code}}
          </div>
        </div>
      </div>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  import productionLineService from '../../../../api/service/productionLine';
  import formRules from "../../formRules";

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
        loading: false,
        lineId: '',
        lineNum: '',
        prodLineData: {
          jccs: {
            commonTilemodel: [],
            lineSpeed: '',
            changeorderMinLength: '',
            firstorderWasteWith: '',
            lastorderMinLength: '',
            linePaperSizeModels: [],
          },
          zqj: {
            slimachNumbers: 1,
            slimachWheelRows: 1,
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
            stackCount: '',
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
                  djForm.rules.required('请输入生产车速'),
                  formRules.float,
                ],
              },
              attrs: {
                maxLength: 10,
                suffixIcon: "m-s"
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'changeorderMinLength',
                label: '换纸最小米数',
                rules: [
                  djForm.rules.required('请输入换纸最小米数'),
                  formRules.number
                ],
              },
              attrs: {
                maxLength: 10,
                suffixIcon: "m"
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'firstorderWasteWith',
                label: '首单最小修边',
                rules: [
                  djForm.rules.required('请输入首单最小修边'),
                  formRules.number
                ],
              },
              attrs: {
                maxLength: 10,
                suffixIcon: "mm"
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'lastorderMinLength',
                label: '尾单最小米数',
                rules: [
                  djForm.rules.required('请输入尾单最小米数'),
                  formRules.number
                ],
              },
              attrs: {
                maxLength: 10,
                suffixIcon: "m"
              },
            },
          ],
          zqj: [
            {
              type: 'input',
              formItem: {
                prop: 'slimachWheelCount',
                label: '单台压轮数',
                rules: [
                  djForm.rules.required('请输入单台压轮数'),
                  formRules.number5
                ],
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachWheelSamesideSpace',
                label: '压轮最小间距',
                rules: [
                  djForm.rules.required('请输入压轮最小间距'),
                  formRules.number5
                ],
              },
              attrs: {
                placeholder: '请输入同排压轮最小间距',
                suffixIcon: "mm"
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachWdoubleMinLength',
                label: '双机压订单',
                rules: [
                  formRules.number5
                ],
              },
              attrs: {
                placeholder: '请输入最小上机米数',
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachKnifeCount',
                label: '单台纵切刀数',
                rules: [
                  djForm.rules.required('请输入单台纵切刀数'),
                  formRules.number5
                ],
              },
            },
            {
              type: 'radio',
              formItem: {
                prop: 'slimachNumbers',
                label: '纵切机数',
                rules: [
                  djForm.rules.required('请输入请选择相应的纵切机数'),
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
                change: (val) => {
                  if (val === 1) {
                    this.$set(this.formOptions.zqj[2].formItem, 'rules', [
                      formRules.number5
                    ]);
                  } else {
                    this.$set(this.formOptions.zqj[2].formItem, 'rules', [
                      djForm.rules.required('请输入双机压订单'),
                      formRules.number5
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
                  djForm.rules.required('请输入请选择相应的压轮排数')
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
                prop: 'slimachKnifeSpace',
                label: '纵切刀间距',
                rules: [
                  djForm.rules.required('请输入纵切刀间距'),
                  formRules.number5
                ],
              },
              attrs: {
                suffixIcon: "mm"
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'slimachKnifeChangetime',
                label: '换单排刀时间',
                rules: [
                  djForm.rules.required('请输入换单排刀时间'),
                  formRules.number5
                ],
              },
              attrs: {
                suffixIcon: "s"
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
                  djForm.rules.required('请输入分线机宽度'),
                  formRules.float,
                  formRules.float5,
                ],
              },
              attrs: {
                suffixIcon: "m"
              }
            },
            {
              type: 'input',
              formItem: {
                prop: 'minCutLength',
                label: '最小切长',
                rules: [
                  djForm.rules.required('请输入最小切长'),
                  formRules.number5
                ],
              },
              attrs: {
                suffixIcon: "mm"
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
                change: (val) => {
                  this.prodLineData.fxj.stackCount = '';
                  const stackCount = {
                    type: 'input',
                    formItem: {
                      prop: 'stackCount',
                      label: '堆叠数',
                      rules: [
                        djForm.rules.required('请输入最小叠单米数'),
                        formRules.number,
                        formRules.number5
                      ],
                      attrs: {
                        suffixIcon: "m"
                      }
                    },
                  };
                  // 小吊篮时需要输入堆叠数
                  // 编辑时，不管是大吊篮还是小吊篮，都不显示堆叠数
                  if (this.dialogTypeIsAdd) {
                    if (val === 2) {
                      this.formOptions.fxj.splice(4, 0, stackCount);
                    } else {
                      this.formOptions.fxj.splice(4, 1);
                    }
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
                  djForm.rules.required('请输入吊篮长度'),
                  formRules.float,
                  formRules.float5
                ],
              },
              attrs: {
                suffixIcon: "m"
              }
            }
          ],
        },
        optionalPaper: [],
        cache: {},
        removedOptionalPaper: []
      };
    },
    methods: {
      isObject(obj){
        return Object.prototype.toString.call(obj)==='[object Object]';
      },
      isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
      },
      /**
       *  深度比较两个对象是否相同
       * @param {Object} oldData
       * @param {Object} newData
       */
      equalsObj(oldData, newData) {
        //       类型为基本类型时,如果相同,则返回true
        console.log(oldData, newData);
        if (oldData == newData) return true;
        if (this.isObject(oldData) && this.isObject(newData) && Object.keys(oldData).length === Object.keys(newData).length) {
          //      类型为对象并且元素个数相同

          //      遍历所有对象中所有属性,判断元素是否相同
          for (const key in oldData) {
            if (oldData.hasOwnProperty(key)) {
              if (!this.equalsObj(oldData[key], newData[key]))
              //      对象中具有不相同属性 返回false
                return false;
            }
          }
        } else if (this.isArray(oldData) && this.isArray(oldData) && oldData.length === newData.length) {
          //      类型为数组并且数组长度相同

          for (let i = 0, length = oldData.length; i < length; i++) {
            if (!this.equalsObj(oldData[i], newData[i]))
            //      如果数组元素中具有不相同元素,返回false
              return false;
          }
        } else {
          //      其它类型,均返回false
          return false;
        }

        //      走到这里,说明数组或者对象中所有元素都相同,返回true
        return true;
      },
      confirm() {
        const formMap = ['1', '2', '3'];
        const formValidate = new Promise((resolve) => {
          let allIsTrue = [];
          formMap.map((v, index) => {
            this.$refs['form' + v].validate((valid) => {
              if (valid) {
                allIsTrue.push(true);
              }
              if (index === 2) {
                resolve(allIsTrue);
              }
            });
          });
        });
        formValidate.then(res => {
          if (res.length === 3) {
            if (!this.isModify()) {
              if (this.prodLineData.jccs.linePaperSizeModels.length === 0) {
                this.$message('请选择门幅范围', 'warning');
                return false;
              }
              this.$confirm('是否保存填写内容？', '', {
                type: 'warning',
                showClose: false,
              }).then(() => {
                this.loading = true;
                const params = Object.keys(this.prodLineData).reduce((sum, val) => {
                  sum = Object.assign(sum, this.prodLineData[val]);
                  return sum;
                }, {});
                console.log(params);
                params.commonTilemodel = params.commonTilemodel.join('、');
                if (!this.dialogTypeIsAdd) {
                  params.id = this.lineId;
                  params.lineNum = this.lineNum;
                  params.isEffected = 0;
                }
                const service = this.dialogTypeIsAdd ? productionLineService.addLine : productionLineService.modifyLine;
                service(params).then(() => {
                  this.loading = false;
                  this.$emit('close');
                  const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
                  this.$message(message, 'success');
                  this.$emit('getData', this.lineNum);
                }).catch(() => {
                  this.loading = false;
                });
              });
            } else {
              this.$message('未编辑数据，请确认', 'info');
              return false;
            }
          }
        });

      },
      isModify() {
        const params = this.getFlatObject(this.prodLineData);
        const isEqual = this.equalsObj(this.cache, params);
        return isEqual;
      },
      close() {
        if (!this.isModify()) {
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
        const {linePaperSizeModels} = this.prodLineData.jccs;
        return linePaperSizeModels.findIndex(v => v.paperSize === code) > -1;
      },
      selectPaper(code) {
        // 新增的时候 候选是没有id的，编辑的时候 选过的会带有id
        let linePaperSizeModels = this.prodLineData.jccs.linePaperSizeModels;
        if (this.isIncludesPaper(code)) {
          let index = linePaperSizeModels.findIndex(v => v.paperSize === code);
          const {paperSize, id} = linePaperSizeModels[index];
          const item = Object.assign({paperSize: paperSize}, id ? {id: id} : {});
          this.removedOptionalPaper.push(item);
          linePaperSizeModels.splice(index, 1);
        } else {
          if (this.dialogTypeIsAdd) {
            linePaperSizeModels.push({
              paperSize: code
            });
          } else {
            const item = this.removedOptionalPaper.find(v => v.paperSize === code) || {paperSize: code};
            linePaperSizeModels.push(item);
          }
        }
      },
      getFlatObject(obj) {
        if (Object.prototype.toString.call(obj) === '[object Object]') {
          return Object.keys(obj).reduce((sum, val) => {
            sum = Object.assign(sum, obj[val]);
            return sum;
          }, {});
        }
        return {};
      }
    },
    created() {
      let mock = [];
      for (let i = 0; i < 33; i++) {
        mock.push(900 + i * 50);
      }
      this.optionalPaper = mock;
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.dialog.open();
        let deepCloneData = this.$method.deepClone(this.prodLineData);
        let flatData = this.getFlatObject(deepCloneData);
        let keys = Object.keys(flatData);
        for (let i = 0; i < keys.length; i++) {
          if (typeof flatData[keys[i]] === 'number' && flatData[keys[i]] > 0) {
            // console.log(flatData[keys[i]]);
            flatData[keys[i]] = String(flatData[keys[i]]);
          }
        }
        this.cache = flatData;
      });
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .production-line-dialog {
    width: 80vw;

    h4 {
      padding: 10px 0;
    }
  }

  @{deep} .optional {
    width: 100%;
    min-height: 120px;
    margin-bottom: 20px;
    padding-right: 20px;
    box-sizing: border-box;

    &-area {
      width: 100%;
      min-height: 80px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      border: 1px solid #DCDFE6;
      border-radius: 4px;
      box-sizing: border-box;

      &-item {
        width: 55px;
        text-align: center;
        font-size: 16px;
        height: 24px;
        line-height: 24px;
        padding: 6px 14px;
        margin-left: 16px;
        margin-top: 12px;
        color: #606266;
        background: #EBEEF5;
        border-radius: 3px;
        cursor: pointer;
        user-select: none;

        &.selected {
          color: #fff;
          background: #3654EA;
        }
      }
    }
  }
</style>
