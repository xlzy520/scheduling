<template>
  <div class="classify-form">
    <template v-for="(item, index) in _config">
      <p v-if="item.title" class="bold">{{item.title}}</p>
      <dj-form ref="form" :class="{'text-form': hasSuffix[index]}"
               :form-options="item.formOptions" v-bind="$attrs"></dj-form>
      <p v-if="(hasLine || item.hasLine) && index !== config.length - 1" class="classify-form__line"></p>
    </template>
  </div>
</template>
<script>
  function judgeText(obj) {
    let { type, isText } = obj;
    return type === undefined || isText;
  }
  export default {
    name: 'classifyForm',
    props: {
      hasLine: {
        type: Boolean
      },
      config: {
        type: Array,
        default: () => []
      }
    },
    computed: {
      _config() {
        let _config = this.$method.deepClone(this.config);
        return _config.map(obj => {
          obj.formOptions.map(opt => {
            let { formItem } = opt;
            if (judgeText(opt) && !/[:：]$/.test(formItem.label)) {
              formItem.label += '：';
            }
          });
          return obj;
        });
      },
      hasSuffix() {
        return this.config.map(obj => {
          return obj.formOptions.every(option => judgeText(option));
        });
      }
    },
    data: function () {
      return {};
    },
    created() {
    },
    methods: {
      validate(successFn, errorFn) {
        let flag = true;
        let obj;
        this.$refs.form.forEach(com=>{
          com.validate((p)=>{
            obj = p;
          }, (p)=>{
            obj = p;
            flag = false;
          });
        });
        if (flag) {
          typeof successFn === 'function' && successFn(obj);
        } else {
          typeof errorFn === 'function' && errorFn(obj);
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .bold {
    line-height: 22px;
    margin-bottom: 16px;
    font-weight: bold;
  }
  .classify-form__line {
    margin-top: 4px;
    margin-bottom: 20px;
    border-top: 1px solid #ebeef5;
  }
  .classify-form {
    /deep/ .dj-form.text-form{
      .el-form-item{
        line-height: 22px;
        margin-bottom: 16px;
        margin-top: 0;
        &__label{
          line-height: 22px;
        }
        &__content{
          word-break: break-all;
          line-height: 22px;
        }
      }
    }
    .dj-form:not(:nth-last-of-type(1)) {
      /*margin-bottom: 13px;*/
    }
    .dj-form:not(.text-form) + .classify-form__line {
      margin-top: 4px
    }
  }
</style>
