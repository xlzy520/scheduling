<template>
  <lock-dialog  :width="dialogWidth" ref="dialog" @close="close" @confirm="confirm" append-to-body
                :title="dialogTypeIsAdd?'新增生产线修边': '编辑生产线修边'">
    <div class="plts-dialog" :class="{'edit': !dialogTypeIsAdd}" v-loading="dialogLoading">
      <dj-form  v-for="(formOption, index) in formOptions"
                ref="form"
                :column-num="dialogTypeIsAdd?4: 1"
                @click.native="()=>deleteCurRow($event, index)"
                :col-rule="(item,ruleIndex)=>colRule(item,ruleIndex)"
                :form-data="formData[index]"
                :form-options="formOption"></dj-form>
      <el-button v-if="dialogTypeIsAdd" type="primary" class="add-btn"
                 @click.prevent="addLayer">添加生产线</el-button>
    </div>
  </lock-dialog>
</template>
<script>
  import prodLineTrimService from '@/api/service/productionLineTrim';
  import prodLineService from '@/api/service/productionLine';
  const cengshuOption = [
    {label: '二层', value: 2},
    {label: '三层', value: 3},
    {label: '四层', value: 4},
    {label: '五层', value: 5},
    {label: '六层', value: 6},
    {label: '七层', value: 7},
  ];
  export default {
    name: 'lookDialog',
    props: {
      line: {
        type: Array,
        default: ()=>{[];}
      }
    },
    data () {
      return {
        dialogLoading: false,
        dialogTypeIsAdd: false,
        formData: [{
          lineId: null,
          layer: null,
          wasteSize: null
        }],
        originFormData: {},
        formOptions: [],
        addLayerNum: 1
      };
    },
    computed: {
      baseOption() {
        return [
          {
            type: 'select',
            formItem: {
              prop: 'lineId',
              label: '生产线',
              rules: [this.$rule.required('请选择生产线')],
            },
            attrs: {
              options: this.line,
            },
            listeners: {
              'visible-change': (val)=>{
                if (val) {
                  this.$emit('showAllLine');
                  // this.showAllLine();
                }
              }
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'layer',
              label: '层数',
              rules: [
                this.$rule.required('请选择层数'),
              ],
            },
            attrs: {
              options: cengshuOption,
            },
          },
          {
            type: 'custom',
            formItem: {
              prop: 'wasteSize',
              label: '修边',
              rules: [
                this.$rule.required('请输入修边'),
                this.$rule.number,
                this.$rule.number5
              ],
            },
            attrs: {
              suffixIcon: "mm",
            },
            component: {
              props: ['value'],
              computed: {
                dialogTypeIsAdd: ()=> {
                  return this.dialogTypeIsAdd;
                }
              },
              render() {
                const input = (val) => {
                  this.$emit('input', val);
                };
                return (
                  <div class="waste-size-delete">
                    <dj-input value={this.value} onInput={input} suffixIcon='mm' label="修边"></dj-input>
                    {this.dialogTypeIsAdd ? (<i class="el-icon-delete"></i>) : null}
                  </div>
                );
              },
            }

          }
        ];
      },
      dialogWidth() {
        return this.dialogTypeIsAdd ? '1184px' : '400px';
      },
    },
    methods: {
      open(isAdd, row) {
        this.$refs.dialog.open();
        if (!isAdd) {
          this.dialogLoading = true;
          this.addLayerNum = 1;
          this.dj_api_extend(prodLineTrimService.getWasterLineByid, {
            id: row.id
          }).then(res=>{
            this.formData = [{
              id: row.id,
              lineId: res.id,
              layer: res.layer,
              wasteSize: res.wasteSize
            }];
            this.originFormData = [{
              id: row.id,
              lineId: res.id,
              layer: res.layer,
              wasteSize: res.wasteSize
            }];
            this.formOptions = [this.$method.deepClone(this.baseOption).splice(0, 3)];
            this.$nextTick(()=>{
              this.$refs.dialog.open();
            });
          }).catch(()=>{
            this.$message('获取信息失败', 'error');
          }).finally(() => {
            this.dialogLoading = false;
          });
        } else {
          this.formOptions = [this.baseOption];
        }
        this.dialogTypeIsAdd = isAdd;
      },
      addLayer() {
        this.addLayerNum += 1;
        this.formData.push({
          lineId: '',
          layer: '',
          wasteSize: ''
        });
        this.formOptions.push(this.baseOption);
        this.$nextTick(() => {
          const dialogContent = document.querySelector('.dj-dialog-content');
          const mainContent = document.querySelector('.plts-dialog');
          dialogContent.scrollTop = mainContent.scrollHeight;
        });
      },
      deleteCurRow(evt, index) {
        if (evt.target.className === 'el-icon-delete') {
          if (this.formOptions.length === 1) {
            this.$message('最后一条记录不可删除', 'warning');
            return false;
          }
          this.formOptions.splice(index, 1);
          this.formData.splice(index, 1);
          this.addLayerNum -= 1;
        }
      },
      colRule(item, index) {
        if (this.dialogTypeIsAdd) {
          if (index === 3) {
            return 0;
          }
          return 8;
        }
      },
      confirm(cb) {
        const formValidate = new Promise((resolve, reject) => {
          let allIsTrue = [];
          this.$refs.form.map((v, index)=>{
            v.validate((valid) => {
              if (valid) {
                allIsTrue.push(true);
              } else {
                allIsTrue.push(false);
              }
              if (index === this.addLayerNum - 1) {
                resolve(allIsTrue);
              }
            }, reject);
          });
        });
        formValidate.then(res=>{
          if (res.length === this.addLayerNum && res.every(v=>v)) {
            if (!this.$method.equalsObjMessage(this.originFormData, this.formData)) {
              let poor = this.formData.map(v=>v.layer.toString() + '&' + v.lineId);
              if (this.dialogTypeIsAdd) {
                let existData;
                for (let i = 0; i < poor.length; i++) {
                  if (poor.findIndex(v=>poor[i] === v) !== i) {
                    existData = poor[i].split('&');
                  }
                }
                if (existData && existData.length > 1) {
                  const [layer, lineId] = existData;
                  const lineNum = this.baseOption[0].attrs.options.find(v=>v.value === lineId).label;
                  this.$message(`已存在生产线：${lineNum}号线，层数：${layer}，该核对`, 'warning');
                  return false;
                }
              }
              const post = this.formData.map(v=>{
                return this.$method.handleFormDataStartOrEndByZero(v, ['wasteSize'], true);
              });
              const request = this.dialogTypeIsAdd
                ? prodLineTrimService.add(post)
                : prodLineTrimService.modifyWasterLineByid({
                  ...post[0],
                });
              this.dialogLoading = true;
              return request.then(() => {
                const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
                this.$message(message, 'success');
                this.$emit('confirm');
                this.close();
              }).finally(() => {
                this.dialogLoading = false;
              });
            }
          }
        }).finally(cb);
      },
      formReset() {
        this.formOptions = [this.baseOption];
        this.formData = [{
          lineId: null,
          layer: null,
          wasteSize: null
        }];
      },
      close() {
        this.addLayerNum = 1;
        this.$refs.dialog.close();
        this.formReset();
        this.$emit('close');
      },
    }
  };
</script>
<style lang="less" scoped>
  @deep: ~'>>>';
  .add-btn{
    margin-left: 121px;
  }
  @{deep} .waste-size-delete{
    display: flex;
    align-items: center;
    .el-icon-delete{
      margin-left: 10px;
    }
  }
  @{deep} .status-off {
    color: #909399;
  }
  .plts-dialog {
    height: 434px;
    margin-top: 4px;
    &.edit {
      height: auto;
      @{deep} .el-col-delete {
        .el-form-item__content {
          display: none;
        }
      }
    }
  }
  @media screen and (max-width: 1920px) and (min-width: 1601px){
    .plts-dialog {
      height: 734px;
    }
  }
</style>
