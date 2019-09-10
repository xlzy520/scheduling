<template>
  <dj-dialog ref="dialog" @close="close" width="780px" title="编辑" @confirm="confirm">
    <classify-form ref="form" :formData="formData" :config="config" :column-num="2" :col-rule="colRule"></classify-form>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import {orderKeys} from "../../../utils/system/constant/dataKeys";
  import planArrangeService from '../../../api/service/planArrange'
  function getOrderList(arr) {
    return arr && arr.map(obj=>obj[orderKeys.productionNo]);
  }
  export default {
    name: 'editDialog',
    data: function () {
      return {
        // config: [
        //   {
        //     formOptions: [
        //       {
        //         type: 'select',
        //         formItem: {
        //           prop: 'paperSize',
        //           label: '最优门幅'
        //         },
        //         attrs: {
        //           options: this.paperSize_arr
        //         }
        //       },
        //       {
        //         type: 'select',
        //         formItem: {
        //           prop: orderKeys.cutNumber,
        //           label: '订单切数'
        //         },
        //         attrs: {
        //           bindObject: true,
        //           options: this.$enum.orderCutNumber
        //         }
        //       },
        //       {
        //         formItem: {
        //           prop: this.$method.getOriginKey('paperSize', 'old'),
        //           label: '原最优门幅'
        //         },
        //       },
        //       {
        //         formItem: {
        //           prop: this.$method.getOriginKey(orderKeys.cutNumber, 'old'),
        //           label: '原订单切数'
        //         },
        //       },
        //       {
        //         type: 'select',
        //         formItem: {
        //           prop: 'stack',
        //           label: '叠单标记'
        //         },
        //         attrs: {
        //           options: this.$enum.stackUpTip._arr
        //         }
        //       },
        //       {
        //         formItem: {
        //           prop: this.$method.getOriginKey(orderKeys.stackUp, 'old'),
        //           label: '原叠单标记'
        //         },
        //       },
        //     ]
        //   }
        // ],
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
                // type: 'select',
                type: 'custom',
                formItem: {
                  prop: 'paperSize',
                  label: '最优门幅'
                },
                attrs: {
                  keyMap: {
                    value: 'pageSize',
                    label: 'pageSize'
                  },
                  options: this.paperSize_arr
                },
                component: {
                  props: ['options', 'value'],
                  render() {
                    let _options = this.options.map(obj=>{
                      return (
                        <el-option value={obj['paperSize']}>
                          <span>{obj['paperSize']}</span> |&nbsp;
                          <span class="frr">修边率 {obj[orderKeys.trimRate]}</span>
                        </el-option>
                      );
                    });
                    return (
                      <el-select value={this.value} on-input={(val)=>this.$emit('input', val)}>
                        {_options}
                      </el-select>
                    )
                  }
                }
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
                  prop: this.$method.getOriginKey('paperSize', 'old'),
                  label: '原最优门幅'
                },
              },
              {
                formItem: {
                  prop: this.$method.getOriginKey(orderKeys.cutNumber, 'old'),
                  label: '原订单切数'
                },
              },
              {
                type: 'select',
                formItem: {
                  prop: 'stack',
                  label: '叠单标记'
                },
                attrs: {
                  options: this.$enum.stackUpTip._arr
                }
              },
              {
                formItem: {
                  prop: 're-' + this.$method.getOriginKey(orderKeys.stackUp, 'old'),
                  label: '原叠单标记'
                },
                computed: () => {
                  let obj = this.$enum.stackUpTip._swap[this.formData[this.$method.getOriginKey(orderKeys.stackUp, 'old')]] || {};
                  return obj.label || ''
                }
              },
            ]
          }
        ]
      }
    },
    created() {
    },
    methods: {
      colRule(item) {
        let prop = item.formItem.prop;
        if (prop === 'stack') {
          return 24;
        }
        return 12;
      },
      getPaperSizes(params) {
        let { data, lineId} = params;
        this.dj_api_extend(planArrangeService.getOptimalSize, {lineId, orderList: getOrderList([data])}).then(res => {
          this.paperSize_arr = res.list || [];
        });
      },
      getOrderMsg(params) {
        this.dj_api_extend(planArrangeService.getOrder, params).then(res => {
          // if (res[orderKeys.stackUp] === null) {
            res['stack'] = res[orderKeys.stackUp];
          // }
          this.formData = res || {};
        });
      },
      confirm(cb) {
        this.$refs.form.validate(() => {
          let post = {
            ...this.$method.cloneData(this.config.reduce((arr, opt)=>{
              if (opt.formOptions) {
                opt.formOptions.forEach(obj=>{
                  if (obj.type) {
                    arr.push(obj.formItem.prop);
                  }
                });
              }
              return arr;
            }, []), {}, this.formData),
            lineId: this.lineId,
            order: this.formData[orderKeys.productionNo]
          };
          this.dj_api_extend(planArrangeService.editOrder, post).then(() => {
            this.$emit('success');
            this.$message('编辑成功');
            this.close();
          }).finally(() => {
            cb && cb();
          })
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
