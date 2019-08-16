<template>
  <div>
    <dj-dialog ref="dialog" @close="confirmClose" width="1160px" :title="isEdit ? '编辑' : '新增'" @confirm="confirm">
      <p class="font-subhead">基础信息</p>
      <dj-form ref="form"
               :formData="formData"
               :formOptions="formOptions"
               :column-num="3"></dj-form>
      <p class="font-subhead">纸筒信息</p>
      <base-table ref="table"
                  v-if="readyTable"
                  :column-type-props="{index: {fixed: false}}"
                  :data="tableData"
                  :lazy-total="tableMaxLength"
                  :lazy-remote="()=>getEmptyData(10)"
                  max-height="370"
                  :columns="tableColumns"
                  @row-click="rowClick"
                  :column-type="['index']">
      </base-table>
    </dj-dialog>
    <select-use-person ref="selectForkliftDriver" v-if="selectForkliftDriverFlag" title="选择叉车员" @close="selectForkliftDriverFlag = false" @selectPerson="changeForkliftDriver"></select-use-person>
  </div>
</template>
<script>
  import {djForm} from 'djweb';
  import paperKindService from '../../../api/service/paperKind';
  import paperWarehouseService from '../../../api/service/paperWarehouse';
  import selectUsePerson from '../paperOutStockModule/selectUsePerson';

  const {rules} = djForm;
  import tableInput from './tableInput.vue'
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  const updateArea = function (row) {
    let value;
    let length = row[cylinderKeys.length];
    let paperSize = row[paperKeys.paperSize];
    value = paperSize*length/1000;
    if (isNaN(value) || !value) {
      value = '';
    }
    this.$set(row, cylinderKeys.area, value);
    // return value;
  };
  const updateLength = function (row) {
    let value;
    let weight = row[cylinderKeys.weight];
    let paperSize = row[paperKeys.paperSize];
    let paperGram = row[paperKeys.paperGram];
    value = weight/(paperSize*paperGram/1000/1000);
    if (isNaN(value) || !paperGram || !paperSize) {
      value = '';
    }
    // console.log(value);
    this.$set(row, cylinderKeys.length, value);
    updateArea.bind(this)(row);
  };
  const checkDisabled = function (row) {
    return row[paperKeys.paperStatus] || Boolean(Number(row[cylinderKeys.unitPrice]));
  };
  const TABLE_SELECT = {
    render(h) {
      let { row, index, col, keyMap } = this;
      const input = (val)=>{
        row[paperKeys.warehouseAreaId] = undefined;
        this.$set(row, col.prop, val);
      };
      return (
        <dj-select ref="select"
                   options={this.options}
                   key-map={keyMap}
                   value={row[col.prop]}
                   placeholder="请选择"
                   disabled={this.disabled}
                   on-input={input}
        ></dj-select>
      );
    },
    props: ['row', 'index', 'col', 'service', 'keyMap', 'options', 'disabled'],
  };
  const TABLE_SELECT2 = {
    render(h) {
      let { row, index, col, keyMap } = this;
      const input = (val)=>{
        this.$set(row, col.prop, val);
        this.$emit('input', this)
      };
      return (
        <dj-select ref="select"
                   options={this.realOptions}
                   key-map={keyMap}
                   value={row[col.prop]}
                   disabled={this.disabled}
                   placeholder="请选择"
                   on-input={input}
        ></dj-select>
      );
    },
    mounted() {
      if (!this.$parent.fixed) {
        this.$watch(`row.${paperKeys.warehouseId}`, (val) => {
          // this.row[paperKeys.warehouseAreaId] = undefined;
          if (![null, undefined, ''].includes(val)) {
            this.service(val).then(res=>{
              this.realOptions = res;
            });
          } else {
            this.realOptions = [];
          }
        });
      }
    },
    data() {
      return {
        realOptions: []
      }
    },
    props: ['row', 'index', 'col', 'service', 'keyMap', 'options', 'disabled'],
  };
  const cloneData = function (arr = [], obj1 = {}, obj2 = {}) {
    arr.forEach(key=>{
      obj1[key] = obj2[key];
    });
    return obj1;
  };
  const tableMaxLength = 150;
  export default {
    name: 'addOrEditInStock',
    data: function () {
      return {
        formData: {},
        tableData: [],
        tableColumns: [
          {
            prop: 'operate',
            label: '操作',
            width: 57,
            render: (h, {props: {index, row}}) => {
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
                  <a class={{'dj-common-red-delete': true, disabled: checkDisabled(row)}} on-click={()=>!checkDisabled(row)&&remove()}></a>
                </div>
              );
            }
          },
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            width: 150
          },
          {
            prop: paperKeys.paperNumber,
            label: '原纸编号',
            width: 139,
            renderHeader() {
              return (
                <span><i class="icon-require">*</i>原纸编号</span>
              );
            },
            propsHandler: (props) => {
              const service = (val, cb) => {
                this.getPaperNoList(val).then(cb);
              };
              const beforeEnter = (val, cb) => {
                if (val) {
                  Promise.all([this.getPaperDetail(val), this.getCylinderId(props.row)]).then(result=>{
                    let _obj = cloneData([paperKeys.warehouseAreaId], {}, result[0]);
                    delete result[0][paperKeys.warehouseAreaId];
                    result[0][cylinderKeys.cylinderNo] = result[1];
                    Object.assign(props.row, result[0]);
                    updateLength.bind(this)(props.row);
                    this.$nextTick(()=>{
                      Object.assign(props.row, _obj);
                    });
                  }).finally(cb);
                } else {
                  cb();
                }
              };
              return {...props, service, beforeEnter, label: 'paperNumber', valueKey: 'paperNumber', disabled: checkDisabled(props.row)}
            },
            component: tableInput,
            listeners: {
              input: (val, {index, row}) => {
                // 当前输入框内容变化时需要清空原纸代码等有原纸编号带出的数据
                if (row[paperKeys.paperCode]) {
                  let obj = this.$method.cloneData([cylinderKeys.cylinderNo, paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight], {}, row);
                  this.$set(this.tableData, index, obj);
                }
              },
              select: (obj, props) => {
                if (obj) {
                  Promise.all([this.getPaperDetail(obj[paperKeys.paperNumber]), this.getCylinderId(props.row)]).then(result=>{
                    // let _obj = cloneData([paperKeys.warehouseAreaId], {}, result[0]);
                    // delete result[0][paperKeys.warehouseAreaId];
                    result[0][cylinderKeys.cylinderNo] = result[1];
                    Object.assign(props.row, result[0]);
                    updateLength.bind(this)(props.row);
                    // this.$nextTick(()=>{
                    //   Object.assign(props.row, _obj);
                    // });
                  }).catch(()=>{
                    this.$method.cloneData([paperKeys.paperCode, paperKeys.paperType, paperKeys.paperSize, paperKeys.warehouseId, paperKeys.warehouseAreaId], {}, result[0]);
                  });
                }
              }
            }
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            width: 139,
            renderHeader() {
              return (
                <span><i class="icon-require">*</i>克重(g)</span>
              );
            },
            propsHandler: (props) => {
              return {...props, reg: this.$reg.FIGURE_REGEXP, disabled: checkDisabled(props.row), maxlength: 3}
            },
            component: tableInput,
            listeners: {
              input: (val, props) => {
                updateLength.bind(this)(props.row);
              }
            }
          },
          {
            prop: cylinderKeys.weight,
            label: '重量(kg)',
            width: 139,
            renderHeader() {
              return (
                <span><i class="icon-require">*</i>重量(kg)</span>
              );
            },
            propsHandler: (props) => {
              return {...props, reg: this.$reg.getFloatReg(3), disabled: checkDisabled(props.row)}
            },
            component: tableInput,
            listeners: {
              input: (val, props) => {
                updateLength.bind(this)(props.row);
              }
            }
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            width: 105,
            formatter(row, index, cur) {
              if (cur) {
                cur = Number(cur).toFixed(2);
              } else {
                cur = '';
              }
              return cur;
            }
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            width: 105,
            formatter(row, index, cur) {
              if (cur) {
                cur = Number(cur).toFixed(2);
              } else {
                cur = '';
              }
              return cur;
            }
          },
          {
            prop: paperKeys.paperCode,
            label: '原纸代码',
            width: 129,
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型',
            width: 105,
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)',
            width: 97,
          },
          {
            prop: paperKeys.warehouseId,
            label: '仓库',
            width: 139,
            propsHandler: (props) => {
              return {...props, options: this.warehouseList, keyMap: {label: 'name', value: paperKeys.warehouseId}, disabled: checkDisabled(props.row)}
            },
            component: TABLE_SELECT
          },
          {
            prop: paperKeys.warehouseAreaId,
            label: '库区',
            width: 121,
            propsHandler: (props) => {
              return {...props, service: this.getWarehouseArea, keyMap: {label: 'name', value: paperKeys.warehouseAreaId}, disabled: checkDisabled(props.row)}
            },
            component: TABLE_SELECT2,
            listeners: {
              input: (props) => {
                this.tableData.splice(props.index, 1, props.row);
              }
            }
          },
          {
            prop: paperKeys.paperStatus,
            label: '原纸状态',
            formatter: (row, index, cur) => {
              switch (cur) {
                case true:
                  return '已出库';
                case false:
                  return '已入库';
                default: return '';
              }
            }
          },
        ],
        isEdit: false,
        readyTable: false,
        activeIndex: undefined,
        warehouseList: [],
        tableMaxLength: tableMaxLength,
        supplier_arr: [],
        member_arr: [],

        defaultFormData: {},
        defaultTableData: {},
        defaultEffectiveTableData: {},

        selectForkliftDriverFlag: false
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
            type: 'select',
            formItem: {
              prop: 'supplier',
              label: '原纸供应商'
            },
            attrs: {
              filterable: true,
              disabled: this.isEdit,
              bindObject: true,
              keyMap: {
                value: cylinderKeys.paperSupplierId,
                label: cylinderKeys.paperSupplierName,
              },
              options: this.supplier_arr,
              // type: 'service',
              // valueKey: 'label',
              // service: this.getSupplierList
            }
          },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.deliveryNumber,
              label: '送货车号'
            },
            attrs: {
              disabled: this.isEdit,
              maxlength: 7,
              reg: this.$reg.NORMAL_TEXT_REGEXP
            }
          },
          {
            type: 'select',
            formItem: {
              prop: cylinderKeys.storageType,
              label: '入库类型',
              rules: [rules.required('入库类型不能为空')]
            },
            attrs: {
              keyMap: {
                value: 'label'
              },
              disabled: this.isEdit,
              options: this.$enum.storageType._arr
            }
          },
          {
            type: 'input',
            formItem: {
              prop: cylinderKeys.deliveryBillId,
              label: '送货单号'
            },
            attrs: {
              disabled: this.isEdit,
              maxlength: 40,
              reg: this.$reg.NORMAL_TEXT_REGEXP
            }
          },
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
                <el-input placeholder="请选择叉车员" value={value} disabled={disabled} on-focus={()=>!disabled&&this.openSelectForkliftDriver()}>
                  <i slot="suffix" class="el-input__icon el-icon-search" on-click={()=>!disabled&&this.openSelectForkliftDriver()}></i>
                </el-input>
              );
            }
          },
          // {
          //   type: this.isEdit ? 'input' : 'dj-cascader',
          //   formItem: {
          //     prop: this.isEdit ? cylinderKeys.forkliftDriverName : 'forkliftDriver',
          //     label: '叉车员'
          //   },
          //   attrs: {
          //     showAllLevels: false,
          //     props: {
          //       checkStrictly: false,
          //     },
          //     disabled: this.isEdit,
          //     apiArray: [()=>this.dj_api_extend(paperWarehouseService.getDepartment), this.getRole, this.getMember],
          //   }
          // },
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
              maxlength: 50,
            }
          },
        ];
      },
      effectiveTableData() {
        return this.tableData.filter(obj=>{
          let arr = [cylinderKeys.cylinderNo, paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight, paperKeys.paperCode, paperKeys.paperType, paperKeys.paperSize, paperKeys.warehouseId, paperKeys.warehouseAreaId];
          return arr.every(key=>{
            return !['', undefined, null].includes(obj[key]);});
        });
      }
    },
    created() {
      this.getEmptyData(10).then(res=>{
        this.tableData.push(...res);
      });
      this.getAllWarehouse();
      this.getSupplierList();
      this.addListener(window, 'keyup', this.shortcutCopy);
    },
    mounted() {
      // 表格渲染时间较长，如果与弹框一起渲染，弹框打开会有延迟
      setTimeout(()=>{
        this.readyTable = true;
      });
    },
    methods: {
      // getRole(val) {
      //   return this.dj_api_extend(paperWarehouseService.getRole, {id:val});
      // },
      // getMember(val) {
      //   return this.dj_api_extend(paperWarehouseService.getMember, {id:val}).then(arr=>{
      //     this.member_arr = arr;
      //     return arr;
      //   });
      // },
      getSupplierList() {
        this.dj_api_extend(paperWarehouseService.getSupplierList).then(res=>{
          this.supplier_arr = Object.keys(res).reduce((arr, key)=>{
            arr.push(res[key]);
            return arr;
          }, [])
        });
      },
      //获取单据编号
      getReceiptId() {
        return this.dj_api_extend(paperWarehouseService.getReceiptId, {receiptType:"YZR"}).then(res=>{
          this.$set(this.formData, cylinderKeys.receiptNumber, res);
        })
      },
      //获取纸筒编号
      getCylinderId(row) {
        // if (row[cylinderKeys.cylinderNo]) {
        //   return Promise.resolve(row[cylinderKeys.cylinderNo]);
        // }
        return this.dj_api_extend(paperWarehouseService.getTubeNumber);
      },
      //获取所有原纸编号
      getPaperNoList(val) {
        return this.dj_api_extend(paperKindService.list, {pageNo: 1, pageSize: 10000000, paperNumber: val}).then(res=>{
          let list = res.list || [];
          return list;
        });
      },
      //根据原纸编号获取相关原纸信息
      getPaperDetail(num) {
        let { paperCode, paperType, paperSize, warehouseAreaId, warehouseId } = paperKeys;
        let keyList = [paperCode, paperType, paperSize, warehouseAreaId, warehouseId];
        return paperKindService.list({pageNo: 1, pageSize: 10000000, paperNumber: num}).then(res=>{
          let list = res.list || [];
          let data = list.filter(obj=>obj[paperKeys.paperNumber] === num)[0];
          if (!data) {
            return Promise.reject();
          } else {
            return cloneData(keyList, {paperVarietyId: data['id']}, data);
          }
        }).catch(()=>{
          this.$confirm('无对应原纸编号，请先设置原纸品种.', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'error',
            showClose: false
          });
          return Promise.reject();
        });
      },
      shortcutCopy(e) {
        let keyCode = e.keyCode;
        if (this.activeIndex !== undefined) {
          if (keyCode === 17) {
            let row = this.tableData[this.activeIndex];
            // let cloneObj = this.$method.deepClone(this.tableData[this.activeIndex]);
            let cloneObj = this.$method.cloneData([paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight, cylinderKeys.length, cylinderKeys.area, paperKeys.paperCode, paperKeys.paperType, paperKeys.paperSize, paperKeys.warehouseId, paperKeys.warehouseAreaId], {}, this.tableData[this.activeIndex]);
            // delete cloneObj[paperKeys.warehouseAreaId];
            this.tableData.splice(this.activeIndex + 1, 0, cloneObj);
            if (row[cylinderKeys.cylinderNo]) {
              this.getCylinderId().then(res=>{
                this.$set(cloneObj, cylinderKeys.cylinderNo, res);
                // cloneObj[cylinderKeys.cylinderNo] = res;
              })
            }
            // this.$nextTick(()=>{
            //   Object.assign(cloneObj, _obj);
            // });
            // this.getCylinderId().then(res=>{
            //   let _obj = cloneData([paperKeys.warehouseAreaId], {}, res);
            //   delete result[0][paperKeys.warehouseAreaId];
            //   Object.assign(props.row, result[0], result[1]);
            //
            //   let _obj = this.$method.deepClone(this.tableData[this.activeIndex]);
            //   this.tableData.splice(this.activeIndex + 1, 0, {..._obj, ...res});
            // });
          } else if (keyCode === 13 && e.target.tagName !== 'INPUT') {
            // this.tableData.splice(this.activeIndex + 1, 0, {});
            if (this.tableData.length >= this.tableMaxLength && !Object.keys(this.tableData[this.tableData.length - 1]).length) {
              this.tableData.pop();
            }
            if (this.tableData.length < this.tableMaxLength) {
              this.tableData.splice(this.activeIndex + 1, 0, {});
            }
          }
        }
      },
      rowClick(row) {
        let index = this.tableData.findIndex(obj=>obj === row);
        if (index !== 1) {
          this.activeIndex = index;
        }
      },
      getEmptyData(num) {
        let reset = tableMaxLength - this.tableData.length;
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
      getAllWarehouse() {
        return this.dj_api_extend(paperWarehouseService.getPaperWarehouse).then((res) => {
          this.warehouseList = res.list || [];
        });
      },
      getWarehouseArea(id) {
        return paperWarehouseService.getAreaAllList({warehouseId: id}).then((res) => {
          return res.list || [];
        });
      },
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 8;
      },
      confirm() {
        this.$refs.form.validate(()=>{
          if (!this.effectiveTableData.length) {
            this.$message('纸筒信息不能为空', 'error');
            return;
          }
          if (!this.changeCheck(true)) {
            this.$message('未编辑数据，请确认', 'error');
            return;
          }
          let message;
          let api;
          let post = {
            ...this.formData,
            ...this.formData['supplier'],
            tubeList: this.effectiveTableData.map((obj, index)=>{
              let _obj = {...obj};
              _obj['sortNumber'] = index + 1;
              // _obj['paperVarietyId'] = obj['id'];
              _obj[cylinderKeys.length] = Number(_obj[cylinderKeys.length]).toFixed(2);
              _obj[cylinderKeys.area] = Number(_obj[cylinderKeys.area]).toFixed(2);
              return _obj;
            })
          };
          // let forkliftDriver_arr = post['forkliftDriver'];
          // if (Array.isArray(forkliftDriver_arr) && forkliftDriver_arr.length) {
          //   let id = forkliftDriver_arr[forkliftDriver_arr.length - 1];
          //   post[cylinderKeys.forkliftDriverId] = id;
          //   post[cylinderKeys.forkliftDriverName] = this.member_arr.filter(obj=>obj['value'] === id)[0]['label'];
          // }
          if (!this.isEdit) {
            message = '新增成功';
            api = paperWarehouseService.addInStorage;
          } else {
            message = '编辑成功';
            api = paperWarehouseService.editInStorage;
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
          this.dj_api_extend(paperWarehouseService.getPaperInStorage, param).then(res=>{
            res['supplier'] = {supplierId: res[cylinderKeys.paperSupplierId], supplierName: res[cylinderKeys.paperSupplierName]};
            this.formData = Object.assign({}, this.formData, res);
            let tableData = res.tubeList || [];
            let _arr = tableData.map(obj=>this.$method.cloneData([paperKeys.warehouseAreaId], {}, obj));
            this.tableData = tableData;
            this.$nextTick(()=>{
              this.tableData.map((obj, index)=>{
                Object.assign(obj, _arr[index]);
              });
            });
            return this.getEmptyData(10).then((arr)=>{
              this.tableData = this.tableData.concat(arr);
            });
          }).finally(this.saveDefaultData);
        } else {
          this.getReceiptId();
          this.$nextTick(()=>{
            this.saveDefaultData();
          });
        }
      },
      saveDefaultData() {
        this.defaultFormData = this.$method.deepClone(this.formData);
        this.defaultTableData = this.$method.deepClone(this.tableData);
        this.defaultEffectiveTableData = this.$method.deepClone(this.effectiveTableData);
      },
      changeCheck(bool) {
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
        }, [cylinderKeys.cylinderNo]);
        let longTable;
        let shortTable;
        if (bool) {
          longTable = this.effectiveTableData;
          shortTable = this.defaultEffectiveTableData;
          if (this.defaultEffectiveTableData.length > this.effectiveTableData.length) {
            longTable = this.defaultEffectiveTableData;
            shortTable = this.effectiveTableData;
          }
        } else {
          longTable = this.tableData;
          shortTable = this.defaultTableData;
          if (this.defaultTableData.length > this.tableData.length) {
            longTable = this.defaultTableData;
            shortTable = this.tableData;
          }
        }
        return !(formKeys.every(key=>this.formData[key] === this.defaultFormData[key]) && longTable.every((obj, index) => tableKeys.every(key=>(obj[key] === (shortTable[index] || {})[key]) || (['', undefined, null].includes(obj[key]) && ['', undefined, null].includes((shortTable[index] || {})[key])))));
      },
      confirmClose() {
        if (this.changeCheck()) {
          this.$confirm('信息未保存，确认是否关闭？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.close();
          });
        } else {
          this.close();
        }
      },
      openSelectForkliftDriver() {
        this.selectForkliftDriverFlag = true;
        this.$nextTick(() => {
          this.$refs.selectForkliftDriver.open();
        });
      },
      changeForkliftDriver(arr) {
        let data = {};
        data[cylinderKeys.forkliftDriverId] = arr[1]['value'];
        data[cylinderKeys.forkliftDriverName] = arr[1]['label'];
        Object.assign(this.formData, data);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
    components: {
      selectUsePerson
    }
  };
</script>
<style lang="less" scoped>
  .base-table /deep/ .td-btn-group .dj-common-red-delete {
    color: red;
    cursor: pointer;
  }
  /deep/ .icon-require {
    color: red;
    vertical-align: middle;
  }
  /deep/ .loading-wrap {
    display: none;
  }
</style>
