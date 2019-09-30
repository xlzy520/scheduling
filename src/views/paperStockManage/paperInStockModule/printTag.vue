<template>
  <print-template ref="print">
    <print-page v-for="item in data">
      <div class="wrap">
        <p class="notice-text">原纸标签</p>
        <div class="notice-text clearfix">
          <p class="fl">原纸类型：{{$enum.paperType._swap[item[paperKeys.paperType]].label}}</p>
          <p class="fl">门幅：{{item[paperKeys.paperSize]}}</p>
        </div>
        <p>供应商：{{item[cylinderKeys.paperSupplierName]}}</p>
        <div class="clearfix">
          <canvas ref="canvas" width="152" height="152" class="qrcode fl"></canvas>
          <div class="fl">
            <p>纸筒编号：{{item[cylinderKeys.cylinderNo]}}</p>
            <p>原纸代码：{{item[paperKeys.paperCode]}}</p>
            <p>克重：{{item[paperKeys.paperGram]}}</p>
            <p class="notice-text">重量：{{item[cylinderKeys.weight]}}</p>
          </div>
        </div>
      </div>
    </print-page>
  </print-template>
</template>
<script>
  import printTemplate from '../../../components/print/printTemplate';
  import printPage from '../../../components/print/printPage';
  import {cylinderKeys, paperKeys} from "../../../utils/system/constant/dataKeys";
  import QRCode from 'qrcode';
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
        cylinderKeys,
        paperKeys
      };
    },
    created() {
    },
    methods: {
      print() {
        this.data.forEach((obj, index)=>{
          this.createQrc(this.$refs.canvas[index], obj[cylinderKeys.cylinderNo]);
        });
        this.$refs.print.browserPrint();
      },
      createQrc(canvas, data, callback) {
        if (!data) {
          this.$message('链接不能为空', 'error');
          return false;
        }
        QRCode.toCanvas(canvas, data, {
          width: 170,
          height: 170,
          margin: 0
        }, (error) => {
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
  .wrap {
    width: 80%;
    height: 80%;
    /*height: 7.9cm;*/
    font-size: 20px;
    .notice-text {
      font-weight: bold;
      > p {
        width: 50%;
      }
    }
    p {
      margin-bottom: 21px;
    }
    canvas {
      margin-right: 18px;
    }
  }
</style>
