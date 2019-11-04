<template>
  <lock-dialog  width="780px" ref="dialog" @close="close" @confirm="confirm"
                :title="dialogTypeIsAdd?'新增原纸品种': '编辑原纸品种'">
    <div class="paper-kind-dialog" v-loading="dialogLoading">
      <dj-form ref="form" :form-data="formData" :form-options="formOptions" :column-num="2"></dj-form>
    </div>
  </lock-dialog>
</template>
<script>
  import paperKindService from '@/api/service/paperKind';
  import paperCodeService from '@/api/service/paperCode';
  import paperWarehouseService from '@/api/service/paperWarehouse';
  import formRules from "../formRules";

  export default {
    name: 'lookDialog',
    data () {
      return {
        dialogLoading: false,
        optionalPaper: [],
        formData: {},
        originFormData: {},
        dialogTypeIsAdd: false,
        warehouseList: [],
        warehouseAreaList: [],
        warehouseList_map: [],
        paperCodeList: [],
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: 'paperNumber',
              label: '原纸编号',
              rules: [
                this.$rule.required('请输入原纸编号'),
                formRules.word_number
              ],
            },
            attrs: {
              maxlength: 5,
            },
            listeners: {
              'input': (val) => {
                this.formData.paperNumber = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'paperCodeId',
              label: '原纸代码',
              rules: [
                this.$rule.required('请选择原纸代码'),
              ],
            },
            attrs: {
              keyMap: {
                label: 'paperCode',
                value: 'id'
              },
              options: this.paperCodeList
            },
            listeners: {
              'input': (val) => {
                this.getPaperCodeById(val);
              },
              'clear': ()=>{
                this.resetTypeAndGram();
              },
              'visible-change': (val)=>{
                if (val) {
                  this.getAllPaperCode();
                }
              }
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'paperType',
              label: '原纸类型',
              rules: [this.$rule.required('请选择原纸类型')],
            },
            attrs: {
              disabled: true,
              options: this.$enum.paperType._arr,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'paperGram',
              label: '克重',
              rules: [
                this.$rule.required('请输入该原纸最大克重'),
                formRules.number
              ],
            },
            attrs: {
              disabled: true,
              placeholder: '请输入该原纸最大克重',
              suffixIcon: "g"
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'paperSize',
              label: '门幅',
              rules: [
                this.$rule.required('请输入门幅'),
                formRules.number,
                formRules.number5
              ],
            },
            attrs: {
              suffixIcon: "mm"
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseId',
              label: '仓库名称',
              rules: [
                this.$rule.required('请选择仓库名称'),
              ],
            },
            attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseId'
              },
              options: this.warehouseList
            },
            listeners: {
              input: (val) => {
                this.formData.warehouseAreaId = undefined;
                if (!['', undefined, null].includes(val)) {
                  this.dj_api_extend(this.getWarehouseArea, val);
                }
              },
              'clear': ()=>{
                this.formData.warehouseAreaId = '';
                this.formOptions[this.formOptions.length - 1].attrs.options = [];
              },
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaId',
              label: '库区名称',
              rules: [
                this.$rule.required('请选择库区名称'),
              ],
            },
            attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseAreaId'
              },
              options: this.warehouseAreaList,
            },
          },
        ];
      }
    },
    methods: {
      open(isAdd, row) {
        this.getAllPaperCode();
        this.getWarehouse();
        this.$refs.dialog.open();
        if (!isAdd) {
          this.dialogLoading = true;
          this.getPaperKindById(row.id).then((res)=>{
            this.getWarehouseArea(res.warehouseId);
          }).finally(() => {
            this.dialogLoading = false;
          });
        }
        this.dialogTypeIsAdd = isAdd;
      },
      resetTypeAndGram() {
        this.formData.paperType = '';
        this.formData.paperGram = '';
      },
      getAllPaperCode() {
        return this.dj_api_extend(paperCodeService.getAllList).then(res=>{
          this.paperCodeList = res.list || [];
        });
      },
      getPaperCodeById(id) {
        if (id) {
          return this.dj_api_extend(paperCodeService.getPaperCodeByid, {id}).then(res=>{
            let { paperType, paperGram } = res || {};
            let _res = {
              paperType,
              paperGram
            };
            this.formData = {...this.formData, ..._res};
          });
        }
      },
      getPaperKindById(id) {
        return this.dj_api_extend(paperKindService.getPaperByid, {id}).then(res=>{
          if (this.paperCodeList.findIndex(v=>v.id === res.paperCodeId) === -1) {
            const { paperCodeId: id, paperCode, paperGram, paperType} = res;
            this.paperCodeList.push({id, paperCode, paperGram, paperType});
          }
          this.formData = res || {};
          this.originFormData = this.$method.deepClone(res);
          return res;
        });
      },
      getWarehouse() {
        return this.dj_api_extend(paperWarehouseService.getPaperWarehouse).then((res) => {
          this.warehouseList = res.list || [];
          this.warehouseList_map = this.warehouseList.reduce((map, obj) => {
            map[obj.warehouseId] = obj;
            return map;
          }, {});
        });
      },
      getWarehouseArea(id) {
        return this.dj_api_extend(paperWarehouseService.getAreaAllList, {warehouseId: id}).then((res) => {
          this.warehouseAreaList = res.list || [];
        });
      },
      confirm(cb) {
        this.$refs.form.validate(()=>{
          if (!this.$method.equalsObjMessage(this.originFormData, this.formData)) {
            this.dialogLoading = true;
            let message;
            let api;
            let post = this.$method.deepClone(this.formData);
            if (this.dialogTypeIsAdd) {
              message = '新增成功';
              api = paperKindService.add;
              delete post.id;
            } else {
              message = '编辑成功';
              api = paperKindService.edit;
            }
            post = this.$method.handleFormDataStartOrEndByZero(post, ['paperSize'], true);
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
        this.$refs.dialog.close();
        this.formData = {};
        this.warehouseAreaList = [];
        this.$emit('close');
      },
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
