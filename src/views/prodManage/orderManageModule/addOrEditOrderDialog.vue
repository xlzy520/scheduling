<template>
    <dj-dialog ref="dialog" @close="close" width="780px" :title="`${isEdit ? '编辑' : '新增'}备料订单`" @confirm="confirm">
      <dj-form v-loading="isLoading" ref="form" :formData="formData" :formOptions="formOptions" :column-num="2" :col-rule="colRule"></dj-form>
      <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
    </dj-dialog>
</template>
<script>
  import materialCodeService from '../../../api/service/materialCode';
  import orderManageService from '../../../api/service/orderManage';
  import materialSizeInput from '../../../components/materialSizeInput';
  import longitudinalPressureInput from '../../../components/longitudinalPressureInput';
  import dayjs from 'dayjs';
  import {djForm} from 'djweb';
  import { orderKeys } from "../../../utils/system/constant/dataKeys";
  import formRules from '../../baseSetting/formRules';
  const {rules} = djForm;
  export default {
    name: 'addOrderDialog',
    data: function () {
      return {
        formData: {},
        order: {},
        isEdit: false,
        isLoading: false,
        materialCodeList: []
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: orderKeys.customerName,
              label: '客户名称'
            },
            attrs: {
              default: this.$store.getters.oname,
              disabled: true,
            }
          },
          {
            type: 'date',
            formItem: {
              prop: orderKeys.deliveryTime,
              label: '订单交期',
              rules: [rules.required('请选择订单交期')]
            },
            attrs: {
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              default: dayjs().add(1, 'day').format('YYYY-MM-DD')
            }
          },
          {
            type: 'input',
            formItem: {
              prop: orderKeys.materialName,
              label: '材料名称',
              rules: [rules.required('请输入材料名称'), formRules.word_number]
            },
            attrs: {
              maxlength: 20,
              // keyMap: {
              //   label: orderKeys.platformMaterialName,
              //   value: orderKeys.platformMaterialName
              // },
              // options: this.materialCodeList
            }
          },
          {
            type: 'elCascader',
            formItem: {
              prop: 'fluteTypeAndLayers',
              label: '瓦楞楞型',
              rules: [rules.required('请选择瓦楞楞型')]
            },
            attrs: {
              props: {
                checkStrictly: false,
                // value: 'label',
                lazy: false,
                children: 'fluteType'
              },
              placeholder: '请选择瓦楞楞型',
              options: this.$enum.fluteTypeLayer
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: orderKeys.materialSize,
              label: '下料规格',
              rules: [rules.required('请输入下料规格'), this.$rule.materialSize_not_empty, this.$rule.materialSize_range]
            },
            attrs: {
              default: []
            },
            component: materialSizeInput,
            listeners: {
              input: () => {
                try {
                  this.$refs.form.$children[0].validateField(['longitudinalPressure']);
                } catch (e) {}
              }
            }
          },
          {
            type: 'input',
            formItem: {
              prop: orderKeys.orderAmount,
              label: '订单数量',
              rules: [rules.required('请输入订单数量'), this.$rule.orderAmount_range]
            },
            attrs: {
              placeholder: '请输入订单数量（片）',
              // reg: /^\d{0,5}$/
            }
          },
          {
            type: 'select',
            formItem: {
              prop: orderKeys.linePressingMethod,
              label: '压线方式',
              rules: [rules.required('压线方式不可为空')]
            },
            attrs: {
              keyMap: {
                value: 'label'
              },
              options: this.$enum.linePressingWay._arr
            }
          },
          {
            type: 'input',
            formItem: {
              prop: orderKeys.transversePressure,
              label: '横压公式'
            },
            attrs: {
              maxlength: 100
            }
          },
          {
            type: 'custom',
            formItem: {
              prop: 'longitudinalPressure',
              label: '纵压公式',
              rules: [this.$rule.vformula_range, { validator: (rule, value, callback) => {
                let materialSize = this.formData[orderKeys.materialSize];
                if (value && value.length) {
                  let sum = value.reduce((sum, cur) => {
                    sum += Number(cur || 0);
                    return sum;
                  }, 0);
                  if (sum !== Number(materialSize && materialSize[1]) && sum !==0) {
                    callback(new Error('请输入正确的压线公式'));
                  } else {
                    callback();
                  }
                } else {
                  callback();
                }
              }}]
            },
            component: longitudinalPressureInput
          }
        ];
      },
      key_arr() {
        return this.formOptions.reduce((arr, obj)=>{
          arr.push(obj.formItem.prop);
          return arr;
        }, this.isEdit ? [orderKeys.productionNo] : []);
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
      confirm(cb) {
        this.$refs.form.validate(()=>{
          let message;
          let api;
          let post = {
            ...this.formData,
            ...(this.formData.customer || {}),
            customerId: this.$store.getters.ucompany,
            tileModel: this.formData.fluteTypeAndLayers[1],
            layers: this.formData.fluteTypeAndLayers[0],
            materialLength: Number(this.formData[orderKeys.materialSize][0]),
            materialWidth: Number(this.formData[orderKeys.materialSize][1]),
            // vformula: this.formData['longitudinalPressure'] && this.formData['longitudinalPressure'].filter(val=>!['', null, undefined].includes(val)).join('+')
            vformula: this.$method.getVFormula(this.formData, 'longitudinalPressure')
            // grouponProductName: this.formData['grouponProduct'][orderKeys.materialCode],
            // grouponProductCode: this.formData['grouponProduct']['id']
          };
          post[orderKeys.orderAmount] = Number(this.formData[orderKeys.orderAmount]);
          if (!this.isEdit) {
            message = '新增成功';
            api = orderManageService.add;
          } else {
            message = '编辑成功';
            api = orderManageService.edit;
          }
          this.dj_api_extend(api, post).then(()=>{
            this.$message(message);
            this.$emit('success');
            this.close();
          }).finally(cb);
        }, cb);
      },
      getOrderDetail(orderId) {
        this.isLoading = true;
        this.dj_api_extend(orderManageService.getOrderById, {producOrderNumber: orderId}).then(res=>{
          let _res = this.$method.cloneData(this.key_arr, {}, res);
          _res['longitudinalPressure'] = res[orderKeys.longitudinalPressure] && res[orderKeys.longitudinalPressure].split('+') || [];
          _res[orderKeys.materialSize] = [res[orderKeys.materialLength], res[orderKeys.materialWidth]];
          _res['fluteTypeAndLayers'] = [res[orderKeys.layer] + '', res[orderKeys.fluteType]];
          _res[orderKeys.deliveryTime] = dayjs(res[orderKeys.deliveryTime]).format('YYYY-MM-DD');
          this.formData = _res;
          this.$nextTick(()=>{
            this.$refs.form.validate();
          });
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      open(order) {
        this.$refs.dialog.open();
        if (order) {
          this.isEdit = true;
          this.getOrderDetail(order[orderKeys.productionNo]);
        }
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    }
  };
</script>
