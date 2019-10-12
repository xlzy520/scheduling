<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm"
             :title="dialogTypeIsAdd?'新增打包规则': '编辑打包规则'">
    <div class="pack-dialog" v-loading="loading">
      <dj-form ref="packForm" :form-data="packFormData" :form-options="packFormOptions"
               :column-num="3" :col-rule="()=>8"></dj-form>
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
                <el-form-item label="单位面积" class="unit-area" ref="unitArea">
                  <el-form-item prop="startUnitarea">
                    <dj-input v-model="child.startUnitarea" placeholder="请输入" maxlength="10"
                              disabled suffix-icon="m²"></dj-input>
                  </el-form-item>
                  <div style="margin: 0 5px;">至</div>
                  <el-form-item prop="endUnitarea">
                    <dj-input v-model="child.endUnitarea" placeholder="请输入" suffix-icon="m²"
                              maxlength="10" @change="val=>changeNextInput(val,index, childIndex)"></dj-input>
                  </el-form-item>
                </el-form-item>
                <el-form-item label="打包数量" prop="packpiece" class="packpiece" >
                  <el-input v-model="child.packpiece" maxlength="10"></el-input>
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
      <el-button type="primary" @click.prevent="addCondition" style="margin-left: 130px;">添加条件</el-button>
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
        originPackFormData: {},
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
              maxlength: 40,
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
              maxlength: 20,
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
              maxlength: 20,
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
              maxlength: 20,
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
              maxlength: 20,
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
              maxlength: 20,
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
              maxlength: 20,
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
        originPackConditionFormData: [],
        packRules: {
          layer: [
            djForm.rules.required('请选择层数'),
          ],
          packpiece: [
            djForm.rules.required('请输入打包数量'),
            formRules.number
          ],
          startUnitarea: [
            djForm.rules.required('请输入单位面积'),
            // formRules.float2
          ],
          endUnitarea: [
            djForm.rules.required('请输入单位面积'),
            formRules.float2
          ]
        },
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
        val = Number(val);
        const child = this.packConditionFormData[index];
        if (val <= Number(child[childIndex].startUnitarea)) {
          this.$message('结束单位面积小于或等于起始单位面积', 'info');
          child[childIndex].endUnitarea = '';
          return false;
        }
        if (child.length > childIndex + 1) {
          child[childIndex + 1].startUnitarea = val.toString();
          if (val >= Number(child[childIndex + 1].endUnitarea) && child[childIndex + 1].endUnitarea !== '') {
            this.$message('结束单位面积小于或等于起始单位面积', 'info');
            child[childIndex + 1].endUnitarea = '';
          }
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
        const old = [this.originPackFormData, this.originPackConditionFormData];
        const latest = [this.packFormData, this.packConditionFormData];
        if (!this.$method.equalsObjMessage(old, latest)) {
          this.$emit('confirm');
        }
      },
      close() {
        this.$emit('close');
      },
      renderAllCondition(id) {
        this.open();
        this.loading = true;
        ruleCustomizeService.getRuleDetail({
          ruleId: id
        }).then(res => {
          let { packRuleDetails, ...rest } = res;
          for (let restKey in rest) {
            if (Object.prototype.hasOwnProperty.call(rest, restKey)) {
              if (rest[restKey]) {
                if (rest[restKey].includes('.00')) {
                  rest[restKey] = rest[restKey].replace('.00', '');
                }
              }
            }
          }
          this.packFormData = rest;
          this.originPackFormData = this.$method.deepClone(rest);
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
          this.originPackConditionFormData = this.$method.deepClone(cache);
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        });
      },
      open() {
        this.$refs.dialog.open();
      }
    }
  };
</script>

<style lang="less" scoped>
  @import "../../../../assets/css/func";
  @deep: ~'>>>';
  .pack-dialog {
    width: 1196px;
    height: 711px;
  }

  @media screen and (max-width: 1601px) {
    .pack-dialog {
      height: 531px;
    }
  }

  @media screen and (max-width: 1367px) {
    .pack-dialog {
      height: 411px;
    }
  }
  .dj-form {
    padding-right: 65px;
  }
  .condition-item {
    display: flex;
    .rule-row {
      display: flex;
      justify-content: flex-end;
      & > @{deep} .el-form-item {
        width: 30.8%;
        &.unit-area {
          .el-form-item__label {
            width: 78px;
          }
        }
        &.packpiece {
          .el-form-item__label {
            width: 109px;
          }
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
      width: 50px;
      padding-left: 20px;
      font-family: "PingFang SC", sans-serif;
      font-weight: 500;
      box-sizing: content-box;
    }
    .button-col {
      display: flex;
      width: 65px;
      margin-top: 8px;
      margin-right: 10px;
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
    @{deep} .unit-area {
      .el-form-item__content {
        display: flex;
        .el-input {
          width: 106px;
        }
      }
    }
  }
  .childCondition-enter-active {
    transition: all 0.3s ease;
  }
  .childCondition-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .childCondition-enter, .childCondition-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
