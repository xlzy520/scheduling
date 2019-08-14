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
                  :lazy-total="tableMaxLength"
                  :lazy-remote="()=>getEmptyData(10)"
                  @row-click="rowClick"
                  :columns="tableColumns"
                  :column-type="['index']">
      </base-table>
    </dj-dialog>
    <select-use-person ref="selectUsePerson" v-if="selectUsePersonFlag" @close="selectUsePersonFlag = false" @selectPerson="changeUserPerson"></select-use-person>
  </div>
</template>
<script>
  import {djForm} from 'djweb';
  const {rules} = djForm;
  import tableInput from '../paperInStockModule/tableInput'
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import selectUsePerson from './selectUsePerson';
  import {Scanner} from "../../../utils";
  import paperWarehouseService from '../../../api/service/paperWarehouse';


  export default {
    name: 'addOrEditInStock',
    data: function () {
      return {
        selectUsePersonFlag: false,
        formData: {},
        tableData: [],
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
            width: 150,
            propsHandler: (props) => {
              const beforeEnter = (val, cb, props) => {
                let sameRow = this.tableData.filter(obj=>obj[cylinderKeys.cylinderNo] === val)[0];
                if (sameRow && sameRow[paperKeys.paperCode]) {
                  this.$message('该纸筒编号已存在', 'error');
                } else {
                  this.getTubeByNumber(val).then(obj=>{
                    if (obj[paperKeys.paperStatus]) {
                      this.$message('该纸筒编号已出库', 'error');
                    } else {
                      this.$set(this.tableData, props.index, obj);
                    }
                  });
                  cb();
                }
                // if (props.index === this.tableData.length - 1) {
                //   this.tableData.push({});
                //   this.$nextTick(()=>{
                //     cb();
                //   });
                // } else {
                //   cb();
                // }
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
            prop: cylinderKeys.paperSupplierName,
            label: '原纸供应商',
            width: 156,
          },
        ],
        isEdit: false,
        scanner: undefined,
        activeIndex: undefined,
        tableMaxLength: 150,
        member_arr: [],
        department_arr: [],
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
            // type: this.isEdit ? 'input' : 'dj-cascader',
            type: 'custom',
            formItem: {
              // prop: this.isEdit ? 'department-person-name' : 'department-person',
              prop: 'department-person-name',
              label: '领用部门/领用人'
            },
            attrs: {
              props: {
                checkStrictly: false,
              },
              disabled: this.isEdit,
              apiArray: [()=>this.dj_api_extend(paperWarehouseService.getDepartment), this.getRole, this.getMember],
            },
            render: (h, {props: {value, disabled}}) => {
              return (
                <el-input value={value} disabled={disabled}>
                  <i slot="suffix" class="el-input__icon el-icon-search" on-click={()=>!disabled&&this.openSelectUsePerson()}></i>
                </el-input>
              );
            }
          },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.useGroup,
              label: '领用单元',
              // rules: [rules.required('领用单元不能为空')]
            },
            attrs: {
              disabled: this.isEdit
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
            type: this.isEdit ? 'input' : 'dj-cascader',
            formItem: {
              prop: this.isEdit ? cylinderKeys.forkliftDriverName : 'forkliftDriver',
              label: '叉车员'
            },
            attrs: {
              showAllLevels: false,
              props: {
                checkStrictly: false,
              },
              disabled: this.isEdit,
              apiArray: [this.getDepartment, this.getRole, this.getMember],
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
              return this.effectiveTableData.reduce((sum, obj) => {
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
              return this.effectiveTableData.length;
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
              // reg: /.*/,
              maxlength: 50,
            },
            // listeners: {
            //   input(val) {
            //     console.log(val);
            //   }
            // }
          },
          // {
          //   type: 'input',
          //   formItem: {
          //     prop: 'tag',
          //     label: '标签条码'
          //   }
          // },
        ];
      },
      effectiveTableData() {
        return this.tableData.filter(obj=>{
          let arr = [cylinderKeys.cylinderNo, paperKeys.paperGram, cylinderKeys.weight, paperKeys.paperCode, paperKeys.paperType, paperKeys.paperSize, paperKeys.warehouseId, paperKeys.warehouseAreaId];
          return arr.every(key=>{
            return !['', undefined, null].includes(obj[key]);});
        });
      }
    },
    created() {
      this.scanner = new Scanner();
      this.scanner.listener(this.scannerAdd);
      this.getEmptyData(10).then(res=>{
        this.tableData.push(...res);
      });
      this.addListener(window, 'keyup', this.shortcut);
    },
    destroyed() {
      this.scanner.end();
    },
    methods: {
      getDepartment() {
        return this.dj_api_extend(paperWarehouseService.getDepartment).then(arr=>{
          this.department_arr = arr;
          return arr;
        });
      },
      getRole(val) {
        return this.dj_api_extend(paperWarehouseService.getRole, {id:val});
      },
      getMember(val) {
        return this.dj_api_extend(paperWarehouseService.getMember, {id:val}).then(arr=>{
          this.member_arr = arr;
          return arr;
        });
      },
      //获取纸筒信息
      getTubeByNumber(num) {
        return this.dj_api_extend(paperWarehouseService.getPaperTube, {paperTubeNumber: num})
      },
      //获取单据编号
      getReceiptId() {
        this.dj_api_extend(paperWarehouseService.getReceiptId, {receiptType:"YZC"}).then(res=>{
          this.$set(this.formData, cylinderKeys.receiptNumber, res);
        })
      },
      rowClick(row) {
        let index = this.tableData.findIndex(obj=>obj === row);
        if (index !== 1) {
          this.activeIndex = index;
        }
      },
      shortcut(e) {
        let keyCode = e.keyCode;
        if (this.activeIndex !== undefined) {
          if (keyCode === 13 && e.target.tagName !== 'INPUT') {
            if (this.tableData.length >= this.tableMaxLength && !Object.keys(this.tableData[this.tableData.length - 1]).length) {
              this.tableData.pop();
            }
            if (this.tableData.length < this.tableMaxLength) {
              this.tableData.splice(this.activeIndex + 1, 0, {});
            }
          }
        }
      },
      getEmptyData(num) {
        let reset = this.tableMaxLength - this.tableData.length;
        return new Promise(resolve => {
          let data = [];
          for (let i = 0; i < (reset > num ? num : reset); i++) {
            data.push({});
          }
          // setTimeout(()=>{
          resolve(data);
          // }, 8000);
        });
        // let data = [];
        // for (let i = 0; i < num; i++) {
        //   data.push({});
        // }
        // return Promise.resolve(data);
      },
      scannerAdd(text) {
        if (text) {
          console.log('扫码枪新增');
          let index_r = [...this.tableData].reverse().findIndex(obj=>Object.keys(obj).length);
          let index = index_r === -1 ? 0 : this.tableData.length - index_r;
          if (index > this.tableMaxLength - 1) {
            this.$message('数据超出最大长度', 'error');
            return;
          }
          this.getTubeByNumber(text).finally((obj = {})=>{
            if (obj[paperKeys.paperStatus]) {
              this.$message('该纸筒编号已出库', 'error');
              return;
            }
            if (index < this.tableMaxLength - 1) {
              if (this.tableData.length === this.tableMaxLength) {
                this.tableData.pop();
              }
              this.tableData.splice(index, 0, obj);
            } else {
              this.tableData.splice(index, 1, obj);
            }
          });
        }
      },
      openSelectUsePerson() {
        this.selectUsePersonFlag = true;
        this.$nextTick(() => {
          this.$refs.selectUsePerson.open();
        });
      },
      colRule(item) {
        return 8;
      },
      confirm() {
        this.$refs.form.validate(()=>{
          if (!this.effectiveTableData.length) {
            this.$message('纸筒信息不能为空', 'error');
            return;
          }
          let message;
          let api;
          let post = {
            ...this.formData,
            tubeList: this.effectiveTableData.map((obj, index)=>{
              let _obj = {...obj};
              _obj['sortNumber'] = index + 1;
              return _obj;
            })
          };
          let recipient = this.formData['department-person'];
          if (Array.isArray(recipient) && recipient.length) {
            let id = recipient[recipient.length - 1];
            post[cylinderKeys.usePerson] = id;
            post[cylinderKeys.usePersonName] = this.member_arr.filter(obj=>obj['value'] === id)[0]['label'];
            post[cylinderKeys.useDepartment] = recipient[0];
            post[cylinderKeys.useDepartmentName] = this.department_arr.filter(obj=>obj['value'] === recipient[0])[0]['label'];
          }
          let forkliftDriver_arr = post['forkliftDriver'];
          if (Array.isArray(forkliftDriver_arr) && forkliftDriver_arr.length) {
            let id = forkliftDriver_arr[forkliftDriver_arr.length - 1];
            post[cylinderKeys.forkliftDriverId] = id;
            post[cylinderKeys.forkliftDriverName] = this.member_arr.filter(obj=>obj['value'] === id)[0]['label'];
          }
          if (!this.isEdit) {
            message = '新增成功';
            api = paperWarehouseService.addOutStorage;
          } else {
            message = '编辑成功';
            api = paperWarehouseService.editOutStorage;
            // post.id = this.formData.id;
          }
          this.dj_api_extend(api, post).then((res) => {
            this.$emit('success');
            this.$message(message);
            this.close();
          });
        });
      },
      open(param) {
        this.$refs.dialog.open();
        if (param) {
          this.isEdit = true;
          this.dj_api_extend(paperWarehouseService.getPaperOutStorage, param).then(res=>{
            res['department-person-name'] = `${res[cylinderKeys.useDepartmentName]} / ${res[cylinderKeys.usePersonName]}`;
            this.formData = Object.assign({}, this.formData, res);
            this.tableData = res.tubeList || [];
            this.getEmptyData(10).then(arr=>{
              this.tableData = this.tableData.concat(arr);
            });
          });
        } else {
          this.getReceiptId();
        }
      },
      changeUserPerson(arr) {
        console.log(arr);
        let data = {};
        data[cylinderKeys.usePerson] = arr[1]['value'];
        data[cylinderKeys.usePersonName] = arr[1]['label'];
        data[cylinderKeys.useDepartment] = arr[0]['value'];
        data[cylinderKeys.useDepartmentName] = arr[0]['label'];
        data['department-person-name'] = arr.reduce((str, obj, index)=>{
          str += (index ? ' / ' : '') + obj.label;
          return str;
        }, '');
        Object.assign(this.formData, data);
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
