<template>
  <div class="classifyForm">
    <template v-for="(item, index) in _config">
      <p v-if="item.title" class="bold">{{item.title}}</p>
      <dj-form ref="form" :class="{'text-form': hasSuffix[index]}"
               :formOptions="item.formOptions" v-bind="$attrs"></dj-form>
      <p v-if="(hasLine || item.hasLine) && index !== config.length - 1" class="line"></p>
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
          },(p)=>{
            obj = p;
            flag = false;
          })
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
    font-weight: bold;
    margin-bottom: 10px;
  }

  .line {
    border-top: 1px solid #ebeef5;
    margin-bottom: 24px;
    margin-top: 18px;
  }

  .dj-form.text-form {
    margin-bottom: 13px;
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
  }
</style>
