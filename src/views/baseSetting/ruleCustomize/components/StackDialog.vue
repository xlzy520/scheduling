<template>
  <lock-dialog ref="dialog" @close="close" @confirm="confirm" width="1216px"
               :title="dialogTypeIsAdd?'新增叠单规则': '编辑叠单规则'">
    <div class="stack-dialog" v-loading="loading">
      <dj-form ref="stackForm" :form-data="stackFormData" :form-options="stackFormOptions" :column-num="3"/>
      <div v-for="(condition, index) in stackConditionFormData" class="condition-item stack">
        <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
        <div class="child-condition-list">
          <transition-group name="childCondition">
            <el-form :model="child" :rules="stackRules" ref="childConditionForm" class="stack-form"
                     :key="child.time||childIndex" v-for="(child, childIndex) in condition">
              <div class="rule-row">
                <el-form-item label="楞型" prop="tilemodel" class="tilemodel"
                              :class="childIndex===0?'': 'form-hidden'">
                  <dj-select v-model="child.tilemodel" :options="lengxingOptions"
                             @visible-change="visible=>tileModelSelectOptionChange(visible, index)"
                             @change="val=>tilemodelChange(val,index, childIndex)"></dj-select>
                </el-form-item>
                <el-form-item label="切数" prop="cut" class="cut">
                  <dj-select type="multiple" collapse-tags v-model="child.cut"
                             @visible-change="visible=>selectOptionChange(visible, index, childIndex)"
                             :options="qieshuOptions"></dj-select>
                </el-form-item>
                <el-form-item label="片数" prop="piece" class="piece">
                  <dj-input v-model="child.piece" maxlength="10"></dj-input>
                </el-form-item>
                <div class="button-col">
                  <i class="el-icon-delete" @click.prevent="removeCondition(index,childIndex)"></i>
                  <i class="el-icon-circle-plus" @click="addChildCondition(index, childIndex)"
                     v-if="childIndex===condition.length - 1"></i>
                </div>
              </div>
            </el-form>
          </transition-group>
        </div>
      </div>
      <el-button type="primary" class="add-btn" @click.prevent="addCondition">添加条件</el-button>
    </div>
  </lock-dialog>
</template>

