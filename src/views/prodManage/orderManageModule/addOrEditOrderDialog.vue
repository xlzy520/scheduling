<template>
    <dj-dialog ref="dialog" @close="close" width="780px" :title="`${isEdit ? '修改' : '新增'}备料订单`" @confirm="confirm">
      <dj-form ref="form" :formData="formData" :formOptions="formOptions" :column-num="2" :col-rule="colRule"></dj-form>
    </dj-dialog>
</template>
<script>
  import materialCodeService from '../../../api/service/materialCode';
  import materialSizeInput from '../../../components/materialSizeInput';
  import longitudinalPressureInput from '../../../components/longitudinalPressureInput';
  import dayjs from 'dayjs';
  import {djForm} from 'djweb';
  const {rules} = djForm;
  const checkValue = function (rule, value, callback) {
    if (!value.every(val=>/^\d{0,4}(\.\d{0,2})?$/.test(val))) {
      callback(new Error('限0~9999两位小数'));
    } else {
      callback();
    }
  };
  const materialSizeRules = [
    {
      validator: (rule, value, callback) => {
        if (!value[0]) {
          callback(new Error('切长不能为空'));
        } else if (!value[1]) {
          callback(new Error('切宽不能为空'));
        } else {
          callback();
        }
      }
    },
    {
      validator: checkValue
    }
  ];
  export default {
    name: 'addOrderDialog',
    data: function () {
      return {
        formData: {},
        order: {},
        isEdit: false,
        materialCodeList: []
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: 'customerName',
              label: '客户名称'
            },
            attrs: {
              disabled: true
            }
          },
          {
            type: 'date',
            formItem: {
              prop: 'deliveryTime',
              label: '订单交期',
              rules: [rules.required('请选择订单交期')]
            },
            attrs: {
              type: 'date',
              default: dayjs().add(1, 'day').format('YYYY-MM-DD')
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'materialCode',
              label: '用料代码',
              rules: [rules.required('请选择用料代码')]
            },
            attrs: {
              keyMap: {
                label: 'materialCode',
                value: 'id'
              },
              options: this.materialCodeList
            }
          },
          {
            type: 'djCascader',
            formItem: {
              prop: 'fluteType',
              label: '瓦楞楞型',
              rules: [rules.required('请选择瓦楞楞型')]
            },
            attrs: {
              props: {
                checkStrictly: false,
                value: 'label',
                lazy: false,
                children: 'fluteType'
              },
              options: this.$enum.fluteTypeLayer
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: 'materialSize',
              label: '下料规格',
              rules: [rules.required('请输入下料规格'), ...materialSizeRules]
            },
            component: materialSizeInput
          },
          {
            type: 'input',
            formItem: {
              prop: 'orderAmount',
              label: '订单数量',
              rules: [rules.required('订单数量不可为空')]
            },
            attrs: {
              placeholder: '请输入订单数量（片）',
              reg: /^\d{0,5}$/
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'linePressingMethod',
              label: '压线方式',
              rules: [rules.required('压线方式不可为空')]
            },
            attrs: {
              options: this.$enum.linePressingWay._arr
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'transversePressure',
              label: '横压公式'
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: 'longitudinalPressure',
              label: '纵压公式',
              rules: [{validator: checkValue}]
            },
            component: longitudinalPressureInput
          }
        ];
      }
    },
    created() {
      this.getMaterialCodeList();
    },
    methods: {
      getMaterialCodeList() {
        this.dj_api_extend(materialCodeService.list, {pageNo: 1, pageSize: 999999999}).then(res=>{
          this.materialCodeList = res.list || [];
        });
      },
      colRule(item) {
        if (item.formItem.prop === 'longitudinalPressure') {
          return 24;
        } else {
          return 12;
        }
      },
      confirm() {
        console.log(this.formData);
        this.$refs.form.validate(()=>{
          //todo 发送新增订单接口
          console.log('addOrder');
        });
      },
      getOrderDetail(orderId) {
        // todo 对接获取订单详情接口
        console.log('getOrderDetail');
      },
      open(orderId) {
        this.$refs.dialog.open();
        if (orderId) {
          this.isEdit = true;
          this.getOrderDetail(orderId);
        }
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
