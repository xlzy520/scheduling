<template>
  <dj-dialog ref="dialog" @close="close" width="400px" title="编辑" @confirm="confirm">
    <classify-form ref="form" :form-data="formData" :config="config"></classify-form>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
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
        lineId: undefined
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
                  keyMap: {
                    value: 'paperSize',
                    label: 'paperSize'
                  },
                  options: this.paperSize_arr
                },
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
                formItem: {
                  prop: this.$method.getOriginKey('paperSize', 'old'),
                  label: '原最优门幅'
                },
              },
              {
                type: 'select',
                formItem: {
                  prop: orderKeys.cutNumber,
                  label: '订单切数'
                },
                attrs: {
                  bindObject: true,
                  options: this.$enum.orderCutNumber
                }
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.cutNumber, 'old'),
                  label: '原订单切数'
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
      getPaperSizes(params) {
        let { data, lineId} = params;
        this.dj_api_extend(planArrangeService.getOptimalSize, {lineId, orderList: this.$method.getOrderList([data])}).then(res => {
          this.paperSize_arr = res.list || [];
        });
      },
      getOrderMsg(params) {
        this.dj_api_extend(planArrangeService.getOrder, params).then(res => {
          this.formData = res || {};
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
