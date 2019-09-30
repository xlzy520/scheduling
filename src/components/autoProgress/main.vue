<template>
    <div :class="className">
      <div class="nprogress">
        <div class="bar" role="bar"><div class="peg"></div></div>
      </div>
    </div>
</template>
<script>
  import NProgress from './nprogress-r';
  export default {
    name: 'autoProgress',
    props: {
      speed: {
        type: Number,
        default: 200
      },
      trickleSpeed: {
        type: Number,
        default: 800
      }
    },
    data: function () {
      return {
        className: `auto-progress_${new Date().getTime()}`,
        np: new NProgress()
      };
    },
    created() {
      this.np.configure({
        parent: `.${this.className}`,
        speed: this.speed,
        trickleSpeed: this.trickleSpeed
      });
    },
    methods: {
      start() {
        this.emitNP('start');
      },
      done(cb) {
        this.emitNP('done');
        setTimeout(cb, this.speed + 100);
      },
      emitNP(method, ...argv) {
        this.np[method](...argv);
      }
    }
  };
</script>
<style lang="less" scoped>
  .nprogress {
    position: relative;
    height: 6px;
    overflow: hidden;
    background: #ebeef5;
    border-radius: 3px;
    .bar {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #3654ea;
    }
  }
</style>
