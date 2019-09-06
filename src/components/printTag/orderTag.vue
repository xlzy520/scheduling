<template>
  <print-template ref="print" @end="end">
    <template v-if="isPrinting" v-for="(item, index) in data">
      <print-page v-for="i in getPrintNum(item)">
        <div class="wrap">
          <p class="font-subhead notice-text">{{getTitle(item)+'标签'}}<span v-if="judgeOrderType(item) === 'group'" class="font-default address">{{item[orderKeys.address]}}</span></p>
          <el-row>
            <el-col :span="13">
              <div v-for="col in getColLeft(item)" class="item-box clearfix">
                <label class="fl">{{col.label}}：</label>
                <span>{{col.formatter ? col.formatter(item, index, item[col.prop]) : item[col.prop]}}</span>
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
  const orderTypeMap = {
    'groupPurchase': 'group',
    'abnormal': 'carton',
    'preparingMaterials': 'store',
    'paperBoard': 'group',
    'paperBoardSupplement': 'group',
    'groupPurchaseSupplement': 'group',
    'paperBox': 'carton',
    'paperBoxSupplement': 'carton',
    'merge': 'merge'
  };
  const all_col_left =  [
    {
      prop: orderKeys.productionNo,
      label: '生产编号'
    },
    {
      prop: orderKeys.associatedOrders,
      label: '关联订单'
    },
    {
      prop: orderKeys.orderId,
      label: '订单编号'
    },
    {
      prop: orderKeys.productName,
      label: '产品名称'
    },
    {
      prop: orderKeys.materialCode,
      label: '用料代码'
    },
    {
      prop: orderKeys.fluteType,
      label: '瓦楞楞型'
    },
    {
      prop: orderKeys.materialSize,
      label: '下料规格',
      formatter: (row, index, cur) => {
        let length = row[orderKeys.materialLength];
        let width = row[orderKeys.materialWidth];
        return length && width ? `${length}*${width}` : '';
      }
    },
    {
      prop: orderKeys.productSize,
      label: '产品规格',
      formatter: (row, index, cur) => {
        let length = row[orderKeys.productLength];
        let width = row[orderKeys.productWidth];
        let height = row[orderKeys.productHeight];
        return length || width || height ? `${length}*${width}*${height}` : '';
      }
    },
    {
      prop: orderKeys.linePressingMethod,
      label: '压线方式'
    },
    {
      prop: orderKeys.longitudinalPressure,
      label: '纵压公式'
    },
    {
      prop: orderKeys.transversePressure,
      label: '横压公式'
    },
    {
      prop: orderKeys.cartonRemarks,
      label: '纸箱备注'
    },
    {
      prop: orderKeys.productAmount,
      label: '生产数量'
    },
    {
      prop: orderKeys.deliveryTime,
      label: '订单交期',
      formatter: (row, index, cur) => {
        return cur ? dayjs(cur).format('YYYY-MM-DD') : '';
      }
    },
  ];
  const all_col_right = [
    {
      prop: orderKeys.customerName,
      label: '客户名称'
    },
    {
      prop: orderKeys.consignee,
      label: '收货人'
    },
    {
      prop: orderKeys.deliveryTime,
      label: '订单交期',
      formatter: (row, index, cur) => {
        return cur ? dayjs(cur).format('YYYY-MM-DD') : '';
      }
    },
    {
      prop: orderKeys.orderAmount,
      label: '订单数量'
    },
    {
      prop: orderKeys.productAmount,
      label: '生产数量'
    },
    {
      prop: orderKeys.packageAmount,
      label: '打包数量',
      formatter(row, index, cur) {
        return cur ? cur + '片/包' : '';
      }
    }
  ];
  export default {
    name: 'printTag',
    props: {
      data: {
        type: Array,
        default: () => []
      }
    },
    data: function () {
      return {
        orderKeys,
        // titleMap: {
        //   group: '团购订单标签',
        //   carton: '纸箱订单标签',
        //   merge: '合并标签',
        //   store: '备料订单标签',
        // },
        isPrinting: false,
        col_left_map: this.getColLeftMap(),
        col_right_map: this.getColRightMap(),
      };
    },
    created() {
    },
    methods: {
      getTitle(item) {
        let obj = this.$enum.orderType._swap[item[orderKeys.orderType]] || {};
        return obj.label || '';
      },
      end() {
        this.isPrinting = false;
        this.$emit('end');
      },
      judgeOrderType(item = {}) {
        let obj = this.$enum.orderType._swap[item[orderKeys.orderType]] || {};
        return orderTypeMap[obj.value];
      },
      getColLeft(item) {
        return this.col_left_map[this.judgeOrderType(item)];
      },
      getColRight(item) {
        return this.col_right_map[this.judgeOrderType(item)];
      },
      getColLeftMap() {
        let arr = all_col_left;
        let hiddenType = {
          group: [orderKeys.associatedOrders, orderKeys.cartonRemarks, orderKeys.productAmount, orderKeys.deliveryTime],
          carton: [orderKeys.productSize, orderKeys.orderId, orderKeys.productAmount, orderKeys.deliveryTime],
          merge: [orderKeys.orderId, orderKeys.cartonRemarks, orderKeys.productAmount, orderKeys.deliveryTime],
          store: [orderKeys.associatedOrders, orderKeys.orderId, orderKeys.productName, orderKeys.productSize,orderKeys.linePressingMethod, orderKeys.longitudinalPressure, orderKeys.transversePressure, orderKeys.cartonRemarks],
        };
        return Object.keys(hiddenType).reduce((map, key)=>{
          map[key] = arr.filter(obj=>!hiddenType[key].includes(obj.prop));
          return map;
        }, {});
      },
      getColRightMap() {
        let arr = all_col_right;
        let hiddenType = {
          group: [orderKeys.productAmount],
          carton: [orderKeys.packageAmount],
          merge: [orderKeys.customerName, orderKeys.consignee, orderKeys.packageAmount],
          store: arr.map(obj=>obj.prop),
        };
        return Object.keys(hiddenType).reduce((map, key)=>{
          map[key] = arr.filter(obj=>!hiddenType[key].includes(obj.prop));
          return map;
        }, {});
      },
      getPrintNum(row) {
        return Math.ceil(Number(row[orderKeys.orderAmount]) / 200);
      },
      print() {
        let map = {};
        this.data.forEach((obj, index)=>{
          obj[orderKeys.associatedOrders] = obj[orderKeys.orderId];
          let arr = [obj[orderKeys.productionNo], obj[orderKeys.orderId]];
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
    }
    .item-box {
      margin-bottom: 11px;
      label {
        width: 70px;
        text-align: right;
        line-height: @lineHeight;
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
  }
</style>
