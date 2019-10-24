<template>
  <lock-dialog ref="dialog" @close="close" title="编辑" @confirm="confirm">
    <classify-form v-loading="isLoading" ref="form" :form-data="formData" :config="config" :column-num="2" has-line></classify-form>
    <!--<dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>-->
  </lock-dialog>
</template>
<script>
  import {orderKeys} from "../../../utils/system/constant/dataKeys";
  import planArrangeService from '../../../api/service/planArrange';
  export default {
    name: 'editDialog',
    data: function () {
      return {
        formData: {},
        paperSize_arr: [],
        lineId: undefined,
        isLoading: false,
      };
    },
    computed: {
      config() {
        return [
          {
            formOptions: [
              {
                // type: 'custom',
                type: 'select',
                formItem: {
                  prop: 'paperSize',
                  label: '最优门幅'
                },
                attrs: {
                  clearable: false,
                  keyMap: {
                    value: 'paperSize',
                    label: 'paperSize'
                  },
                  options: this.paperSize_arr
                },
                listeners: {
                  input: () => {
                    this.getCalcResult();
                  }
                }
                // component: {
                //   props: ['options', 'value'],
                //   render() {
                //     let _options = this.options.map(obj=>{
                //       return (
                //         <el-option value={obj['paperSize']}>
                //           <span>{obj['paperSize']}</span> |&nbsp;
                //           <span class="frr">修边率 {obj[orderKeys.trimRate]}</span>
                //         </el-option>
                //       );
                //     });
                //     return (
                //       <el-select value={this.value} on-input={(val)=>this.$emit('input', val)}>
                //         {_options}
                //       </el-select>
                //     );
                //   }
                // }
              },
              {
                type: 'select',
                formItem: {
                  prop: orderKeys.cutNumber,
                  label: '订单切数'
                },
                attrs: {
                  clearable: false,
                  bindObject: true,
                  options: this.$enum.orderCutNumber
                },
                listeners: {
                  input: () => {
                    this.getCalcResult();
                  }
                }
              },
            ]
          },
          {
            title: '原订单信息',
            formOptions: [
              {
                formItem: {
                  prop: this.$method.getOriginKey('paperSize', 'old'),
                  label: '最优门幅'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.cutNumber, 'old'),
                  label: '订单切数'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.materialSize, 'old'),
                  label: '下料规格'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.orderMetres, 'old'),
                  label: '订单米数'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.trimRate, 'old'),
                  label: '修边率'
                },
              },
            ]
          },
          {
            title: '计算结果',
            formOptions: [
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.orderMetres, 'calc'),
                  label: '订单米数'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.trimRate, 'calc'),
                  label: '修边率'
                },
              },
            ]
          }
        ];
      }
    },
    created() {
    },
    methods: {
      clearCalcResult() {
        let _res = {};
        _res[this.$method.getOriginKey(orderKeys.orderMetres, 'calc')] = '';
        _res[this.$method.getOriginKey(orderKeys.trimRate, 'calc')] = '';
        Object.assign(this.formData, _res);
      },
      getCalcResult() {
        if (this.formData[orderKeys.productionNo]) {
          let post = {
            ...this.$method.getFormDataChangeableValue(this.formData, this.config),
            lineId: this.lineId,
            order: this.formData[orderKeys.productionNo]
          };
          this.clearCalcResult();
          this.dj_api_extend(planArrangeService.getCalcResult, post).then(res => {
            let _res = {};
            _res[this.$method.getOriginKey(orderKeys.orderMetres, 'calc')] = res['length'];
            _res[this.$method.getOriginKey(orderKeys.trimRate, 'calc')] = res[orderKeys.trimRate];
            Object.assign(this.formData, _res);
          });
        }
      },
      getPaperSizes(params) {
        let { data, lineId} = params;
        this.dj_api_extend(planArrangeService.getOptimalSize, {lineId, orderList: this.$method.getOrderList([data])}).then(res => {
          this.paperSize_arr = res.list || [];
        });
      },
      getOrderMsg(params) {
        this.isLoading = true;
        this.dj_api_extend(planArrangeService.getOrder, params).then(res => {
          res[this.$method.getOriginKey(orderKeys.orderMetres, 'calc')] = res[orderKeys.orderMetres];
          res[this.$method.getOriginKey(orderKeys.trimRate, 'calc')] = res[orderKeys.trimRate];
          this.formData = res || {};
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      confirm(cb) {
        this.$refs.form.validate(() => {
          let post = {
            ...this.$method.getFormDataChangeableValue(this.formData, this.config),
            lineId: this.lineId,
            order: this.formData[orderKeys.productionNo]
          };
          this.dj_api_extend(planArrangeService.editOrder, post).then(() => {
            this.$emit('success');
            this.$message('编辑成功');
            this.close();
          }).finally(() => {
            cb && cb();
          });
        }, cb);
      },
      open(param = {}) {
        this.$refs.dialog.open();
        this.lineId = param.lineId;
        this.getOrderMsg(param.data);
        this.getPaperSizes(param);
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
  };
</script>
