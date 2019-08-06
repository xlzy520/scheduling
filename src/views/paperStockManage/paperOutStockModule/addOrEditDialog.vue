<template>
  <div>
    <dj-dialog ref="dialog" @close="close" width="1160px" :title="isEdit ? '编辑' : '新增'" @confirm="confirm">
      <p class="font-subhead">基础信息</p>
      <dj-form ref="form"
               :formData="formData"
               :formOptions="formOptions"
               :column-num="3"
               :col-rule="colRule"></dj-form>
      <p class="font-subhead">纸筒信息</p>
      <base-table ref="table"
                  :data="tableData"
                  max-height="370"
                  :columns="tableColumns"
                  :column-type="['index']">
      </base-table>
    </dj-dialog>
    <select-use-person ref="selectUsePerson" v-if="selectUsePersonFlag" @close="selectUsePersonFlag = false"></select-use-person>
  </div>
</template>
<script>
  import {djForm} from 'djweb';
  const {rules} = djForm;
  import tableInput from '../paperInStockModule/tableInput'
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import selectUsePerson from './selectUsePerson';
  import {Scanner} from "../../../utils";

  export default {
    name: 'addOrEditInStock',
    data: function () {
      return {
        selectUsePersonFlag: false,
        formData: {},
        tableData: [{}],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            width: 57,
            render: (h, {props: {index}}) => {
              const disabled = () => {
                return this.tableData.length === 1;
              };
              const remove = () => {
                if (!disabled()) {
                  let _front = this.tableData.slice(0, index);
                  let _behend = this.tableData.slice(index + 1);
                  this.tableData = [..._front, ..._behend, {}];
                }
              };
              return (
                <i class="dj-common-red-delete" on-click={remove}></i>
              );
            }
          },
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            width: 123,
            propsHandler: (props) => {
              const beforeEnter = (val, cb, props) => {
                console.log('beforeEnter对接接口');
                console.log('beforeEnter接口参数', props);
                if (props.index === this.tableData.length - 1) {
                  this.tableData.push({});
                  this.$nextTick(()=>{
                    cb();
                  });
                } else {
                  cb();
                }
              };
              return {...props, beforeEnter}
            },
            component: tableInput
          },
          {
            prop: paperKeys.paperCode,
            label: '原值代码',
            width: 129,
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型',
            width: 90,
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)',
            width: 97,
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            width: 139,
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)',
            width: 139,
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            width: 98,
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            width: 91,
          },
          {
            prop: paperKeys.warehouseName,
            label: '仓库',
            width: 139,
          },
          {
            prop: paperKeys.warehouseAreaName,
            label: '库区',
            width: 121,
          },
          {
            prop: cylinderKeys.paperSupplier,
            label: '原纸供应商',
            width: 156,
          },
        ],
        isEdit: false,
        scanner: undefined
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.documentNo,
              label: '单据编号'
            },
            attrs: {
              disabled: true
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: 'department/person',
              label: '领用部门/领用人'
            },
            render: (h, {props: {value}}) => {
              return (
                <el-input value={value}>
                  <i slot="suffix" class="el-input__icon el-icon-search" on-click={()=>this.openSelectUsePerson()}></i>
                </el-input>
              );
            }
          },
          // {
          //   type: 'input',
          //   formItem: {
          //     prop: cylinderKeys.usePerson,
          //     label: '领用人',
          //     rules: [rules.required('领用人不能为空')]
          //   },
          //   attrs: {
          //     disabled: this.isEdit
          //   }
          // },
          // {
          //   type: 'input',
          //   formItem: {
          //     prop: cylinderKeys.useGroup,
          //     label: '领用班组'
          //   },
          //   attrs: {
          //     disabled: this.isEdit,
          //     reg: this.$reg.NORMAL_TEXT_REGEXP
          //   }
          // },
          {
            type: 'select',
            formItem: {
              prop: cylinderKeys.outStockType,
              label: '出库类型',
              rules: [rules.required('出库类型不能为空')]
            },
            attrs: {
              disabled: this.isEdit,
              options: this.$enum.outStockType._arr
            }
          },
          // {
          //   type: 'dj-cascader',
          //   formItem: {
          //     prop: cylinderKeys.useDepartment,
          //     label: '领用部门',
          //     rules: [rules.required('领用部门不能为空')]
          //   },
          //   attrs: {
          //     props: {
          //       checkStrictly: false
          //     },
          //     disabled: this.isEdit,
          //     apiArray: []
          //   }
          // },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.forkliftDriver,
              label: '叉车员'
            },
            attrs: {
              disabled: this.isEdit
            }
          },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.totalWeight,
              label: '总重量'
            },
            attrs: {
              disabled: true
            },
            computed: () => {
              return this.tableData.reduce((sum, obj) => {
                let weight = Number(obj[cylinderKeys.weight]) || 0;
                sum += weight;
                return sum;
              }, 0);
            }
          },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.totalAmount,
              label: '总件数'
            },
            attrs: {
              disabled: true
            },
            computed: () => {
              return this.tableData.length;
            }
          },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.remark,
              label: '备注信息'
            },
            attrs: {
              type: 'textarea',
              height: 100,
              maxlength: 50,
            }
          },
          // {
          //   type: 'input',
          //   formItem: {
          //     prop: 'tag',
          //     label: '标签条码'
          //   }
          // },
        ];
      }
    },
    created() {
      this.scanner = new Scanner();
      this.scanner.listener(this.scannerAdd);
    },
    destroyed() {
      this.scanner.end();
    },
    methods: {
      scannerAdd(text) {
        if (text) {
          this.tableData.push({});
          console.log('扫码枪新增')
        }
      },
      openSelectUsePerson() {
        this.selectUsePersonFlag = true;
        this.$nextTick(() => {
          this.$refs.selectUsePerson.open();
        });
      },
      colRule(item) {
        return [cylinderKeys.remark, 'tag'].includes(item.formItem.prop) ? 24 : 8;
      },
      confirm() {
        console.log(this.formData);
        this.$refs.form.validate();
      },
      open(param) {
        this.$refs.dialog.open();
        if (param) {
          this.isEdit = true;
        }
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
    components: {selectUsePerson}
  };
</script>
<style lang="less" scoped>
  /deep/ .dj-common-red-delete {
    color: red;
    cursor: pointer;
  }
</style>
