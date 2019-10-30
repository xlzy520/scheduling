<template>
  <div>
    <lock-dialog ref="dialog" @close="confirmClose" width="1086px" :title="isEdit ? '编辑' : '新增'" @confirm="confirm">
      <div v-loading="isTableLoading">
        <p class="font-subhead">基础信息</p>
        <dj-form ref="form"
                 :form-data="formData"
                 :form-options="formOptions"
                 :col-rule="colRule"
                 :column-num="3"></dj-form>
        <p class="font-subhead">
          纸筒信息
          <span class="sub-title">
            <span>总重量：{{totalWeight}}kg</span>
            <span>破损总重量：{{damagedWeight}}kg</span>
            <span>总件数：{{effectiveTableData.length}}件</span>
          </span>
        </p>
        <base-table class="input-table" ref="table"
                    v-if="readyTable"
                    border
                    :column-type-props="{index: {fixed: false,width: 64}}"
                    :data="tableData"
                    :lazy-total="tableMaxLength"
                    :lazy-remote="()=>getEmptyData(10)"
                    max-height="370"
                    :columns="tableColumns"
                    @row-click="rowClick"
                    :column-type="['index']">
        </base-table>
      </div>
    </lock-dialog>
    <select-use-person ref="selectForkliftDriver" v-if="selectForkliftDriverFlag" title="选择叉车员" @close="selectForkliftDriverFlag = false" @select-person="changeForkliftDriver"></select-use-person>
  </div>
