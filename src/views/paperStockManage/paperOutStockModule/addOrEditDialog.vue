<template>
  <div>
    <lock-dialog ref="dialog" @close="confirmClose" width="1086px" :title="isEdit ? '编辑' : '新增'" @confirm="confirm">
      <div v-loading="isTableLoading">
        <!--<el-button @click="scannerAdd('sadasdsadasd')"></el-button>-->
        <p class="font-subhead">基础信息</p>
        <dj-form ref="form"
                 :form-data="formData"
                 :form-options="formOptions"
                 :column-num="3"
                 :col-rule="colRule"></dj-form>
        <p class="font-subhead">
          纸筒信息
          <span class="sub-title">
            <span>总重量：{{totalWeight}}kg</span>
            <span>破损总重量：{{damagedWeight}}kg</span>
          <span>总件数：{{effectiveTableData.length}}件</span>
          </span>
        </p>
        <base-table ref="table"
                    class="input-table"
                    :loading="isTableLoading"
                    :data="tableData"
                    max-height="370"
                    border
                    :column-type-props="columnsTypeProps"
                    :lazy-total="tableMaxLength"
                    :lazy-remote="()=>getEmptyData(10)"
                    @row-click="rowClick"
                    :columns="tableColumns"
                    :column-type="['index']">
        </base-table>
      </div>
    </lock-dialog>
    <select-use-person ref="selectUsePerson" v-if="selectUsePersonFlag" title="选择责任部门/责任人" @close="selectUsePersonFlag = false" @select-person="changeUserPerson"></select-use-person>
    <select-use-person ref="selectForkliftDriver" v-if="selectForkliftDriverFlag" title="选择叉车员" @close="selectForkliftDriverFlag = false" @select-person="changeForkliftDriver"></select-use-person>
  </div>
