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
                :data="tableData"
                  max-height="500"
                :columns="tableColumns"
                :column-type="['index']">
      </base-table>
    </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
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
  const TABLE_INPUT = tableInput;
  //   {
  //   render(h) {
  //     let { row, index, col, reg } = this;
  //     const input = (val)=>{
  //       if (reg && reg.test(val) || !reg) {
  //         this.$set(row, col.prop, val);
  //         this.$emit('input', val, {row, index, col, reg});
  //       }
  //     };
  //     const keyup = (e) => {
  //       if (e.keyCode === 13 || e.keyCode === 108) {
  //         if (this.beforeEnter) {
  //           this.beforeEnter(e.target.value, ()=>this.focus(index, col.prop), {row, index, col, ...this.$attrs});
  //         } else {
  //           this.focus(index, col.prop);
  //         }
  //       }
  //     };
  //     return (
  //       <el-autocomplete ref="input"
  //                        value={row[col.prop]}
  //                        fetch-suggestions={(val, cb)=>this.service(val, cb, {row, index, col, ...this.$attrs})}
  //                        value-key={col.prop}
  //                        placeholder="请输入"
  //                        nativeOn-keyup={keyup}
  //                        on-input={input}></el-autocomplete>
  //     );
  //   },
  //   mounted() {
  //     if (!this.$parent.fixed) {
  //       if (!this.$parent.inputMap) {
  //         this.$parent.inputMap = {}
  //       }
  //       this.$parent.inputMap[`${this.index}-${this.col.prop}`] = this;
  //     }
  //   },
  //   props: ['row', 'index', 'col', 'service', 'beforeEnter', 'reg'],
  //   methods: {
  //     focus(index, prop) {
  //       let _index = index;
  //       let arr = [paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight];
  //       let map = arr.reduce((map, str, index) => {
  //         if (index === arr.length -1) {
  //           map[str] = arr[0];
  //         } else {
  //           map[str] = arr[index + 1];
  //         }
  //         return map;
  //       }, {});
  //       if (prop === arr[arr.length -1]) {
  //         index++;
  //       }
  //       this.$parent.inputMap[`${_index}-${prop}`] && this.$parent.inputMap[`${_index}-${prop}`].$refs.input.close();
  //       // this.$parent.inputMap[`${index}-${map[prop]}`] && this.$parent.inputMap[`${index}-${map[prop]}`].$el.querySelector('input').focus();
  //       this.$parent.inputMap[`${index}-${map[prop]}`] && this.$parent.inputMap[`${index}-${map[prop]}`].$refs.input.focus();
  //     }
  //   }
  // };
  const TABLE_SELECT = {
    render(h) {
      let { row, index, col, keyMap } = this;
      const input = (val)=>{
        this.$set(row, col.prop, val);
      };
      return (
        <dj-select ref="select"
                   service={(val, cb)=>this.service(val, cb, {row, index, col, ...this.$attrs})}
                   key-map={keyMap}
                   key-map={{value: col.prop, label: col.prop}}
                   value={row[col.prop]}
                   placeholder="请选择"
                   on-input={input}
        ></dj-select>
      );
    },
    mounted() {
      if (!this.$parent.fixed) {
        this.$refs.select.getOptions();
      }
    },
    props: ['row', 'index', 'col', 'service', 'keyMap'],
    methods: {
      focus(index, prop) {
        let arr = [paperKeys.paperNumber, paperKeys.paperGram, cylinderKeys.weight];
        let map = arr.reduce((map, str, index) => {
          if (index === arr.length -1) {
            map[str] = arr[0];
          } else {
            map[str] = arr[index + 1];
          }
          return map;
        }, {});
        if (prop === arr[arr.length -1]) {
          index++;
        }
        this.$parent.inputMap[`${index}-${map[prop]}`] && this.$parent.inputMap[`${index}-${map[prop]}`].$el.querySelector('input').focus();
      }
    }
  };
  export default {
    name: 'addOrEditInStock',
    data: function () {
      return {
        formData: {},
        tableData: [{}],
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
                  this.tableData.splice(index, 1);
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
                console.log('对接接口');
                console.log('接口参数', val);
                let data = {};
                data[props.col.prop] = 'sada';
                cb([data]);
              };
              const beforeEnter = (val, cb) => {
                console.log('beforeEnter对接接口');
                console.log('beforeEnter接口参数', val);
                if (val) {
                  props.row[paperKeys.paperCode] = 'sdafdgdfgfdgfdg';
                  props.row[paperKeys.paperType] = '1';
                  props.row[paperKeys.warehouseId] = '1';
                  props.row[paperKeys.warehouseAreaId] = '1';
                  this.$set(props.row, paperKeys.paperSize, '1800');
                  updateLength.bind(this)(props.row);
                }
                cb();
              };
              return {...props, service, beforeEnter}
            },
            component: TABLE_INPUT
          },
          {
            prop: paperKeys.paperGram,
            label: '克重',
            propsHandler: (props) => {
              const service = (val, cb) => {
                console.log('对接接口');
                console.log('接口参数', val);
                let data = {};
                data[props.col.prop] = '234345345';
                cb([data]);
              };
              const beforeEnter = (val, cb) => {
                console.log('beforeEnter对接接口');
                console.log('beforeEnter接口参数', val);
                cb();
              };
              return {...props, service, beforeEnter, reg: this.$reg.FIGURE_REGEXP}
            },
            component: TABLE_INPUT,
            listeners: {
              input: (val, props) => {
                updateLength.bind(this)(props.row);
              }
            }
          },
          {
            prop: cylinderKeys.weight,
            label: '重量',
            propsHandler: (props) => {
              const service = (val, cb) => {
                console.log('对接接口');
                console.log('接口参数', val);
                let data = {};
                data[props.col.prop] = 'saffdgjghjygj';
                cb([data]);
              };
              const beforeEnter = (val, cb, props) => {
                console.log('beforeEnter对接接口');
                console.log('beforeEnter接口参数', props);
                if (props.index === this.tableData.length - 1) {
                  this.tableData.push({});
                  this.$nextTick(()=>{
                    cb();
                  });
                }
              };
              return {...props, service, beforeEnter, reg: this.$reg.FIGURE_REGEXP}
            },
            component: TABLE_INPUT,
            listeners: {
              input: (val, props) => {
                updateLength.bind(this)(props.row);
              }
            }
          },
          {
            prop: cylinderKeys.length,
            label: '长度(m)',
            formatter(row) {
              let value;
              let weight = row[cylinderKeys.weight];
              let paperSize = row[paperKeys.paperSize];
              let paperGram = row[paperKeys.paperGram];
              value = weight/(paperSize/1000*paperGram/1000);
              if (isNaN(value)) {
                value = '';
              }
              return value;
            }
          },
          {
            prop: cylinderKeys.area,
            label: '面积(㎡)',
            formatter(row) {
              let value;
              let length = row[cylinderKeys.length];
              let paperSize = row[paperKeys.paperSize];
              value = paperSize/1000*length;
              if (isNaN(value)) {
                value = '';
              }
              return value;
            }
          },
          {
            prop: paperKeys.paperCode,
            label: '原值代码'
          },
          {
            prop: paperKeys.paperType,
            label: '原纸类型'
          },
          {
            prop: paperKeys.paperSize,
            label: '门幅(mm)'
          },
          {
            prop: paperKeys.warehouseId,
            label: '仓库',
            propsHandler(props) {
              const service = (val, cb) => {
                console.log('对接接口');
                console.log('接口参数', val);
                let data = {};
                data[paperKeys.warehouseName] = 'sada';
                data[paperKeys.warehouseId] = '1';
                return Promise.resolve([data]);
              };
              return {...props, service, keyMap: {label: paperKeys.warehouseName, value: paperKeys.warehouseId}}
            },
            component: TABLE_SELECT
          },
          {
            prop: paperKeys.warehouseAreaId,
            label: '库区',
            propsHandler(props) {
              const service = (val, cb) => {
                console.log('对接接口');
                console.log('接口参数', val);
                let data = {};
                data[paperKeys.warehouseAreaName] = 'yutyuhg';
                data[paperKeys.warehouseAreaId] = '1';
                return Promise.resolve([data]);
              };
              return {...props, service, keyMap: {label: paperKeys.warehouseName, value: paperKeys.warehouseId}}
            },
            component: TABLE_SELECT
          },
          {
            prop: paperKeys.paperStatus,
            label: '原纸状态'
          },
        ],
        isEdit: false
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
              maxlength: 50,
            }
          },
        ];
      }
    },
    created() {},
    methods: {
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

</style>