</template>
<script>
  import paperKindService from '../../../api/service/paperKind';
  import paperWarehouseService from '../../../api/service/paperWarehouse';
  import selectUsePerson from '../paperOutStockModule/selectUsePerson';

  import tableInput from './tableInput.vue';
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  function getColumnsProps(columns, filterFn) {
    return columns.reduce((arr, obj, index) => {
      if (!filterFn || filterFn(obj, index)) {
        arr.push(obj.prop);
      }
      return arr;
    }, []);
  }
  //更新面积
  const updateArea = function (row) {
    let value;
    let length = row[cylinderKeys.length];
    let paperSize = row[paperKeys.paperSize];
    value = paperSize * length / 1000;
    if (isNaN(value) || !value || !Number(length || 0)) {
      value = '';
    }
    this.$set(row, cylinderKeys.area, value);
    // return value;
  };
  //更新长度
  const updateLength = function (row) {
    let value;
    let weight = row[cylinderKeys.weight];
    let paperSize = row[paperKeys.paperSize];
    let paperGram = row[paperKeys.paperGram];
    value = weight / (paperSize * paperGram / 1000 / 1000);
    if (isNaN(value) || !Number(paperGram || 0) || !Number(paperSize || 0)) {
      value = '';
    }
    this.$set(row, cylinderKeys.length, value);
    updateArea.bind(this)(row);
  };
  //更新净重
  const updateNetWeight = function (row) {
    let value;
    let weight = row[cylinderKeys.weight];
    let damagedWeight = row[cylinderKeys.damagedWeight] || 0;
    if (this.$method.judgeEmpty([weight])) {
      value = '';
    } else {
      value = weight - damagedWeight;
    }
    this.$set(row, cylinderKeys.netWeight, value);
  };
  //判断当前行是否要置灰
  const checkDisabled = function (row) {
    return row[paperKeys.paperStatus] || Boolean(Number(row[cylinderKeys.unitPrice]));
  };
  //仓库选择框
  const SELECT_WAREHOUSE = {
    render() {
      let { row, col, keyMap } = this;
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
  //库区选择框
  const SELECT_WAREHOUSE_AREA = {
    render() {
      let { row, col, keyMap } = this;
      const input = (val)=>{
        this.$set(row, col.prop, val);
        this.$emit('input', this);
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
      };
    },
    props: ['row', 'index', 'col', 'service', 'keyMap', 'options', 'disabled'],
  };
  //表格最大长度
  const tableMaxLength = 150;
  export default {
    name: 'addOrEditInStock',
    data: function () {
      return {
        formData: {},
        tableData: [],
        isEdit: false,
        readyTable: false,
        activeIndex: undefined,
        warehouseList: [],
        tableMaxLength: tableMaxLength,
        supplier_arr: [],
        member_arr: [],
        warehouseArea_map: {},

        defaultFormData: {},
        defaultTableData: {},
        defaultEffectiveTableData: {},

        selectForkliftDriverFlag: false,
        isTableLoading: false,
      };
    },
    computed: {
      totalWeight() {
        return this.effectiveTableData.reduce((sum, obj) => {
          let weight = Number(obj[cylinderKeys.weight]) || 0;
          // sum += weight;
          // return sum;
          return this.$method.accuracyCompute(sum, weight, '+');
        }, 0).toFixed(3);
      },
      damagedWeight() {
        return this.effectiveTableData.reduce((sum, obj) => {
          let weight = Number(obj[cylinderKeys.damagedWeight]) || 0;
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
            type: 'select',
            formItem: {
              prop: 'supplier',
              label: '原纸供应商',
              // 原纸供应商为不必填时，也需要传一个必过的规则否则表单的校验状态不会再更新
              rules: this.formData[cylinderKeys.storageType] === '采购入库' ? [this.$rule.required(' ')] : [{validator: (a, b, cb)=>cb()}]
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
              rules: [this.$rule.required(' ')]
            },
            attrs: {
              keyMap: {
                value: 'label'
              },
              disabled: this.isEdit,
              options: this.$enum.storageType._arr
            },
            listeners: {
              input: (val) => {
                if (val !== '采购入库') {
                  try {
                    this.$nextTick(()=>{
                      this.$refs.form.$children[0].validateField('supplier');
                    });
                  } catch (e) {}
                }
              }
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
                <el-input placeholder="请选择叉车员" value={value} disabled={disabled} on-focus={()=>!disabled && this.openSelectForkliftDriver()}>
                  <i slot="suffix" class="el-input__icon el-icon-search" on-click={()=>!disabled && this.openSelectForkliftDriver()}></i>
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
              // width: '100%',
              // type: 'textarea',
              // height: 100,
              maxlength: 50,
            }
          },
        ];
      },
      effectiveTableData() {
        return this.tableData.filter(obj=>{
          let arr = getColumnsProps(this.tableColumns, obj => (obj.className === 'is-change' && obj.prop !== cylinderKeys.damagedWeight) || [cylinderKeys.area].includes(obj.prop));
          // let arr = [cylinderKeys.cylinderNo, paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight, cylinderKeys.length, cylinderKeys.area, paperKeys.paperCode, paperKeys.paperType, paperKeys.paperSize, paperKeys.warehouseId, paperKeys.warehouseAreaId];
          if (this.isEdit) {
            arr.push(cylinderKeys.cylinderNo);
          }
          return arr.every(key=>{
            return !['', undefined, null].includes(obj[key]);
          });
        });
      },
      tableColumns() {
        let tableColumns = [
          {
            prop: 'operate',
            label: '操作',
            width: 60,
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
                  <i class={{'dj-common-red-delete': true, disabled: checkDisabled(row)}} on-click={()=>!checkDisabled(row) && remove()}></i>
                </div>
              );
            }
          },
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号',
            width: 137
          },
          {
            prop: paperKeys.paperNumber,
            label: '原纸编号',
            width: 117,
            className: 'is-change',
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
                  this.addRowMsg(val, props.row).finally(cb);
                  // if (this.isEdit) {
                  //   Promise.all([this.getPaperDetail(val), this.getCylinderId(props.row)]).then(result=>{
                  //     result[0][cylinderKeys.cylinderNo] = result[1];
                  //     Object.assign(props.row, result[0]);
                  //     updateLength.bind(this)(props.row);
                  //   }).finally(cb);
                  // } else {
                  //   this.getPaperDetail(val).then(res=>{
                  //     Object.assign(props.row, res);
                  //     updateLength.bind(this)(props.row);
                  //   }).finally(cb);
                  // }
                } else {
                  cb();
                }
              };
              return {...props, service, beforeEnter, label: 'paperNumber', valueKey: 'paperNumber', disabled: checkDisabled(props.row)};
            },
            component: tableInput,
            listeners: {
              input: (val, {index, row}) => {
                // 当前输入框内容变化时需要清空原纸代码等有原纸编号带出的数据
                if (row[paperKeys.paperCode]) {
                  let cloneKey = ['id', cylinderKeys.netWeight].concat(getColumnsProps(this.tableColumns, obj => obj.className === 'is-change' && ![paperKeys.warehouseId, paperKeys.warehouseAreaId].includes(obj.prop)));
                  // let obj = this.$method.cloneData(['id', cylinderKeys.cylinderNo, paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight], {}, row);
                  if (this.isEdit) {
                    cloneKey.push(cylinderKeys.cylinderNo);
                  }
                  let obj = this.$method.cloneData(cloneKey, {}, row);
                  this.$set(this.tableData, index, obj);
                }
              },
              select: (obj, props) => {
                if (obj) {
                  //为避免input事件中将当前行的对象修改了，导致当前方法的赋值效果失效
                  let row = this.tableData[props.index];
                  this.addRowMsg(obj[paperKeys.paperNumber], row);
                  // if (this.isEdit) {
                  //   Promise.all([this.getPaperDetail(obj[paperKeys.paperNumber]), this.getCylinderId(props.row)]).then(result=>{
                  //     result[0][cylinderKeys.cylinderNo] = result[1];
                  //     Object.assign(row, result[0]);
                  //     updateLength.bind(this)(row);
                  //   });
                  // } else {
                  //   this.getPaperDetail(obj[paperKeys.paperNumber]).then(res=>{
                  //     Object.assign(row, res);
                  //     updateLength.bind(this)(row);
                  //   });
                  // }
                  // Promise.all([this.getPaperDetail(obj[paperKeys.paperNumber]), this.getCylinderId(props.row)]).then(result=>{
                  //   result[0][cylinderKeys.cylinderNo] = result[1];
                  //   Object.assign(row, result[0]);
                  //   updateLength.bind(this)(row);
                  // });
                  // this.getPaperDetail(obj[paperKeys.paperNumber]).then(res=>{
                  //   Object.assign(row, res);
                  //   updateLength.bind(this)(row);
                  // });
                }
              }
            }
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            width: 85,
            className: 'is-change',
            renderHeader() {
              return (
                <span><i class="icon-require">*</i>克重(g)</span>
              );
            },
            propsHandler: (props) => {
              return {...props, reg: this.$reg.NONZERO_REGEXP, disabled: checkDisabled(props.row), maxlength: 3};
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
            width: 104,
            className: 'is-change',
            renderHeader() {
              return (
                <span><i class="icon-require">*</i>重量(kg)</span>
              );
            },
            propsHandler: (props) => {
              return {
                ...props,
                reg: this.$reg.getFloatReg(3),
                disabled: checkDisabled(props.row),
                maxlength: 8,
                'class': {'is-error': props.row['isError_weight']}
              };
            },
            component: tableInput,
            listeners: {
              input: (val, props) => {
                updateLength.bind(this)(props.row);
                updateNetWeight.bind(this)(props.row);
                this.judgeWeightSize(props.row);
              }
            }
          },
          {
            prop: cylinderKeys.damagedWeight,
            label: '破损重量(kg)',
            width: 130,
            className: 'is-change',
            propsHandler: (props) => {
              return {
                ...props,
                reg: this.$reg.getFloatReg(3),
                disabled: checkDisabled(props.row),
                maxlength: 12,
                beforeInput(val, oldValue, { row }) {
                  if (val && Number(val) >= 100000000) {
                    return oldValue;
                  } else {
                    return val;
                  }
                },
                'class': {'is-error': props.row['isError_damagedWeight']}
              };
            },
            component: tableInput,
            listeners: {
              input: (val, props) => {
                updateNetWeight.bind(this)(props.row);
                this.judgeWeightSize(props.row);
              }
            }
          },
          {
            prop: paperKeys.warehouseId,
            label: '仓库',
            width: 112,
            className: 'is-change',
            propsHandler: (props) => {
              return {...props, options: this.warehouseList, keyMap: {label: 'name', value: paperKeys.warehouseId}, disabled: checkDisabled(props.row)};
            },
            component: SELECT_WAREHOUSE
          },
          {
            prop: paperKeys.warehouseAreaId,
            label: '库区',
            width: 112,
            className: 'is-change',
            propsHandler: (props) => {
              return {...props, service: this.getWarehouseArea, keyMap: {label: 'name', value: paperKeys.warehouseAreaId}, disabled: checkDisabled(props.row)};
            },
            component: SELECT_WAREHOUSE_AREA,
            listeners: {
              input: (props) => {
                this.tableData.splice(props.index, 1, props.row);
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
            width: 95,
          },
          {
            prop: cylinderKeys.netWeight,
            label: '净重(kg)',
            width: 95,
            formatter(row, index, cur) {
              if (cur) {
                cur = Number(cur).toFixed(3);
              } else {
                cur = '';
              }
              return cur;
            }
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            width: 83,
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
            width: 89,
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
            prop: paperKeys.paperStatus,
            label: '原纸状态',
            width: 88,
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
        ];
        let hiddenProps = [];
        if (!this.isEdit) {
          hiddenProps = [cylinderKeys.cylinderNo, paperKeys.paperStatus];
          tableColumns = tableColumns.filter(obj=>!hiddenProps.includes(obj.prop));
        }
        return tableColumns;
      }
    },
    created() {
      this.getEmptyData(20).then(res=>{
        this.tableData.push(...res);
      });
      this.getAllWarehouse();
      this.getSupplierList();
      this.addListener(window, 'keyup', this.shortcutCopy);
    },
    mounted() {
      // // 表格渲染时间较长，如果与弹框一起渲染，弹框打开会有延迟
      // setTimeout(()=>{
      //   this.readyTable = true;
      // });
    },
    methods: {
      // 根据新增编辑的不同获取不同的数据并绑定到表格中
      addRowMsg(val, row) {
        let promise;
        if (this.isEdit) {
          promise = Promise.all([this.getPaperDetail(val), this.getCylinderId(row)]).then(result=>{
            result[0][cylinderKeys.cylinderNo] = result[1];
            return result[0];
          });
        } else {
          promise = this.getPaperDetail(val)
        }
        return promise.then(res=>{
          Object.assign(row, res);
          updateLength.bind(this)(row);
        })
      },
      // 判断破损重量是否小于重量
      judgeWeightSize(row) {
        let damagedWeight = row[cylinderKeys.damagedWeight] || 0;
        let weight = row[cylinderKeys.weight];
        if (this.$method.judgeEmpty([weight]) || Number(damagedWeight) >= Number(weight)) {
          this.$set(row, 'isError_damagedWeight', true);
        } else {
          this.$set(row, 'isError_damagedWeight', false);
        }
        if (weight + '' === '0') {
          this.$set(row, 'isError_weight', true);
        } else {
          this.$set(row, 'isError_weight', false);
        }
      },
      //获取供应商列表
      getSupplierList() {
        this.dj_api_extend(paperWarehouseService.getSupplierList).then(res=>{
          this.supplier_arr = Object.keys(res).reduce((arr, key)=>{
            arr.push(res[key]);
            return arr;
          }, []);
        });
      },
      //获取单据编号
      getReceiptId() {
        return this.dj_api_extend(paperWarehouseService.getReceiptId, {receiptType: "YZR"}).then(res=>{
          this.$set(this.formData, cylinderKeys.receiptNumber, res);
        });
      },
      //获取纸筒编号
      getCylinderId(row = {}) {
        if (row[cylinderKeys.cylinderNo]) {
          return Promise.resolve(row[cylinderKeys.cylinderNo]);
        }
        return paperWarehouseService.getTubeNumber({storageType: this.formData[cylinderKeys.storageType]});
      },
      //获取所有原纸编号
      getPaperNoList(val) {
        return this.dj_api_extend(paperKindService.list, {pageNo: 1, pageSize: 10000000, paperNumber: val, effected: 1}).then(res=>{
          let list = res.list || [];
          return list;
        }).catch(()=>[]);
      },
      //根据原纸编号获取相关原纸信息
      getPaperDetail(num) {
        let { paperCode, paperType, paperSize, warehouseAreaId, warehouseId, paperName } = paperKeys;
        let keyList = [paperCode, paperType, paperSize, warehouseAreaId, warehouseId, paperName];
        return paperKindService.list({pageNo: 1, pageSize: 10000000, paperNumber: num}).then(res=>{
          let list = res.list || [];
          let data = list.filter(obj=>obj[paperKeys.paperNumber] === num)[0];
          if (!data) {
            return Promise.reject();
          } else {
            return this.$method.cloneData(keyList, {paperVarietyId: data['id']}, data);
          }
        }).catch(()=>{
          this.$message('无对应原纸编号，请先设置原纸品种', 'warning');
          return Promise.reject();
        });
      },
      //快捷复制与插入空白行
      shortcutCopy(e) {
        let keyCode = e.keyCode;
        if (this.activeIndex !== undefined) {
          if (keyCode === 17) {
            let row = this.tableData[this.activeIndex];
            if (row) {
              if (this.activeIndex < this.tableMaxLength - 1) {
                let columnsProps = ['paperVarietyId', paperKeys.paperCode, paperKeys.paperType].concat(getColumnsProps(this.tableColumns, obj=>![paperKeys.paperStatus, cylinderKeys.cylinderNo].includes(obj.prop)));
                let cloneObj = this.$method.cloneData(columnsProps, {}, this.tableData[this.activeIndex]);
                const insetRow = () => {
                  this.tableData.splice(this.activeIndex + 1, 0, cloneObj);
                  if (this.isEdit && row[cylinderKeys.cylinderNo]) {
                    this.getCylinderId().then(res=>{
                      this.$set(cloneObj, cylinderKeys.cylinderNo, res);
                    });
                  }
                };
                if (this.tableData.length < this.tableMaxLength) {
                  insetRow();
                  // this.tableData.splice(this.activeIndex + 1, 0, cloneObj);
                  // if (this.isEdit && row[cylinderKeys.cylinderNo]) {
                  //   this.getCylinderId().then(res=>{
                  //     this.$set(cloneObj, cylinderKeys.cylinderNo, res);
                  //   });
                  // }
                } else {
                  let lastObj = this.tableData[this.tableData.length - 1];
                  if (!Object.keys(lastObj).length || Object.keys(lastObj).every(key=>['', undefined, null].includes(lastObj[key]))) {
                    this.tableData.pop();
                    insetRow();
                    // this.tableData.splice(this.activeIndex + 1, 0, cloneObj);
                    // if (this.isEdit && row[cylinderKeys.cylinderNo]) {
                    //   this.getCylinderId().then(res=>{
                    //     this.$set(cloneObj, cylinderKeys.cylinderNo, res);
                    //   });
                    // }
                  }
                }
              }
            }
          } else if (keyCode === 13 && e.target.tagName !== 'INPUT') {
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
        if (index !== -1) {
          this.activeIndex = index;
        }
      },
      //获得空对象数组
      getEmptyData(num) {
        let reset = tableMaxLength - this.tableData.length;
        return new Promise(resolve => {
          let data = [];
          for (let i = 0; i < (reset > num ? num : reset); i++) {
            data.push({});
          }
            resolve(data);
        });
        // let data = [];
        // for (let i = 0; i < num; i++) {
        //   data.push({});
        // }
        // return Promise.resolve(data);
      },
      //获得所有原纸仓库
      getAllWarehouse() {
        return this.dj_api_extend(paperWarehouseService.getPaperWarehouse).then((res) => {
          this.warehouseList = res.list || [];
        });
      },
      //获得当前仓库下所有库区
      getWarehouseArea(id) {
        if (!this.warehouseArea_map[id]) {
          this.warehouseArea_map[id] = paperWarehouseService.getAreaAllList({warehouseId: id}).then((res) => {
            delete this.warehouseArea_map[id];
            return res.list || [];
          });
        }
        return this.warehouseArea_map[id];
      },
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 8;
      },
      confirm(cb) {
        if (this.effectiveTableData.some(row => row['isError_damagedWeight'])) {
          cb();
          return;
        }
        this.$refs.form.validate(()=>{
          if (!this.effectiveTableData.length) {
            this.$message('纸筒信息不能为空', 'error');
            cb();
            return;
          }
          if (!this.changeCheck(true)) {
            this.$message('未编辑数据，请确认', 'error');
            cb();
            return;
          }
          let api;
          let post = {
            ...this.formData,
            ...this.formData['supplier'],
            tubeList: this.effectiveTableData.map((obj, index)=>{
              let _obj = {...obj};
              _obj['sortNumber'] = index + 1;
              _obj[cylinderKeys.length] = Number(_obj[cylinderKeys.length]).toFixed(2);
              _obj[cylinderKeys.area] = Number(_obj[cylinderKeys.area]).toFixed(2);
              return _obj;
            })
          };
          if (!this.isEdit) {
            // message = '新增成功';
            api = paperWarehouseService.addInStorage;
          } else {
            // message = '编辑成功';
            api = paperWarehouseService.editInStorage;
            // post.id = this.formData.id;
          }
          this.dj_api_extend(api, post).then(() => {
            this.$emit('success');
            this.$message('操作成功');
            this.close();
          }).finally(cb);
        }, cb);
      },
      open(param) {
        this.$refs.dialog.open();
        if (param) {
          this.isEdit = true;
          this.isTableLoading = true;
          this.dj_api_extend(paperWarehouseService.getPaperInStorage, param).then(res=>{
            res['supplier'] = {paperSupplierId: res[cylinderKeys.paperSupplierId], supplierName: res[cylinderKeys.paperSupplierName]};
            this.formData = Object.assign({}, this.formData, res);
            let tableData = res.tubeList || [];
            this.tableData = tableData.map(obj=>{
              let weight = obj[cylinderKeys.weight];
              let damagedWeight = obj[cylinderKeys.damagedWeight];
              let gram = obj[paperKeys.paperGram];
              if (weight) {
                obj[cylinderKeys.weight] = Number(weight) || '';
              }
              if (damagedWeight) {
                obj[cylinderKeys.damagedWeight] = Number(damagedWeight) || '';
              }
              if (gram) {
                obj[paperKeys.paperGram] = Number(gram) || '';
              }
              return obj;
            });
            return this.getEmptyData(10).then((arr)=>{
              this.tableData = this.tableData.concat(arr);
            });
          }).finally(()=>{
            this.saveDefaultData();
            this.isTableLoading = false;
          });
        } else {
          this.getReceiptId();
          this.$nextTick(()=>{
            this.saveDefaultData();
          });
        }
        this.readyTable = true;
      },
      //保存初始数据，用于是否修改的校验
      saveDefaultData() {
        this.defaultFormData = this.$method.deepClone(this.formData);
        this.defaultTableData = this.$method.deepClone(this.tableData);
        this.defaultEffectiveTableData = this.$method.deepClone(this.effectiveTableData);
      },
      //校验是否修改
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
        }, this.isEdit ? [cylinderKeys.cylinderNo] : []);
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
