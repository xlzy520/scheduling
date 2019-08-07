<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm"
             :title="dialogTypeIsAdd?'新增叠单规则': '编辑叠单规则'">
    <div class="stack-dialog">
      <dj-form ref="stackForm" :form-data="stackFormData" :form-options="stackFormOptions" :column-num="3"/>
      <div v-for="(condition, index) in stackConditionFormData" class="condition-item stack">
        <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
        <div class="child-condition-list">
          <el-form :model="child" :rules="stackRules" ref="childConditionForm" class="stack-form"
                   v-for="(child, childIndex) in condition">
            <div class="rule-row">
              <el-form-item label="楞型" prop="tilemodel" class="tilemodel" v-if="childIndex===0">
                <dj-select v-model="child.tilemodel" :options="lengxingOptions"></dj-select>
              </el-form-item>
              <el-form-item label="切数" prop="cut">
                <dj-select type="multiple" collapse-tags v-model="child.cut" @change="qieshuChange"
                           :options="qieshuOptions"></dj-select>
              </el-form-item>
              <el-form-item label="片数：" prop="piece" class="piece">
                <dj-input v-model="child.piece"></dj-input>
              </el-form-item>
              <div class="button-col">
                <i class="el-icon-delete" @click.prevent="removeCondition(index,childIndex)"></i>
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
  import ruleCustomizeService from '@/api/service/ruleCustomize';

  const qieshuOptions = [
    {label: '1', value: '1'},
    {label: '2', value: '2'},
    {label: '3', value: '3'},
    {label: '4', value: '4'},
    {label: '5', value: '5'},
    {label: '6', value: '6'},
    {label: '7', value: '7'},
  ];
  export default {
    name: 'StackDialog',
    props: ['dialogTypeIsAdd'],
    data() {
      return {
        stackFormData: {
          name: '222',
          produceLineId: '1',
          maxOrderCut: '222',
          maxStackHeight: '222',
          maxStackCount: '222',
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
              prop: 'produceLineId',
              label: '生产线',
              rules: [djForm.rules.required('请选择相应的生产线')],
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
              prop: 'maxStackHeight',
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
              prop: 'maxStackCount',
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
          [
            {
              tilemodel: '',
              cut: '',
              piece: ''
            }
          ]
        ],
        stackRules: {
          tilemodel: [
            {required: true, message: '请选择楞型', trigger: 'change'}
          ],
          cut: [
            {required: true, message: '请选择切数', trigger: 'change'}
          ],
          piece: [
            {required: true, message: '请填写片数', trigger: 'change'}
          ]
        },

        lengxingOptions: this.$enum.fluteType,
        qieshuOptions: qieshuOptions,
      };
    },
    methods: {
      qieshuChange() {

      },
      addChildCondition(index, childIndex) {
        this.stackConditionFormData[index].push({
          tilemodel: this.stackConditionFormData[index][0].tilemodel,
          cut: '',
          piece: '',
        });
      },
      addCondition() {
        this.stackConditionFormData.push([{
          tilemodel: '',
          cut: '',
          piece: '',
        }]);
      },
      removeCondition(index, childIndex) {
        // todo 增加删除动画
        const targetArr = this.stackConditionFormData;
        if (targetArr.length === 1) {
          return false;
        }
        if (targetArr[index].length === 1) {
          targetArr.splice(index, 1);
        } else {
          targetArr[index].splice(childIndex, 1);
        }
      },
      confirm() {
        this.$emit('confirm');
      },
      close() {
        this.$emit('close');
      },
      open() {
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
    width: 80vw;
  }
  .dj-form{
    width: 100%;
  }
  @media screen and (max-width: 1367px) {
    .stack-dialog {
      width: 90vw;
    }
    .dj-form{
      width: 90%;
    }
  }
  .condition-item{
    display: flex;
    .rule-row{
      display: flex;
      justify-content: flex-end;
      @{deep} .el-form-item{
        width: 32%;
        &.packpiece{
          margin-right: 33px;
          .el-input{
            width: 232px;
          }
        }
        .el-select{
          width: 232px;
        }
        .el-form-item__content{
          float: left;
        }
        .el-form-item__label{
          width: 120px;
        }
        &.tilemodel{
          .el-form-item__label{
            width: 80px;
          }
        }
        &.piece{
          .el-form-item__label{
            width: 160px;
          }
          .dj-input{
            width: 232px;
          }
        }
      }
    }
    .condition-index-label{
      font-family: "PingFang SC Regular",sans-serif;
      font-weight: bold;
      text-align: right;
      width: 56px;
    }
    .button-col{
      width: 50px;
      display: flex;
      margin-top: 8px;
      margin-right: 25px;
      i.el-icon-delete,i.el-icon-circle-plus{
        font-size: 18px;
        cursor: pointer;
      }
      i.el-icon-delete{
        margin: 0 10px;
      }
      i.el-icon-circle-plus{
        color: #3554ea;
      }
    }
    .child-condition-list{
      width: 100%;
    }
    @media screen and (max-width: 1367px) {
      .child-condition-list{
        width: 94%;
      }
      .rule-row{
        width: 100%;
        @{deep} .el-form-item{
          width: 351px;
          .el-form-item__label{
            width: 63px;
          }
          &.tilemodel{
            .el-form-item__label{
              width: unset;
            }
          }
          &.piece{
            .el-form-item__label{
              width: 79px;
            }
            .dj-input{
              width: 232px;
            }
          }
        }
      }
    }
  }

  @{deep} .m²::before {
    content: "m²";
    width: 5px;
    height: 5px;
  }
</style>
