<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm"
             :title="dialogTypeIsAdd?'新增打包规则': '编辑打包规则'">
    <div class="pack-dialog">
      <dj-form ref="packForm" :form-data="packFormData" :form-options="packFormOptions"
               :column-num="zqjColumnNum" :col-rule="()=>zqjColRule"></dj-form>
      <div v-for="(condition, index) in packConditionFormData" :key="condition.key" class="condition-item">
        <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
        <div class="child-condition-list">
          <el-form :model="child" :rules="packRules" ref="childConditionForm" v-for="(child, childIndex) in condition"
                   class="pack-form">
            <div class="rule-row">
              <el-form-item label="层数" prop="layer" v-if="childIndex===0" class="layer">
                <dj-select v-model="child.layer" :options="layerOptions"></dj-select>
              </el-form-item>
              <el-form-item label="单位面积" class="unit-area">
                <el-form-item prop="startUnitarea">
                  <dj-input type="float" v-model.number="child.startUnitarea" placeholder="请输入"
                            disabled suffix-icon="m²"></dj-input>
                </el-form-item>

                <div style="margin: 0 5px">至</div>
                <el-form-item prop="endUnitarea">
                  <dj-input v-model.number="child.endUnitarea" placeholder="请输入" suffix-icon="m²"
                            @change="val=>changeNextInput(val,index, childIndex)"></dj-input>
                </el-form-item>
              </el-form-item>
              <el-form-item label="打包数量" prop="packpiece" class="packpiece">
                <el-input v-model="child.packpiece"></el-input>
              </el-form-item>
              <div class="button-col">
                <i class="el-icon-delete" v-if="childIndex===condition.length - 1"
                   @click.prevent="removeCondition(index,childIndex)"></i>
                <i class="el-icon-circle-plus" @click="addChildCondition(index, childIndex)"
                   v-if="childIndex===condition.length - 1"></i>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      <el-button type="primary" @click.prevent="addCondition">添加条件</el-button>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  const layerOptions = [
    {label: '二层', value: '2'},
    {label: '三层', value: '3'},
    {label: '四层', value: '4'},
    {label: '五层', value: '5'},
    {label: '六层', value: '6'},
    {label: '七层', value: '7'},
  ];
  export default {
    name: 'StackDialog',
    props: ['dialogTypeIsAdd'],
    data() {
      return {
        packFormData: {
          name: '11',
          eachPackWeight: 222,
          aTilemodelRate: 44,
          bTilemodelRate: '44',
          cTilemodelRate: '44',
          eTilemodelRate: '44',
          fTilemodelRate: '44',
        },
        packFormOptions: [
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
            type: 'input',
            formItem: {
              prop: 'eachPackWeight',
              label: '单批打包重量',
              rules: [
                djForm.rules.required('单批打包重量不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              type: 'number',
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
              prop: 'bTilemodelRate',
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
              prop: 'cTilemodelRate',
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
              prop: 'eTilemodelRate',
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
              prop: 'fTilemodelRate',
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
          [
            {
              layer: '3',
              startUnitarea: '0',
              endUnitarea: '4',
              packpiece: '6',
            }
          ]
        ],
        packRules: {
          layer: [
            {required: true, message: '请选择层数', trigger: 'change'}
          ],
          packpiece: [
            {required: true, message: '请填写打包数量', trigger: 'change'}
          ],
          startUnitarea: [
            {required: true, message: '请完成单位面积', trigger: 'change'}
          ],
          endUnitarea: [
            {required: true, message: '请完成单位面积', trigger: 'change'}
          ]
        },

        zqjColumnNum: '',
        zqjColRule: '',
        layerOptions: layerOptions,
      };
    },
    methods: {
      addChildCondition(index, childIndex) {
        this.packConditionFormData[index].push({
          layer: this.packConditionFormData[index][0].layer,
          startUnitarea: this.packConditionFormData[index][childIndex].endUnitarea,
          endUnitarea: '',
          packpiece: ''
        });
      },
      addCondition() {
        this.packConditionFormData.push(
          [{
            layer: '',
            startUnitarea: 0,
            endUnitarea: '',
            packpiece: '',
          }]);
      },
      removeCondition(index, childIndex) {
        // todo 增加删除动画
        const targetArr = this['packConditionFormData'];
        if (targetArr.length === 1) {
          return false;
        }
        if (targetArr[index].length === 1) {
          targetArr.splice(index, 1);
        } else {
          targetArr[index].splice(childIndex, 1);
        }
      },
      changeNextInput(val, index, childIndex) {
        this.packConditionFormData[index][childIndex + 1].startUnitarea = val;
      },
      confirm() {
        this.$emit('confirm');
      },
      close() {
        this.$emit('close');
      },
      zqjGetColumnNum() {
        const width = window.innerWidth;
        this.zqjColumnNum = width < 1400 ? 3 : 4;
      },
      zqjGetColRule() {
        const width = window.innerWidth;
        this.zqjColRule = width < 1400 ? 8 : 6;
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
    width: 80vw;
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

  @{deep} .Kg::before {
    content: "Kg";
    width: 5px;
    height: 5px;
  }
</style>
