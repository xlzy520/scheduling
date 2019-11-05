<template>
  <print-template ref="print" @end="end">
    <template v-if="isPrinting" v-for="(item, index) in data">
      <print-page v-for="i in getPrintNum(item)">
        <div :class="[judgeOrderType(item), 'wrap']">
          <p class="font-subhead notice-text">{{getTitle(item)+'标签'}}<span v-if="judgeOrderType(item) === 'group'" class="font-default address">{{item[orderKeys.address]}}</span></p>
          <el-row>
            <el-col :span="13">
              <div v-for="col in getColLeft(item)" class="item-box clearfix">
                <label class="fl">{{col.label}}：</label>
                <span v-if="col.label !== '关联订单'">{{col.formatter ? col.formatter(item, index, item[col.prop]) : item[col.prop]}}</span>
                <span v-else v-for="span in splitAssociatedOrders(item[col.prop])">{{span}}</span>
              </div>
            </el-col>
            <el-col :span="11">
              <div class="col-box">
                <div v-for="col in getColRight(item)" class="item-box clearfix">
                  <label class="fl">{{col.label}}：</label>
                  <span>{{col.formatter ? col.formatter(item, index, item[col.prop]) : item[col.prop]}}</span>
                </div>
              </div>
              <img v-if="judgeOrderType(item) !== 'store' " :src="item.qrurl">
            </el-col>
          </el-row>
          <div class="left-column"></div>
        </div>
      </print-page>
    </template>
  </print-template>