<script>
  import ruleCustomizeService from '@/api/service/ruleCustomize';
  import formRules from "../../formRules";

  const qieshuOptions = [
    {label: '1', value: '1', disabled: false},
    {label: '2', value: '2', disabled: false},
    {label: '3', value: '3', disabled: false},
    {label: '4', value: '4', disabled: false},
    {label: '5', value: '5', disabled: false},
    {label: '6', value: '6', disabled: false},
    {label: '7', value: '7', disabled: false},
  ];
  export default {
    name: 'StackDialog',
    props: ['dialogTypeIsAdd'],
    data() {
      return {
        stackFormData: {
          name: '',
          produceLineId: '',
          maxOrderCut: '',
          maxStackHeight: '',
          maxStackCount: '',
        },
        originStackFormData: {},
        stackFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '规则名称',
              rules: [
                this.$rule.required('请输入规则名称'),
                formRules.word_number_chinese
              ],
            },
            attrs: {
              maxlength: 40,
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'produceLineId',
              label: '生产线',
              rules: [this.$rule.required('请选择生产线')],
            },
            attrs: {
              options: [],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'maxOrderCut',
              label: '订单最大片数',
              rules: [
                this.$rule.required('请输入订单最大片数'),
                formRules.number
              ],
            },
            attrs: {
              maxlength: 10,
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'maxStackCount',
              label: '最大堆叠单数',
              rules: [
                this.$rule.required('请输入最大堆叠单数'),
                formRules.number
              ],
            },
            attrs: {
              maxlength: 10,
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'maxStackHeight',
              label: '订单最小米数',
              rules: [
                this.$rule.required('请输入订单最小米数'),
                formRules.number,
                formRules.number5
              ],
            },
            attrs: {
              maxlength: 10
            }
          },
        ],
        stackConditionFormData: [
          [
            {
              tilemodel: '',
              cut: '',
              piece: '',
              time: Date.now()
            }
          ]
        ],
        originStackConditionFormData: [],
        stackRules: {
          tilemodel: [
            this.$rule.required('请选择楞型'),
          ],
          cut: [
            this.$rule.required('请选择切数'),
          ],
          piece: [
            this.$rule.required('请输入片数'),
            formRules.number
          ]
        },

        qieshuOptions: qieshuOptions,

        loading: false
      };
    },
    computed: {
      lengxingOptions() {
        const fluteTypeAllOptionIndex = this.$enum.fluteType.findIndex(v=>v.value === 'all');
        const fluteTypeAll = this.$method.deepClone(this.$enum.fluteType);
        fluteTypeAll.splice(fluteTypeAllOptionIndex, 1);
        return fluteTypeAll.map(v=>{
         v.disabled = false;
         return v;
       });
      }
    },
    methods: {
      tilemodelChange(val, index, childIndex) {
        if (childIndex === 0) {
          this.stackConditionFormData[index].map(v=>{
            v.tilemodel = val;
          });
        }
      },
      tileModelSelectOptionChange(visible, index) {
        if (visible) {
          const tileModels = this.stackConditionFormData.reduce((pre, cur, cutIndex)=>{
            if (index === cutIndex) {
              return pre.concat([]);
            }
            return pre.concat(cur[0].tilemodel);
          }, []);
          console.log(tileModels);
          this.lengxingOptions.map(v=>{
            v.disabled = tileModels.includes(v.value);
          });
        }
      },
      selectOptionChange(visible, index, childIndex) {
        if (visible) {
          this.stackConditionFormData.map((v, sIndex)=>{
            if (sIndex === index) {
              const cuts = v.reduce((pre, cur, cutIndex)=>{
                if (childIndex === cutIndex) {
                  return pre.concat([]);
                }
                return pre.concat(cur.cut);
              }, []);
              this.qieshuOptions.map(v=>{
                v.disabled = cuts.includes(v.value);
              });
            }
          });
        }
      },
      addChildCondition(index) {
        const cuts = this.stackConditionFormData.reduce((pre, cur)=>{
          return pre.concat(cur[0].cut);
        }, []);
        if (cuts.length === 7) {
          this.$message('所有切数已选择，无法新增', 'warning');
          return false;
        }
        this.stackConditionFormData[index].push({
          tilemodel: this.stackConditionFormData[index][0].tilemodel,
          cut: '',
          piece: '',
          time: Date.now()
        });
      },
      addCondition() {
        this.stackConditionFormData.push([{
          tilemodel: '',
          cut: '',
          piece: '',
          time: Date.now()
        }]);
      },
      removeCondition(index, childIndex) {
        const targetArr = this.stackConditionFormData;
        if (targetArr.length === 1 && targetArr[0].length === 1) {
          return false;
        }
        if (targetArr[index].length === 1) {
          targetArr.splice(index, 1);
        } else {
          targetArr[index].splice(childIndex, 1);
        }
      },
      confirm(cb) {
        const old = [this.originStackFormData, this.originStackConditionFormData];
        const latest = [this.stackFormData, this.stackConditionFormData];
        if (!this.$method.equalsObjMessage(old, latest)) {
          this.$emit('confirm', cb);
        } else {
          cb();
        }
      },
      close() {
        this.$emit('close');
      },
      open() {
        if (!this.dialogTypeIsAdd) {
          this.stackConditionFormData = [[]];
        }
        this.$refs.dialog.open();
      },
      setLineOptions() {
        ruleCustomizeService.getAllLine().then(res => {
          const lineOptions = res.list.map(v => {
            return {
              label: v.lineNum + '号线',
              value: v.id
            };
          });
          this.$set(this.stackFormOptions[1].attrs, 'options', lineOptions);
        });
      },
      renderAllCondition(id) {
        this.open();
        this.loading = true;
        ruleCustomizeService.getRuleDetail({
          ruleId: id
        }).then(res => {
          let { detailModels, ...rest } = res;
          // 一下操作皆为将一组数据根据两个关键词合并同类
          this.stackFormData = rest;
          this.originStackFormData = this.$method.deepClone(rest);
          let cache = [];
          let tileModelMap = Array.from(new Set(detailModels.map(v=>v.tilemodel)));
          tileModelMap.forEach(()=>cache.push([]));
          for (let i = 0; i < detailModels.length; i++) {
            for (let j = 0; j < tileModelMap.length; j++) {
              if (detailModels[i].tilemodel === tileModelMap[j]) {
                cache[j].push(detailModels[i]);
              }
            }
          }
          const formatData = cache.map(v=>{
            let mergePiece = [];
            let pieceMap = Array.from(new Set(v.map(p=>p.piece)));
            pieceMap.forEach(()=>mergePiece.push([]));
            v.map(p=>{
              for (let i = 0; i < pieceMap.length; i++) {
                if (pieceMap[i] === p.piece) {
                  mergePiece[i].push(p);
                }
              }
            });
            let merge = mergePiece.map(mp=>{
              let cuts = mp.map(c=>c.cut);
              return {
                ...mp[0],
                cut: cuts
              };
            });
            return merge;
          });
          this.stackConditionFormData = formatData;
          this.originStackConditionFormData = this.$method.deepClone(formatData);
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        });
      }
    },
    created() {
      this.setLineOptions();
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';

  .stack-dialog {
    height: 573px;
    .add-btn{
      margin-left: 121px;
    }
  }

  @media screen and (max-width: 1601px) {
    .stack-dialog {
      height: 531px;
    }
  }

  @media screen and (max-width: 1367px) {
    .stack-dialog {
      height: 411px;
    }
  }
  .dj-form {
    padding-right: 55px;
  }
  .condition-item {
    display: flex;
    .rule-row {
      display: flex;
      justify-content: flex-end;
      .form-hidden {
        visibility: hidden;
      }
      @{deep} .el-form-item {
        width: 30.8%;
        .el-select {
          width: 232px;
        }
        .el-form-item__content {
          float: left;
        }
        &.cut {
          .el-form-item__label {
            width: 78px;
          }
        }
        &.piece {
          .el-form-item__label {
            width: 109px;
          }
          .dj-input {
            width: 232px;
          }
        }
      }
    }
    .condition-index-label {
      position: relative;
      left: 8px;
      width: 42px;
      font-family: "PingFang SC", sans-serif;
      font-weight: 500;
      box-sizing: content-box;
      padding-right: 0;
    }
    .button-col {
      display: flex;
      width: 55px;
      margin-top: 8px;
      /*justify-content: flex-end;*/
      i.el-icon-delete,i.el-icon-circle-plus {
        font-size: 18px;
        cursor: pointer;
      }
      i.el-icon-delete {
        margin: 0 10px;
      }
      i.el-icon-circle-plus {
        color: #3554ea;
      }
    }
    .child-condition-list {
      width: 100%;
    }
  }

  .childCondition-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }
 .childCondition-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
