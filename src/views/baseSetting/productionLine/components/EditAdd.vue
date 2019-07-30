<template>
  <dj-dialog ref="dialog" @close="close" @confirm="confirm" :title="dialogTypeIsAdd?'新增生产线': '编辑生产线'">
    <div class="production-line-dialog">
      <h4>基础参数</h4>
      <dj-form ref="form" :form-data="prodLineData.jccs" :form-options="jccsFormOptions" :column-num="4"></dj-form>
      <h4>纵切机</h4>
      <dj-form ref="form" :form-data="prodLineData.zqj" :form-options="zqjFormOptions" :column-num="4"></dj-form>
      <h4>分线机、横切机、吊篮</h4>
      <dj-form ref="form" :form-data="prodLineData.fxj" :form-options="fxjFormOptions"
               :column-num="4" :col-rule="()=> 6"></dj-form>
      <h4>门幅范围</h4>
      <div class="optional">
        <div class="optional-label">可选原纸</div>
        <div class="optional-area" @click="selectPaper($event)">
          <div class="optional-area-item" :class="prodLineData.jccs.menfu.includes(code)?'selected': ''"
               v-for="code in optionalPaper" :key="code">{{code}}</div>
        </div>
      </div>
    </div>
  </dj-dialog>
</template>

<script>
export default {
  name: 'EditAdd',
  props: {
    dialogTypeIsAdd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      prodLineData: {
        jccs: {},
        zqj: {},
        fxj: {},
        czjl: [],
      },
      jccsFormOptions: [
        {
          type: 'input',
          formItem: {
            prop: 'name',
            label: '生产线名称',
            rules: [
              djForm.rules.required('生产线名称不能为空'),
              {pattern: /^\w+$/g, message: '只可输入字母、数字'},
            ],
          }
        },
        {
          type: 'select',
          formItem: {
            prop: 'lengxing',
            label: '常用楞型',
            rules: [
              {pattern: /^\w+$/g, message: '只可输入字母、数字'},
            ],
          },
          attrs: {
            key: 'multiple',
            type: 'multiple',
            options: [{
              label: '普通瓦楞',
              value: 'chu',
            }, {
              label: '高强瓦楞',
              value: 'gao',
            }, {
              label: '牛卡',
              value: 'da',
            }, {
              label: '再生',
              value: 'daa',
            }],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'chesu',
            label: '生产车速',
            rules: [djForm.rules.required('生产车速不能为空')],
          },
          attrs: {
            options: [{
              label: '普通瓦楞',
              value: 'chu',
            }, {
              label: '高强瓦楞',
              value: 'gao',
            }, {
              label: '牛卡',
              value: 'da',
            }, {
              label: '再生',
              value: 'daa',
            }],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'huanzhi',
            label: '换纸最小米数',
            rules: [
              djForm.rules.required('换纸最小米数不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'shoudan',
            label: '首单最小修边',
            rules: [
              djForm.rules.required('首单最小修边不能为空'),
              {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'weidan',
            label: '尾单最小米数',
            rules: [
              djForm.rules.required('尾单最小米数不能为空'),
            ],
          }
        },
      ],
      zqjFormOptions: [
        {
          type: 'radio',
          formItem: {
            prop: 'zongqiejishu',
            label: '纵切机数',
            rules: [
              djForm.rules.required('请选择相应的纵切机数'),
            ],
          },
          attrs: {
            options: [{
              label: '一台',
              value: '1'
            }, {
              label: '二台及以上',
              value: '2'
            }]
          },
        },
        {
          type: 'radio',
          formItem: {
            prop: 'chesu',
            label: '压轮排数',
            rules: [
              djForm.rules.required('请选择相应的压轮排数')
            ],
          },
          attrs: {
            options: [{
              label: '一台',
              value: '1'
            }, {
              label: '二台及以上',
              value: '2'
            }]
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'huanzhi',
            label: '单台压轮数',
            rules: [
              djForm.rules.required('单台压轮数不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'shoudan',
            label: '压轮最小间距(mm)',
            rules: [
              djForm.rules.required('压轮最小间距不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'weidan',
            label: '双机压订单',
            rules: [
              djForm.rules.required('双机压订单不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'menfu1',
            label: '单台纵切刀数',
            rules: [
              djForm.rules.required('单台纵切刀数不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'menfu2',
            label: '纵切刀间距',
            rules: [
              djForm.rules.required('纵切刀间距不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'menfu3',
            label: '换单排刀时间',
            rules: [
              djForm.rules.required('换单排刀时间不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
      ],
      fxjFormOptions: [
        {
          type: 'input',
          formItem: {
            prop: 'zongqiejishu',
            label: '分线机宽度',
            rules: [
              djForm.rules.required('原纸编号不能为空'),
              {pattern: /^\w+$/g, message: '只可输入字母、数字'},
            ],
          },
          attrs: {
            maxLength: 5,
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'chesu',
            label: '最小切长',
            rules: [
              djForm.rules.required('最小切长不能为空'),
              {pattern: /^\w+$/g, message: '只可输入字母、数字'},
            ],
          },
          attrs: {
            maxLength: 10,
          }
        },
        {
          type: 'select',
          formItem: {
            prop: 'huanzhi',
            label: '吊篮类型',
            rules: [djForm.rules.required('请选择相应的吊篮类型')],
          },
          attrs: {
            options: [{
              label: '普通瓦楞',
              value: 'chu',
            }, {
              label: '高强瓦楞',
              value: 'gao',
            }, {
              label: '牛卡',
              value: 'da',
            }, {
              label: '再生',
              value: 'daa',
            }],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'shoudan',
            label: '吊篮长度',
            rules: [
              djForm.rules.required('吊篮长度不能为空'),
              {type: 'number', message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'input',
          formItem: {
            prop: 'weidan',
            label: '最小叠单米数',
            rules: [
              djForm.rules.required('最小叠单米数不能为空'),
              {type: 'number', max: 9999, message: '只可输入数字', trigger: 'change'}
            ],
          },
        },
        {
          type: 'select',
          formItem: {
            prop: 'warehouseName',
            label: '仓库名称',
            rules: [
              djForm.rules.required('请选择相应的仓库名称'),
            ],
          },
          attrs: {
            options: [{
              label: '丽岙原纸仓库1',
              value: 'chu',
            }, {
              label: '丽岙原纸仓库2',
              value: 'gao',
            }, {
              label: '丽岙原纸仓库3',
              value: 'da',
            }],
          },
        },
        {
          type: 'select',
          formItem: {
            prop: 'warehouseAreaName',
            label: '库区名称',
            rules: [
              djForm.rules.required('请选择相应的库区名称'),
            ],
          },
          attrs: {
            options: [{
              label: '原纸1号仓库',
              value: 'chu',
            }, {
              label: '原纸2号仓库',
              value: 'gao',
            }, {
              label: '原纸3号仓库',
              value: 'da',
            }],
          },
        },
      ],
      optionalPaper: []
    };
  },
  methods: {
    confirm(data) {
      this.$refs.form.validate(()=>{
        productionLineService.list(data).then((res) => {
          this.close();
          const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
          this.$message(message, 'success');
        });
      });
    },
    close() {
      this.$refs.dialog.close();
      this.dialogVisible = false;
      this.$refs.form.resetFields();
    },
    selectPaper() {

    }
  },
  created() {
    let mock = [];
    for (let i = 0; i < 20; i++) {
      mock.push(800 + i * 100);
    }
    this.optionalPaper = mock;
  }
};
</script>

<style lang="less" scoped>

</style>
