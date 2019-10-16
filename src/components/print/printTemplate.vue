<template>
  <div class="print-template">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: 'printTemplate',
    props: {},
    data: function () {
      return {};
    },
    mounted() {
    },
    methods: {
      browserPrint() {
        let parent = this.$parent.$el;
        document.body.appendChild(parent);
        if (!!window.ActiveXObject || "ActiveXObject" in window) { //ie浏览器需要手动打开打印预览
          var object = document.createElement('object');
          try {
            object.id = 'wb';
            object.classid = 'clsid:8856F961-340A-11D0-A96B-00C04FD705A2';
            document.body.appendChild(object);
            window.wb.ExecWB(7, 1); //打印预览
          } catch (e) {
            window.print();
          }
          document.body.removeChild(object);
        } else { //火狐浏览器不允许调用打印预览
          window.print();//关键
        }
        document.body.removeChild(parent);
        this.$emit('end');//关键
      },
    },
    // watch: {
    //   printTemplateState(val) {
    //     if (val) {
    //       /**
    //        *之前使用的骚操作是显示这个打印界面占满全屏，盖住别的，只显示这个打印界面，然后打印是打印当前显示的页面， 结果谷歌能完美实现，但别的浏览器存在问题，遮不住，设置的白色背景会没用，所以遮不住。
    //        * 改成--->  将当前打印界面appendChild到body下，隐藏<app>这里使用的隐藏是占位隐藏visibility， 关闭打印标签后在appendChild回到原来的地方下
    //        * ie9-ie11， edge， 火狐， qq， 360， chrome
    //        */
    //       this.$nextTick(() => { //防止数据还没渲染就开始打印
    //         /**
    //          * 打印方法1，隐藏其他元素，只显示打印元素，在调用window.print()
    //          **/
    //         this.browserPrint();
    //       });
    //     }
    //   }
    // }
  };
</script>
<style lang="less">
  @page {
    /*margin: 0.4cm 0.48cm;*/
    margin: 0;
  }

  @media print {
    body {
      position: static !important;
      // todo min-width原本应该设成auto，但是设成auto订单标签打印内容太大，所以暂时设成1280px以缩小打印内容
      min-width: 1280px !important;
      min-height: auto !important;
      padding: 0 !important;
      //解决弹框打开状态打印时无法分页的问题
      overflow: visible !important;
      > * {
        //防止消息推送对打印的影响
        display: none !important;
      }
    }
    .print-template {
      position: absolute; // 不是absolute在chrome47版本上可能会有问题
      display: block !important;
    }
  }
</style>
<style lang="less" scoped>
  .print-template {
    display: none;
    width: 100%;
    height: 100%;
  }
</style>
