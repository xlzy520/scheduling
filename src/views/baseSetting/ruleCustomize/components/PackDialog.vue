<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm"
             :title="dialogTypeIsAdd?'新增打包规则': '编辑打包规则'">
    <div class="pack-dialog" v-loading="loading">
      <dj-form ref="packForm" :form-data="packFormData" :form-options="packFormOptions"
               :column-num="zqjColumnNum" :col-rule="()=>zqjColRule"></dj-form>
      <div v-for="(condition, index) in packConditionFormData" class="condition-item">
        <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
        <div class="child-condition-list">
          <transition-group name="childCondition">
            <el-form :model="child" :rules="packRules" ref="childConditionForm"
                     v-for="(child, childIndex) in condition"
                     :key="childIndex"
                     class="pack-form">
              <div class="rule-row">
                <el-form-item label="层数" prop="layer" v-if="childIndex===0" class="layer">
                  <dj-select v-model="child.layer" :options="layerOptions"
                             :type="dialogTypeIsAdd?'multiple':''" collapse-tags
                             @visible-change="visible=>selectOptionChange(visible, index)"></dj-select>
                </el-form-item>
                <el-form-item label="单位面积" class="unit-area">
                  <el-form-item prop="startUnitarea">
                    <dj-input v-model.number="child.startUnitarea" placeholder="请输入" maxLength="10"
                              disabled suffix-icon="m²"></dj-input>
                  </el-form-item>
                  <div style="margin: 0 5px">至</div>
                  <el-form-item prop="endUnitarea">
                    <dj-input type="float" v-model.number="child.endUnitarea" placeholder="请输入" suffix-icon="m²"
                              maxLength="10" @change="val=>changeNextInput(val,index, childIndex)"></dj-input>
                  </el-form-item>
                </el-form-item>
                <el-form-item label="打包数量" prop="packpiece" class="packpiece" >
                  <el-input v-model="child.packpiece" maxLength="10"></el-input>
                </el-form-item>
                <div class="button-col">
                  <i class="el-icon-delete" v-if="childIndex===condition.length - 1"
                     @click.prevent="removeCondition(index,childIndex)"></i>
                  <i class="el-icon-circle-plus" @click="addChildCondition(index, childIndex)"
                     v-if="childIndex===condition.length - 1"></i>
                </div>
              </div>
            </el-form>
          </transition-group>
        </div>
      </div>
      <el-button type="primary" @click.prevent="addCondition" style="margin-left: 130px">添加条件</el-button>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  import ruleCustomizeService from '@/api/service/ruleCustomize';
  import formRules from "../../formRules";
  const layerOptions = [
    {label: '二层', value: '2', disabled: false},
    {label: '三层', value: '3', disabled: false},
    {label: '四层', value: '4', disabled: false},
    {label: '五层', value: '5', disabled: false},
    {label: '六层', value: '6', disabled: false},
    {label: '七层', value: '7', disabled: false},
  ];
  export default {
    name: 'PackDialog',
    props: ['dialogTypeIsAdd'],
    data() {
      return {
        packFormData: {
          name: '',
          eachPackWeight: '',
          aTilemodelRate: '',
          bTilemodelRate: '',
          cTilemodelRate: '',
          eTilemodelRate: '',
          fTilemodelRate: '',
        },
        packFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '规则名称',
              rules: [
                djForm.rules.required('请输入规则名称'),
                formRules.word_number_chinese
              ],
            },
            attrs: {
              maxLength: 40,
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'eachPackWeight',
              label: '单批打包重量',
              rules: [
                djForm.rules.required('请输入单批打包重量'),
                formRules.float
              ],
            },
            attrs: {
              maxLength: 20,
              suffixIcon: "Kg"
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'aTilemodelRate',
              label: 'A楞型楞率',
              rules: [
                djForm.rules.required('请输入A楞型楞率'),
                formRules.float
              ],
            },
            attrs: {
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'bTilemodelRate',
              label: 'B楞型楞率',
              rules: [
                djForm.rules.required('请输入B楞型楞率'),
                formRules.float
              ],
            },
            attrs: {
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'cTilemodelRate',
              label: 'C楞型楞率',
              rules: [
                djForm.rules.required('请输入C楞型楞率'),
                formRules.float
              ],
            },
            attrs: {
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'eTilemodelRate',
              label: 'E楞型楞率',
              rules: [
                djForm.rules.required('请输入E楞型楞率'),
                formRules.float
              ],
            },
            attrs: {
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'fTilemodelRate',
              label: 'F楞型楞率',
              rules: [
                djForm.rules.required('请输入F楞型楞率'),
                formRules.float
              ],
            },
            attrs: {
              maxLength: 20,
            },
          }
        ],
        packConditionFormData: [
          [
            {
              layer: [],
              startUnitarea: '0',
              endUnitarea: '',
              packpiece: '',
            }
          ]
        ],
        packRules: {
          layer: [
            djForm.rules.required('请选择层数'),
          ],
          packpiece: [
            djForm.rules.required('请填写打包数量'),
            formRules.number
          ],
          startUnitarea: [
            djForm.rules.required('请完成单位面积'),
            formRules.float
          ],
          endUnitarea: [
            djForm.rules.required('请完成单位面积'),
            formRules.float
          ]
        },

        zqjColumnNum: '',
        zqjColRule: '',
        layerOptions: layerOptions,

        loading: false
      };
    },
    methods: {
      getLayers() {
        return this.packConditionFormData.reduce((pre, cur)=>{
          return pre.concat(cur[0].layer);
        }, []);
      },
      addChildCondition(index, childIndex) {
        this.packConditionFormData[index].push({
          layer: this.packConditionFormData[index][0].layer,
          startUnitarea: this.packConditionFormData[index][childIndex].endUnitarea,
          endUnitarea: '',
          packpiece: ''
        });
      },
      addCondition() {
        const layers = this.getLayers();
        if (layers.length === 6) {
          this.$message('所有层数已选择，无法新增', 'warning');
          return false;
        }
        this.packConditionFormData.push(
          [{
            layer: [],
            startUnitarea: 0,
            endUnitarea: '',
            packpiece: ''
          }]);
      },
      removeCondition(index, childIndex) {
        const targetArr = this['packConditionFormData'];
        if (targetArr.length === 1 && targetArr[0].length === 1) {
          return false;
        }
        if (targetArr[index].length === 1) {
          targetArr.splice(index, 1);
        } else {
          targetArr[index].splice(childIndex, 1);
        }
      },
      changeNextInput(val, index, childIndex) {
        if (val <= this.packConditionFormData[index][childIndex].startUnitarea) {
          this.$message('不能比前面输入的单位面积小', 'info');
          this.packConditionFormData[index][childIndex].endUnitarea = '';
          return false;
        }
        if (this.packConditionFormData[index].length > childIndex + 1) {
          this.packConditionFormData[index][childIndex + 1].startUnitarea = val;
        }
      },
      selectOptionChange(visible, index) {
        if (visible) {
          const layers = this.packConditionFormData.reduce((pre, cur, cutIndex)=>{
            if (index === cutIndex) {
              return pre.concat([]);
            }
            return pre.concat(cur[0].layer);
          }, []);
          this.layerOptions.map(v=>{
            v.disabled = layers.includes(v.value);
          });
        }
      },
      confirm() {
        this.$emit('confirm');
      },
      close() {
        this.$emit('close');
      },
      renderAllCondition(id) {
        this.loading = true;
        ruleCustomizeService.getRuleDetail({
          ruleId: id
        }).then(res => {
          let { packRuleDetails, ...rest } = res;
          this.packFormData = rest;
          let cache = [];
          let tileModelMap = Array.from(new Set(packRuleDetails.map(v=>v.layer)));
          tileModelMap.forEach(()=>cache.push([]));
          for (let i = 0; i < packRuleDetails.length; i++) {
            for (let j = 0; j < tileModelMap.length; j++) {
              if (packRuleDetails[i].layer === tileModelMap[j]) {
                cache[j].push(packRuleDetails[i]);
              }
            }
          }
          this.packConditionFormData = cache;
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        });
      },
      zqjGetColumnNum() {
        const width = window.innerWidth;
        this.zqjColumnNum = width < 1920 ? 3 : 4;
      },
      zqjGetColRule() {
        const width = window.innerWidth;
        this.zqjColRule = width < 1920 ? 8 : 6;
      },

      open() {
        this.$refs.dialog.open();
      }
    },
    created() {
      this.zqjGetColRule();
      this.zqjGetColumnNum();
      window.addEventListener('resize', () => {
        this.zqjGetColRule();
        this.zqjGetColumnNum();
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', () => {
        this.zqjGetColRule();
        this.zqjGetColumnNum();
      });
    }
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .pack-dialog {
    padding-left: 10px;
    width: 80vw;
    height: 708px;
  }

  .condition-item {
    display: flex;
    .rule-row {
      display: flex;
      justify-content: flex-end;
      width: 80%;
      &>@{deep} .el-form-item {
        margin-right: 81px;
        &.packpiece {
          margin-right: 33px;
          .el-input {
            width: 232px;
          }
        }
        .el-select {
          width: 232px;
        }
        .el-form-item__content {
          float: left;
        }
      }
    }
    .condition-index-label {
      font-family: "PingFang SC Regular", sans-serif;
      font-weight: bold;
      text-align: right;
      width: 56px;
    }
    .button-col {
      width: 50px;
      display: flex;
      margin-top: 8px;
      margin-right: 25px;
      i.el-icon-delete, i.el-icon-circle-plus {
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
    .pack-form {
      @media screen and (max-width: 1367px) {
        @{deep} .dj-input-content {
          .el-input {
            width: 160px;
          }
        }
      }
      .condition-index-label {
        text-align: right;
        width: 60px;
        line-height: unset;
        margin-right: 16px;
      }
    }
    @{deep} .unit-area {
      .el-form-item__content {
        display: flex;
        .el-input {
          width: 106px;
        }
      }
    }
    @media screen and (max-width: 1367px) {
      .child-condition-list {
        width: 94%;
      }

      .rule-row {
        width: 100%;
        &>@{deep} .el-form-item {
          margin-right: 20px;
        }
      }

      @{deep} .unit-area {
        .el-form-item__content {
          .el-input {
            width: 90px;
          }
        }
      }
    }

  }

  .childCondition-enter-active {
    transition: all .3s ease;
  }
  .childCondition-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .childCondition-enter, .childCondition-leave-to {
    transform: translateY(10px);
    opacity: 0;
  }
  @{deep} .Kg::before {
    content: "Kg";
    width: 5px;
    height: 5px;
  }
</style>
