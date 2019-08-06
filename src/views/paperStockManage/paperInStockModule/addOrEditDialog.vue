<template>
    <dj-dialog ref="dialog" @close="close" width="1506px" :title="isEdit ? '编辑' : '新增'" @confirm="confirm">
      <p>基础信息</p>
        <dj-form ref="form"
                 :formData="formData"
                 :formOptions="formOptions"
                 :column-num="4"
                 :col-rule="colRule"></dj-form>
      <p>纸筒信息</p>
      <base-table ref="table"
                  v-if="readyTable"
                  :column-type-props="{index: {fixed: false}}"
                  :data="tableData"
                  :lazy-total="tableMaxLength"
                  :lazy-remote="()=>getEmptyData(10)"
                  max-height="500"
                  :columns="tableColumns"
                  @row-click="rowClick"
                  :column-type="['index']">
      </base-table>
    </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
  import paperKindService from '../../../api/service/paperKind';
  import paperWarehouseService from '../../../api/service/paperWarehouse';
  const {rules} = djForm;
  import tableInput from './tableInput'
  import { cylinderKeys, paperKeys } from "../../../utils/system/constant/dataKeys";
  const updateArea = function (row) {
    let value;
    let length = row[cylinderKeys.length];
    let paperSize = row[paperKeys.paperSize];
    value = paperSize*length/1000;
    if (isNaN(value)) {
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
    if (isNaN(value)) {
      value = '';
    }
    this.$set(row, cylinderKeys.length, value);
    updateArea.bind(this)(row);
  };
  const TABLE_SELECT = {
    render(h) {
      let { row, index, col, keyMap } = this;
      const input = (val)=>{
        this.$set(row, col.prop, val);
      };
      return (
        <dj-select ref="select"
                   options={this.options}
                   key-map={keyMap}
                   value={row[col.prop]}
                   placeholder="请选择"
                   on-input={input}
        ></dj-select>
      );
    },
    props: ['row', 'index', 'col', 'service', 'keyMap', 'options'],
  };
  const TABLE_SELECT2 = {
    render(h) {
      let { row, index, col, keyMap } = this;
      const input = (val)=>{
        this.$set(row, col.prop, val);
      };
      return (
        <dj-select ref="select"
                   options={this.realOptions}
                   key-map={keyMap}
                   value={row[col.prop]}
                   placeholder="请选择"
                   on-input={input}
        ></dj-select>
      );
    },
    mounted() {
      if (!this.$parent.fixed) {
        this.$watch(`row.${paperKeys.warehouseId}`, (val) => {
          this.row[paperKeys.warehouseAreaId] = undefined;
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
    props: ['row', 'index', 'col', 'service', 'keyMap', 'options'],
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
                <i class="el-icon-remove-outline" on-click={remove}></i>
              );
            }
          },
          {
            prop: cylinderKeys.cylinderNo,
            label: '纸筒编号'
          },
          {
            prop: paperKeys.paperNumber,
            label: '原纸编号',
            propsHandler: (props) => {
              const service = (val, cb) => {
                this.getPaperNoList(val).then(cb);
              };
              const beforeEnter = (val, cb) => {
                // if (val) {
                //   Promise.all([this.getPaperDetail(val), this.getCylinderId()]).then(result=>{
                //     let _obj = cloneData([paperKeys.warehouseAreaId], {}, result[0]);
                //     delete result[0][paperKeys.warehouseAreaId];
                //     Object.assign(props.row, result[0], result[1]);
                //     updateLength.bind(this)(props.row);
                //     this.$nextTick(()=>{
                //       Object.assign(props.row, _obj);
                //     });
                //   });
                // }
                cb();
              };
              return {...props, service, beforeEnter, label: 'paperNumber', valueKey: 'paperNumber'}
            },
            component: tableInput,
            listeners: {
              select: (obj, props) => {
                if (obj) {
                  Promise.all([this.getPaperDetail(obj[paperKeys.paperNumber]), this.getCylinderId()]).then(result=>{
                    let _obj = cloneData([paperKeys.warehouseAreaId], {}, result[0]);
                    delete result[0][paperKeys.warehouseAreaId];
                    Object.assign(props.row, result[0], result[1]);
                    updateLength.bind(this)(props.row);
                    this.$nextTick(()=>{
                      Object.assign(props.row, _obj);
                    });
                  });
                }
              }
            }
          },
          {
            prop: paperKeys.paperGram,
            label: '克重(g)',
            propsHandler: (props) => {
              // const service = (val, cb) => {
              //   console.log('对接接口');
              //   console.log('接口参数', val);
              //   let data = {};
              //   data[props.col.prop] = '234345345';
              //   cb([data]);
              // };
              // const beforeEnter = (val, cb) => {
              //   // console.log('beforeEnter对接接口');
              //   // console.log('beforeEnter接口参数', val);
              //   cb();
              // };
              return {...props, reg: this.$reg.FIGURE_REGEXP}
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
            propsHandler: (props) => {
              // const service = (val, cb) => {
              //   console.log('对接接口');
              //   console.log('接口参数', val);
              //   let data = {};
              //   data[props.col.prop] = 'saffdgjghjygj';
              //   cb([data]);
              // };
              // const beforeEnter = (val, cb, props) => {
              //   // console.log('beforeEnter对接接口');
              //   // console.log('beforeEnter接口参数', props);
              //   if (props.index === this.tableData.length - 1) {
              //     this.tableData.push({});
              //     this.$nextTick(()=>{
              //       cb();
              //     });
              //   } else {
              //     cb();
              //   }
              // };
              return {...props, reg: this.$reg.FIGURE_REGEXP}
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
            formatter(row, index, cur) {
              // let value;
              // let weight = row[cylinderKeys.weight];
              // let paperSize = row[paperKeys.paperSize];
              // let paperGram = row[paperKeys.paperGram];
              // value = weight/(paperSize/1000*paperGram/1000);
              // if (isNaN(value)) {
              //   value = '';
              // } else {
              //   value = value.toFixed(2);
              // }
              if (cur) {
                cur = cur.toFixed(2);
              }
              return cur;
            }
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            formatter(row, index, cur) {
              // let value;
              // let length = row[cylinderKeys.length];
              // let paperSize = row[paperKeys.paperSize];
              // value = paperSize/1000*length;
              // if (isNaN(value)) {
              //   value = '';
              // } else {
              //   value = value.toFixed(2);
              // }
              // return value;
              if (cur) {
                cur = cur.toFixed(2);
              }
              return cur;
            }
          },
          {
            prop: paperKeys.paperCode,
            label: '原纸代码'
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型',
            formatter: (row, index, cur) => {
              let obj = this.$enum.paperType._swap[cur] || {};
              return obj.label || '';
            }
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)'
          },
          {
            prop: paperKeys.warehouseId,
            label: '仓库',
            propsHandler: (props) => {
              return {...props, options: this.warehouseList, keyMap: {label: 'name', value: paperKeys.warehouseId}}
            },
            component: TABLE_SELECT
          },
          {
            prop: paperKeys.warehouseAreaId,
            label: '库区',
            propsHandler: (props) => {
              // const service = (val, cb) => {
              //   // console.log('对接接口');
              //   // console.log('接口参数', val);
              //   let data = {};
              //   data[paperKeys.warehouseAreaName] = 'yutyuhg';
              //   data[paperKeys.warehouseAreaId] = '1';
              //   return Promise.resolve([data]);
              // };
              return {...props, service: this.getWarehouseArea, keyMap: {label: 'name', value: paperKeys.warehouseAreaId}}
            },
            component: TABLE_SELECT2
          },
          {
            prop: paperKeys.paperStatus,
            label: '原纸状态'
          },
        ],
        isEdit: false,
        readyTable: false,
        activeIndex: undefined,
        warehouseList: [],
        tableMaxLength: tableMaxLength
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
            type: 'input',
            formItem: {
              prop: cylinderKeys.paperSupplier,
              label: '原纸供应商'
            },
            attrs: {
              disabled: this.isEdit
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
            type: 'dj-cascader',
            formItem: {
              prop: cylinderKeys.forkliftDriver,
              label: '叉车员'
            },
            attrs: {
              props: {
                checkStrictly: false
              },
              disabled: this.isEdit,
              apiArray: []
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
      this.addListener(window, 'keyup', this.shortcutCopy);
    },
    mounted() {
      // 表格渲染时间较长，如果与弹框一起渲染，弹框打开会有延迟
      setTimeout(()=>{
        this.readyTable = true;
      });
    },
    methods: {
      //获取纸筒编号
      getCylinderId() {
        let data = {};
        data[cylinderKeys.cylinderNo] = 213435345435;
        return Promise.resolve(data);
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
          return cloneData(keyList, {}, data);
        }).catch(()=>{
          return cloneData(keyList);
        });
      },
      shortcutCopy(e) {
        let keyCode = e.keyCode;
        if (this.activeIndex !== undefined) {
          if (keyCode === 17) {
            this.getCylinderId().then(res=>{
              let _obj = this.$method.deepClone(this.tableData[this.activeIndex]);
              this.tableData.splice(this.activeIndex + 1, 0, {..._obj, ...res});
            });
          } else if (keyCode === 13 && e.target.tagName !== 'INPUT' && this.tableData.length < tableMaxLength) {
            this.tableData.splice(this.activeIndex + 1, 0, {});
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
        return this.dj_api_extend(paperWarehouseService.getAreaAllList, {warehouseId: id}).then((res) => {
          return res.list || [];
        });
      },
      colRule(item) {
        return item.formItem.prop === cylinderKeys.remark ? 24 : 6;
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
    }
  };
</script>
<style lang="less" scoped>
/deep/ .el-icon-remove-outline {
  color: red;
}
</style>