</template>
<script>
  import tableInput from '../paperInStockModule/tableControls/tableInput.vue';
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  import selectUsePerson from './selectUsePerson';
  import {Scanner} from "../../../utils";
  import paperWarehouseService from '../../../api/service/paperWarehouse';

  export default {
    name: 'addOrEditInStock',
    data: function () {
      return {
        selectUsePersonFlag: false,
        selectForkliftDriverFlag: false,
        gettingMap: {},
        formData: {},
        tableData: [],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            width: 60,
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
                <div class="td-btn-group">
                  <i class="dj-common-red-delete" on-click={remove}></i>
                </div>
              );
            }
          },
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            width: 137,
            className: 'is-change',
            renderHeader() {
              return (
                <span><i class="icon-require">*</i>纸筒编号</span>
              );
            },
            propsHandler: (props) => {
              const beforeEnter = (val, cb) => {
                if (val && !this.gettingMap[val]) {
                  let sameRow = this.tableData.filter(obj=>obj[cylinderKeys.cylinderNo] === val && props.row !== obj)[0];
                  if (sameRow && sameRow[paperKeys.paperCode]) {
                    this.$message('纸筒已录入', 'error');
                    this.$set(this.tableData, props.index, {});
                    // props.row[cylinderKeys.cylinderNo] = '';
                  } else {
                    this.gettingMap[val] = true;
                    this.getTubeByNumber(val).then(obj=>{
                      // if (obj[paperKeys.paperStatus]) {
                      //   this.$message('该纸筒编号已出库', 'error');
                      //   this.$set(this.tableData, props.index, {});
                      // } else {
                      this.$set(this.tableData, props.index, {...obj, isError: false});
                      // }
                    }).catch(()=>{
                      this.$set(this.tableData, props.index, {});
                      // this.tableData.splice(index, 1, {});
                    }).finally(()=>{
                      this.gettingMap[val] = false;
                    });
                    cb();
                  }
                } else {
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
              return {
                ...props,
                beforeEnter,
                reg: /^[0-9a-zA-Z]*$/,
                'class': {'is-error': props.row['isError']},
                maxlength: 13,
                disabledShortcut: ['left', 'right']
              };
            },
            component: tableInput,
            listeners: {
              change: (val, {index, row}) => {
                let obj = this.$method.cloneData([cylinderKeys.cylinderNo], {}, row);
                this.$set(this.tableData, index, obj);
              }
            }
          },
          {
            prop: paperKeys.paperName,
            label: '原纸名称',
            width: 127,
          },
          // {
          //   prop: paperKeys.paperCode,
          //   label: '原纸代码',
          //   width: 127,
          // },
          // {
          //   prop: paperKeys.paperType,
          //   label: '原纸类型',
          //   width: 89,
          //   formatter: (row, index, cur) => {
          //     let obj = this.$enum.paperType._swap[cur] || {};
          //     return obj.label || '';
          //   }
          // },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)',
            width: 94,
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            width: 85,
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)',
            width: 104,
          },
          {
            prop: cylinderKeys.damagedWeight,
            label: '破损重量(kg)',
            width: 124,
          },
          {
            prop: cylinderKeys.netWeight,
            label: '净重(kg)',
            width: 104,
          },
          {
            prop: paperKeys.warehouseName,
            label: '仓库',
            width: 112,
          },
          {
            prop: paperKeys.warehouseAreaName,
            label: '库区',
            width: 112,
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            width: 82,
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            width: 89,
          },
          {
            prop: cylinderKeys.paperSupplierName,
            label: '原纸供应商',
            width: 172,
          },
        ],
        columnsTypeProps: {
          index: {
            width: 64,
            fixed: false
          }
        },
        isEdit: false,
        scanner: undefined,
        activeIndex: undefined,
        tableMaxLength: 150,
        member_arr: [],
        department_arr: [],

        isTableLoading: false,
        defaultFormData: {},
        defaultTableData: [],
      };
    },
    computed: {
      damagedWeight() {
        return this.effectiveTableData.reduce((sum, obj) => {
          let weight = Number(obj[cylinderKeys.damagedWeight]) || 0;
          // sum += weight;
          // return sum;
          return this.$method.accuracyCompute(sum, weight, '+');
        }, 0).toFixed(3);
      },
      totalWeight() {
        return this.effectiveTableData.reduce((sum, obj) => {
          let weight = Number(obj[cylinderKeys.weight]) || 0;
          // sum += weight;
          // return sum;
          return this.$method.accuracyCompute(sum, weight, '+');
        }, 0).toFixed(3);
      },
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
              label: '领用部门/领用人',
              rules: [this.$rule.required(' ')]
            },
            attrs: {
              // props: {
              //   checkStrictly: false,
              // },
              disabled: this.isEdit,
              // apiArray: [()=>this.dj_api_extend(paperWarehouseService.getDepartment), this.getRole, this.getMember],
            },
            render: (h, {props: {value, disabled}}) => {
              return (
                <el-input placeholder="请选择领用部门/领用人" value={value} disabled={disabled} on-focus={()=>!disabled && this.openSelectUsePerson()}>
                  <i slot="suffix" class="el-input__icon el-icon-search" on-click={()=>!disabled && this.openSelectUsePerson()}></i>
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
              disabled: this.isEdit,
              maxlength: 10,
              reg: this.$reg.NORMAL_TEXT_REGEXP
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
              rules: [this.$rule.required(' ')]
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
            // type: this.isEdit ? 'input' : 'dj-cascader',
            type: 'custom',
            formItem: {
              // prop: this.isEdit ? cylinderKeys.forkliftDriverName : 'forkliftDriver',
              prop: cylinderKeys.forkliftDriverName,
              label: '叉车员'
            },
            attrs: {
              // showAllLevels: false,
              // props: {
              //   checkStrictly: false,
              // },
              disabled: this.isEdit,
              // apiArray: [this.getDepartment, this.getRole, this.getMember],
            },
            render: (h, {props: {value, disabled}}) => {
              return (
                <el-input placeholder="请选择叉车员" value={value} disabled={disabled} on-focus={()=>!disabled && this.openSelectForkliftDriver()}>
                  <i slot="suffix" class="el-input__icon el-icon-search" on-click={()=>!disabled && this.openSelectForkliftDriver()}></i>
                </el-input>
              );
            }
          },
          // {
          //   type: 'input',
          //   formItem: {
          //     prop: cylinderKeys.totalWeight,
          //     label: '总重量'
          //   },
          //   attrs: {
          //     disabled: true
          //   },
          //   computed: () => {
          //     return this.effectiveTableData.reduce((sum, obj) => {
          //       let weight = Number(obj[cylinderKeys.weight]) || 0;
          //       sum += weight;
          //       return sum;
          //     }, 0).toFixed(3);
          //   }
          // },
          // {
          //   type: 'input',
          //   formItem: {
          //     prop: cylinderKeys.totalAmount,
          //     label: '总件数'
          //   },
          //   attrs: {
          //     disabled: true
          //   },
          //   computed: () => {
          //     return this.effectiveTableData.length;
          //   }
          // },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.remark,
              label: '备注信息'
            },
            attrs: {
              // type: 'textarea',
              // height: 100,
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
            return !['', undefined, null].includes(obj[key]);
          });
        });
      }
    },
    created() {
      this.scanner = new Scanner();
      this.scanner.listener(this.scannerAdd);
      this.getEmptyData(20).then(res=>{
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
        return this.dj_api_extend(paperWarehouseService.getRole, {id: val});
      },
      getMember(val) {
        return this.dj_api_extend(paperWarehouseService.getMember, {id: val}).then(arr=>{
          this.member_arr = arr;
          return arr;
        });
      },
      //获取纸筒信息
      getTubeByNumber(num) {
        let post = {
          paperTubeNumber: num
        };
        this.isEdit && (post['id'] = this.formData['id']);
        return paperWarehouseService.getPaperTube(post);
      },
      //获取单据编号
      getReceiptId() {
        this.dj_api_extend(paperWarehouseService.getReceiptId, {receiptType: "YZC"}).then(res=>{
          this.$set(this.formData, cylinderKeys.receiptNumber, res);
        });
      },
      rowClick(row) {
        let index = this.tableData.findIndex(obj=>obj === row);
        if (index !== -1) {
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
          // 兼容老版标签
          let result = /(?<=ztbh:)[a-zA-Z0-9]+(?=,)/.exec(text);
          result && (text = result[0]);
        }
        if (text && !this.gettingMap[text]) {
          let sameRow = this.tableData.filter(obj=>obj[cylinderKeys.cylinderNo] === text && obj[paperKeys.paperCode])[0];
          if (sameRow) {
            this.$message('纸筒已录入', 'error');
            return;
          }
          console.log('扫码枪新增');
          let index_r = [...this.tableData].reverse().findIndex(obj=>{
            return Object.keys(obj).some(key=>!['', undefined, null].includes(obj[key]));
          });
          let index = index_r === -1 ? 0 : this.tableData.length - index_r;
          if (index > this.tableMaxLength - 1) {
            this.$message('数据超出最大长度', 'error');
            return;
          }
          this.gettingMap[text] = true;
          this.getTubeByNumber(text).then((obj = {})=>{
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
          }).finally(()=>{
            this.gettingMap[text] = false;
          });
        }
      },
      openSelectUsePerson() {
        this.selectUsePersonFlag = true;
        this.$nextTick(() => {
          this.$refs.selectUsePerson.open();
        });
      },
      openSelectForkliftDriver() {
        this.selectForkliftDriverFlag = true;
        this.$nextTick(() => {
          this.$refs.selectForkliftDriver.open();
        });
      },
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 8;
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          if (!this.effectiveTableData.length) {
            this.$message('纸筒信息不能为空', 'error');
            cb();
            return;
          }
          if (!this.changeCheck()) {
            this.$message('页面信息没有变化', 'error');
            cb();
            return;
          }
          // let message;
          let api;
          let post = {
            ...this.formData,
            tubeList: this.effectiveTableData.map((obj, index)=>{
              let _obj = {...obj};
              _obj['sortNumber'] = index + 1;
              return _obj;
            })
          };
          // let recipient = this.formData['department-person'];
          // if (Array.isArray(recipient) && recipient.length) {
          //   let id = recipient[recipient.length - 1];
          //   post[cylinderKeys.usePerson] = id;
          //   post[cylinderKeys.usePersonName] = this.member_arr.filter(obj=>obj['value'] === id)[0]['label'];
          //   post[cylinderKeys.useDepartment] = recipient[0];
          //   post[cylinderKeys.useDepartmentName] = this.department_arr.filter(obj=>obj['value'] === recipient[0])[0]['label'];
          // }
          // let forkliftDriver_arr = post['forkliftDriver'];
          // if (Array.isArray(forkliftDriver_arr) && forkliftDriver_arr.length) {
          //   let id = forkliftDriver_arr[forkliftDriver_arr.length - 1];
          //   post[cylinderKeys.forkliftDriverId] = id;
          //   post[cylinderKeys.forkliftDriverName] = this.member_arr.filter(obj=>obj['value'] === id)[0]['label'];
          // }
          if (!this.isEdit) {
            // message = '新增成功';
            api = paperWarehouseService.addOutStorage;
          } else {
            // message = '编辑成功';
            api = paperWarehouseService.editOutStorage;
            // post.id = this.formData.id;
          }
          this.dj_api_extend(api, post).then(() => {
            this.$emit('success');
            this.$message('操作成功');
            this.close();
          }).catch((res)=>{
            let arr = res.data || [];
            let map = arr.reduce((map, str) => {
              map[str] = true;
              return map;
            }, {});
            this.tableData.map(obj=>{
              if (map[obj[cylinderKeys.cylinderNo]]) {
                this.$set(obj, 'isError', true);
              }
            });
          }).finally(cb);
        }, cb);
      },
      open(param) {
        this.$refs.dialog.open();
        if (param) {
          this.isEdit = true;
          this.isTableLoading = true;
          this.dj_api_extend(paperWarehouseService.getPaperOutStorage, param).then(res=>{
            if (res[cylinderKeys.useDepartmentName] && res[cylinderKeys.usePersonName]) {
              res['department-person-name'] = `${res[cylinderKeys.useDepartmentName]} / ${res[cylinderKeys.usePersonName]}`;
            }
            this.formData = Object.assign({}, this.formData, res);
            this.tableData = res.tubeList || [];
            return this.getEmptyData(10).then(arr=>{
              this.tableData = this.tableData.concat(arr);
            }).finally(this.saveDefaultData);
          }).finally(()=>{
            this.isTableLoading = false;
          });
        } else {
          this.getReceiptId();
          this.$nextTick(()=>{
            this.saveDefaultData();
          });
        }
      },
      changeUserPerson(arr) {
        let data = {};
        data[cylinderKeys.usePerson] = arr[1]['value'];
        data[cylinderKeys.usePersonName] = arr[1]['label'];
        data[cylinderKeys.useDepartment] = arr[0]['value'];
        data[cylinderKeys.useDepartmentName] = arr[0]['label'];
        // data['department-person-name'] = arr.reduce((str, obj, index)=>{
        //   str += (index ? ' / ' : '') + obj.label;
        //   return str;
        // }, '');
        Object.assign(this.formData, data);
        // 必须用this.$set设置department-person-name的值，否则会出现表单校验异常的问题
        this.$set(this.formData, 'department-person-name', arr.reduce((str, obj, index)=>{
          str += (index ? ' / ' : '') + obj.label;
          return str;
        }, ''));
      },
      changeForkliftDriver(arr) {
        let data = {};
        data[cylinderKeys.forkliftDriverId] = arr[1]['value'];
        data[cylinderKeys.forkliftDriverName] = arr[1]['label'];
        Object.assign(this.formData, data);
      },
      saveDefaultData() {
        this.defaultFormData = this.$method.deepClone(this.formData);
        this.defaultTableData = this.$method.deepClone(this.effectiveTableData);
      },
      changeCheck() {
        let formKeys = this.formOptions.reduce((arr, obj)=>{
          if (!(obj.attrs || {}).disabled) {
            arr.push(obj.formItem.prop);
          }
          return arr;
        }, []);
        let tableKeys = this.tableColumns.reduce((arr, obj)=>{
          if (obj.component) {
            arr.push(obj.prop);
          }
          return arr;
        }, []);
        let longTable = this.effectiveTableData;
        let shortTable = this.defaultTableData;
        if (this.defaultTableData.length > this.effectiveTableData.length) {
          longTable = this.defaultTableData;
          shortTable = this.effectiveTableData;
        }
        return !(formKeys.every(key=>this.formData[key] === this.defaultFormData[key]) && longTable.every((obj, index) => tableKeys.every(key=>(obj[key] === (shortTable[index] || {})[key]) || (['', undefined, null].includes(obj[key]) && ['', undefined, null].includes((shortTable[index] || {})[key])))));
        // return !(formKeys.every(key=>this.formData[key] === this.defaultFormData[key]) && this.tableData.every((obj, index) => tableKeys.every(key=>(obj[key] === (this.defaultTableData[index] || {})[key]) || (['', undefined, null].includes(obj[key]) && ['', undefined, null].includes((this.defaultTableData[index] || {})[key])))));
        // if (formKeys.every(key=>this.formData[key] === this.defaultFormData[key]) && this.tableData.every((obj, index) => tableKeys.every(key=>(obj[key] === (this.defaultTableData[index] || {})[key]) || (['', undefined, null].includes(obj[key]) && ['', undefined, null].includes((this.defaultTableData[index] || {})[key]))))) {
        //   this.close();
        // } else {
        //   this.$confirm('信息未保存，确认是否关闭？', '', {
        //     type: 'warning',
        //     showClose: false,
        //   }).then(() => {
        //     this.close();
        //   });
        // }
      },
      confirmClose() {
        if (this.changeCheck()) {
          this.$method.tipBox('信息未保存，确认是否关闭？', this.close);
          // this.$confirm('信息未保存，确认是否关闭？', '', {
          //   type: 'warning',
          //   showClose: false,
          // }).then(() => {
          //   this.close();
          // });
        } else {
          this.close();
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
  .sub-title {
    margin-left: 36px;
    font-size: 13px;
    span {
      margin-right: 24px;
    }
  }
  .dj-form {
    position: relative;
    left: -14px;
    width: 1060px;
    margin-bottom: 11px;
    /deep/ .el-row .el-col {
      padding: 0;
    }
    /deep/ .el-form-item {
      margin-top: 0;
      margin-bottom: 10px;
    }
    /deep/ .el-row:nth-last-of-type(1) {
      .dj-input-content {
        width: 100%;
      }
    }
  }
</style>
