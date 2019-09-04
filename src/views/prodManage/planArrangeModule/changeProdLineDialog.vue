<template>
  <dj-dialog ref="dialog" @close="close" width="780px" title="更换生产线" @confirm="confirm">
    <div v-loading="isLoading">
      <dj-form ref="form" :formData="formData" :formOptions="formOptions" :column-num="2"></dj-form>
      <order-transfer v-model="checkedData" :data="allData" :titles="['选择生产订单', '待更换生产订单']">
        <div class="transfer-footer" slot="left-footer" slot-scope="{list, keyMap}">
          <span>选中订单米数：{{calcMeters(list, keyMap)}}米</span>
        </div>
        <div class="transfer-footer" slot="right-footer" slot-scope="{list, keyMap}">
          <span>待更换订单米数：{{calcMeters(list, keyMap)}}米</span>
        </div>
      </order-transfer>
    </div>
    <dj-button slot="footer-confirm" type="primary" @click="confirm">确 认</dj-button>
  </dj-dialog>
</template>
<script>
  import {djForm} from 'djweb';
  import productionLineService from '../../../api/service/productionLine';
  import planArrangeService from '../../../api/service/planArrange';
  import orderTransfer from './common/orderTransfer';
  const {rules} = djForm;
  export default {
    name: 'changeProdLineDialog',
    data: function () {
      return {
        allData: [],
        checkedData: [],
        formData: {},
        prodLine_arr: [],
        isEdit: false,
        isLoading: false
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'select',
            formItem: {
              prop: 'lineId',
              label: '生产线',
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback(new Error('请选择生产线'));
                    } else {
                      callback();
                    }
                  }
                }
              ]
            },
            attrs: {
              keyMap: {
                value: 'lineNum'
              },
              options: this.prodLine_arr
            }
          },
        ];
      }
    },
    created() {
      this.allData = [
        {
          label: '1',
          value: '1',
          paperSize: 1800,
          children: [
            {
              label: '1-1',
              value: '1-1',
              meters: 100,
              materialCode: 'HZ1X',
            },
            {
              label: '1-2',
              value: '1-2',
              meters: 200,
              materialCode: 'HZ1X',
            },
            {
              label: '1-3',
              value: '1-3',
              meters: 300,
              materialCode: 'HZ1X',
            }
          ]
        },
        {
          label: '2',
          value: '2',
          paperSize: 2000,
          children: [
            {
              label: '2-1',
              value: '2-1',
              meters: 50,
              materialCode: 'X3',
            },
            {
              label: '2-2',
              value: '2-2',
              meters: 123,
              materialCode: '1X',
            },
            {
              label: '2-3',
              value: '2-3',
              meters: 64,
              materialCode: 'Z1',
            }
          ]
        },
      ];
      this.getAllLine();
    },
    methods: {
      // renderContent(h, option) {
      //   console.log(option);
      //   return (
      //     <el-tree data={[option]}></el-tree>
      //   );
      // },
      calcMeters(arr = [], keyMap, sum = 0) {
        arr.forEach(obj=>{
          let children = obj[keyMap.childKey];
          if (Array.isArray(children) && children.length) {
            sum = this.calcMeters(children, keyMap, sum);
          } else {
            sum += Number(obj['meters']);
          }
        });
        return sum;
      },
      change() {},
      getAllLine() {
        this.dj_api_extend(productionLineService.list, {pageNo: 1, pageSize: 9999999}).then(res => {
          this.prodLine_arr = (res.list || []).map(obj => {
            obj.label = obj['lineNum'] + '号线';
            return obj;
          });
        });
      },
      confirm(cb) {
        console.log(this.checkedData);
        this.$refs.form.validate(()=>{
          let post ={};
          this.dj_api_extend(planArrangeService.changeProdLine, post).then(res=>{
            this.$message('更换成功');
            this.$emit('success');
            this.close();
          }).finally(cb);
        }, cb);
      },
      open(param) {
        this.$refs.dialog.open();
        this.isLoading = true;
        this.dj_api_extend(planArrangeService.integratedMaterial, param).then(res=>{
          this.allData = res.list || [];
        }).finally(()=>{
          this.isLoading = false;
        });
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      }
    },
    components: {orderTransfer}
  };
</script>
<style lang="less" scoped>
  .el-transfer {
    margin-left: 70px;
    /deep/ .el-transfer-panel {
      width: 282px;
    }
  }
  .transfer-footer {
    text-align: center;
    line-height: 41px;
    color: #303133;
  }
</style>
