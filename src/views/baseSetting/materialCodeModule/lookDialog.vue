<template>
  <lock-dialog width="832px" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增用料代码': '编辑用料代码'">
    <div class="material-code-dialog" v-loading="dialogLoading">
      <div class="optional" >
        <div class="optional-label">可选原纸</div>
        <div class="optional-area">
          <div class="optional-area-item" v-for="code in optionalPaper"
               @click="selectPaper(code)" :key="code.id">{{code.paperCode}}</div>
        </div>
      </div>
      <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
    </div>
  </lock-dialog>
</template>
<script>
  import materialCodeService from '@/api/service/materialCode';
  import paperCodeService from '@/api/service/paperCode';
  import formRules from "../formRules";
  import McDjSelect from "../materialCodeModule/materialCodeSelect/McDjSelect.vue";
  export default {
    name: 'lookDialog',
    data () {
      const validateCode = (rule, selectArr, callback) => {
        const l = selectArr.length;
        if (l > 10) {
          callback(new Error('最多支持10个原纸组合'));
        } else if (l === 0) {
          callback(new Error('请选择用料代码'));
        } else {
          callback();
        }
      };
      return {
        dialogLoading: true,
        optionalPaper: [],
        originFormData: {},
        formData: {},
        formOptions: [
          {
            type: 'custom',
            formItem: {
              prop: 'materialCode',
              label: '用料代码',
              rules: [
                this.$rule.required('请选择用料代码'),
                { validator: validateCode, trigger: 'change' }
              ],
            },
            attrs: {
              class: 'code',
              default: [],
              type: 'multiple',
              bindObject: true,
              keyMap: {
                label: 'paperCode',
                value: 'id'
              },
            },
            component: McDjSelect
          },
          {
            type: 'input',
            formItem: {
              prop: 'platformMaterialCode',
              label: '平台材料名称',
              rules: [
                formRules.word_number
              ],
            },
            attrs: {
              maxlength: 20,
            },
          },
        ],
        dialogTypeIsAdd: false
      };
    },
    methods: {
      open(isAdd, row) {
        this.$refs.dialog.open();
        if (!isAdd) {
          this.dj_api_extend(materialCodeService.getMaterialByid, {id: row.id}).then(res=>{
            let data = {
              materialCode: (res.codeDetail || []).map(obj=>({id: obj.paperCodeId, _id: obj.id})),
              id: row.id
            };
            this.formData = {...(res || {}), ...data};
            this.originFormData = this.$method.deepClone(this.formData);
          }).finally(() => {
            this.dialogLoading = false;
          });
        }
        this.dialogTypeIsAdd = isAdd;
        this.getAllPaperCode();
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          if (!this.$method.equalsObjMessage(this.originFormData, this.formData)) {
            this.dialogLoading = true;
            let message;
            let api;
            let post = {
              paperMaterialDetails: this.formData.materialCode.map((obj, index)=>({
                seq: index + 1,
                paperCodeId: obj.id,
                id: obj._id
              })),
              platformMaterialCode: this.formData.platformMaterialCode || undefined,
            };
            if (this.dialogTypeIsAdd) {
              message = '新增成功';
              api = materialCodeService.add;
            } else {
              message = '编辑成功';
              api = materialCodeService.edit;
              post.id = this.formData.id;
            }
            this.dj_api_extend(api, post).then(() => {
              this.$message(message, 'success');
              this.dialogLoading = false;
              this.$emit('confirm');
              this.close();
            }).catch(() => {
              this.dialogLoading = false;
            }).finally(cb);
          } else {
            cb();
          }
        }, cb);
      },
      close() {
        this.$refs.form.resetFields();
        this.formData = {
          materialCode: [],
          platformMaterialCode: null,
        };
        this.$refs.dialog.close();
        this.$emit('close');
      },
      selectPaper(obj) {
        let { materialCode } = this.formData;
        if (materialCode.length === 10) {
          this.$message('最多支持10个原纸组合！', 'warning');
        } else {
          const materialCodeCache = this.$method.deepClone(materialCode);
          materialCodeCache.push(obj);
          this.formData.materialCode = materialCodeCache;
          this.$refs.form.validateField('materialCode');
        }
      },
      getAllPaperCode() {
        return this.dj_api_extend(paperCodeService.getAllList).then(res=>{
          this.optionalPaper = res.list || [];
          this.$set(this.formOptions[0].attrs, 'options', this.optionalPaper);
        }).finally(()=>{
          this.dialogLoading = false;
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  @deep: ~'>>>';
  .material-code-dialog {
    @{deep} .dj-form .el-form-item {
      .el-form-item__label {
        float: unset;
      }
      .el-select.code {
        width: 100%;
        pointer-events: none;
      }
      .el-form-item__content {
        width: 100%;
        margin-left: 0 !important;
      }
      .el-input__suffix {
        display: none;
      }
      .el-select__tags .el-tag .el-tag__close {
        pointer-events: visible;
      }
      .el-select__tags-text {
        pointer-events: none;
        user-select: none;
      }
    }
    @{deep} .optional {
      width: 100%;
      margin-bottom: 20px;
      &-label {
        padding: 0 12px 0 0;
        margin: 0;
        font-size: 14px;
        line-height: 34px;
        color: #606266;
      }
      &-area {
        display: flex;
        height: 192px;
        padding-bottom: 10px;
        overflow-y: scroll;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        flex-wrap: wrap;
        align-content: flex-start;
        &-item {
          height: 24px;
          min-width: 50px;
          padding: 0 11px;
          margin-top: 12px;
          margin-left: 10px;
          font-size: 12px;
          line-height: 24px;
          color: #606266;
          text-align: center;
          cursor: pointer;
          background: #f0f2f5;
          border-radius: 3px;
          user-select: none;
        }
      }
    }
  }
</style>