</template>
<script>
  import printTemplate from '../print/printTemplate';
  import printPage from '../print/printPage';
  import {orderKeys} from "../../utils/system/constant/dataKeys";
  import QRCode from 'qrcode';
  import dayjs from 'dayjs';
  const QROption = {
    width: 128,
    height: 128,
    margin: 0
  };
  export default {
    name: 'printTag',
    props: {
      data: {
        type: Array,
        default: () => []
      },
      extOrderKeys: {
        type: Object,
        default: ()=>({})
      }
    },
    computed: {
      orderKeys() {
        return Object.assign({}, orderKeys, this.extOrderKeys);
      }
    },
    data: function () {
      return {
        // titleMap: {
        //   group: '团购订单标签',
        //   carton: '纸箱订单标签',
        //   merge: '合并标签',
        //   store: '备料订单标签',
        // },
        orderTypeMap: {
          'groupPurchase': 'group',
          'abnormal': 'carton',
          'preparingMaterials': 'store',
          'paperBoard': 'group',
          'paperBoardSupplement': 'group',
          'groupPurchaseSupplement': 'group',
          'paperBox': 'carton',
          'paperBoxSupplement': 'carton',
          'merge': 'merge'
        },
        isPrinting: false,
      };
    },
    created() {
      this.all_col_left = [
        {
          prop: this.orderKeys.productionNo,
          label: '生产编号'
        },
        {
          prop: this.orderKeys.associatedOrders,
          label: '关联订单'
        },
        {
          prop: this.orderKeys.orderId,
          label: '订单编号'
        },
        {
          prop: this.orderKeys.productName,
          label: '产品名称'
        },
        // {
        //   prop: this.orderKeys.materialCode,
        //   label: '用料代码'
        // },
        {
          prop: this.orderKeys.fluteType,
          label: '瓦楞楞型',
          formatter: (row) => {
            let layer = row[this.orderKeys.layer] || '';
            let fluteType = row[this.orderKeys.fluteType] || '';
            return `${layer}${fluteType}`;
          }
        },
        {
          prop: this.orderKeys.materialSize,
          label: '下料规格',
          formatter: (row) => {
            let length = row[this.orderKeys.materialLength];
            let width = row[this.orderKeys.materialWidth];
            return length && width ? `${length}*${width}` : '';
          }
        },
        {
          prop: this.orderKeys.productSize,
          label: '产品规格',
          formatter: (row) => {
            let length = row[this.orderKeys.productLength];
            let width = row[this.orderKeys.productWidth];
            let height = row[this.orderKeys.productHeight];
            return length || width || height ? `${length}*${width}*${height}` : '';
          }
        },
        {
          prop: this.orderKeys.linePressingMethod,
          label: '压线方式'
        },
        {
          prop: this.orderKeys.longitudinalPressure,
          label: '纵压公式'
        },
        {
          prop: this.orderKeys.transversePressure,
          label: '横压公式'
        },
        {
          prop: this.orderKeys.cartonRemarks,
          label: '纸箱备注'
        },
        {
          prop: this.orderKeys.productAmount,
          label: '生产数量'
        },
        {
          prop: this.orderKeys.deliveryTime,
          label: '订单交期',
          formatter: (row, index, cur) => {
            return cur ? dayjs(cur).format('YYYY-MM-DD') : '';
          }
        },
      ];
      this.all_col_right = [
        {
          prop: this.orderKeys.customerName,
          label: '客户名称'
        },
        {
          prop: this.orderKeys.consignee,
          label: '收货人'
        },
        {
          prop: this.orderKeys.deliveryTime,
          label: '订单交期',
          formatter: (row, index, cur) => {
            return cur ? dayjs(cur).format('YYYY-MM-DD') : '';
          }
        },
        {
          prop: this.orderKeys.orderAmount,
          label: '订单数量'
        },
        {
          prop: this.orderKeys.productAmount,
          label: '生产数量'
        },
        {
          prop: this.orderKeys.packageAmount,
          label: '打包数量',
          formatter(row, index, cur) {
            return cur ? cur + '片/包' : '';
          }
        }
      ];
      this.col_left_map = this.getColLeftMap();
      this.col_right_map = this.getColRightMap();
    },
    methods: {
      splitAssociatedOrders(str) {
        if (str) {
          let arr = str.split(',');
          if (arr.length > 2) {
            return arr.slice(0, 2).concat(['. . .']);
          }
          return arr;
        }
        return [];
      },
      getTitle(item) {
        let obj = this.$enum.orderType._swap[item[this.orderKeys.orderType]] || {};
        return obj.label || '';
      },
      end() {
        this.isPrinting = false;
        this.$emit('end');
      },
      judgeOrderType(item = {}) {
        let obj = this.$enum.orderType._swap[item[this.orderKeys.orderType]] || {};
        return this.orderTypeMap[obj.value];
      },
      getColLeft(item) {
        return this.col_left_map[this.judgeOrderType(item)];
      },
      getColRight(item) {
        return this.col_right_map[this.judgeOrderType(item)];
      },
      getColLeftMap() {
        let arr = this.all_col_left;
        let hiddenType = {
          group: [this.orderKeys.associatedOrders, this.orderKeys.cartonRemarks, this.orderKeys.productAmount, this.orderKeys.deliveryTime],
          carton: [this.orderKeys.productSize, this.orderKeys.orderId, this.orderKeys.productAmount, this.orderKeys.deliveryTime],
          merge: [this.orderKeys.orderId, this.orderKeys.cartonRemarks, this.orderKeys.productAmount, this.orderKeys.deliveryTime],
          store: [this.orderKeys.associatedOrders, this.orderKeys.orderId, this.orderKeys.productName, this.orderKeys.productSize, this.orderKeys.linePressingMethod, this.orderKeys.longitudinalPressure, this.orderKeys.transversePressure, this.orderKeys.cartonRemarks],
        };
        return Object.keys(hiddenType).reduce((map, key)=>{
          map[key] = arr.filter(obj=>!hiddenType[key].includes(obj.prop));
          return map;
        }, {});
      },
      getColRightMap() {
        let arr = this.all_col_right;
        let hiddenType = {
          group: [this.orderKeys.productAmount],
          carton: [this.orderKeys.packageAmount],
          merge: [this.orderKeys.customerName, this.orderKeys.consignee, this.orderKeys.packageAmount],
          store: arr.map(obj=>obj.prop),
        };
        return Object.keys(hiddenType).reduce((map, key)=>{
          map[key] = arr.filter(obj=>!hiddenType[key].includes(obj.prop));
          return map;
        }, {});
      },
      getPrintNum(row) {
        return Math.ceil(Number(row[this.orderKeys.orderAmount]) / 200);
      },
      print() {
        let map = {};
        this.data.forEach((obj, index)=>{
          // obj[this.orderKeys.associatedOrders] = obj[this.orderKeys.orderId];
          let arr = [obj[this.orderKeys.productionNo], obj[this.orderKeys.orderId]];
          QRCode.toDataURL(arr.join('+'), QROption, (err, url) => {
            if (err) {
              console.log(err);
            } else {
              console.log('生成二维码成功');
              map[index] = url;
              this.$set(obj, 'qrurl', url);
              // obj.qrurl = url;
            }
          });
          // this.createQrc(this.$refs.canvas[index], obj[cylinderKeys.cylinderNo]);
        });
        this.isPrinting = true;
        setTimeout(()=>{
          this.$refs.print.browserPrint();
        });
      },
      createQrc(canvas, data, callback) {
        if (!data) {
          this.$message('链接不能为空', 'error');
          return false;
        }
        QRCode.toCanvas(canvas, data, QROption, (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log('生成二维码成功');
            callback && callback(canvas);
          }
        });
      }
    },
    components: {printTemplate, printPage}
  };
</script>
<style lang="less" scoped>
  @lineHeight: 19px;
  .wrap {
    width: 85%;
    height: 90%;
    font-size: 14px;
    .notice-text {
      font-weight: bold;
      .address {
        margin-left: 16px;
      }
    }
    .item-box {
      margin-bottom: 11px;
      label {
        width: 70px;
        line-height: @lineHeight;
        text-align: right;
      }
      span {
        display: block;
        margin-left: 70px;
        line-height: @lineHeight;
      }
    }
    .col-box {
      min-height: 180px;
    }
    &.store .item-box {
      margin-bottom: 27px;
    }
  }
</style>
