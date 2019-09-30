<template>
  <single-page class="material-code">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        :loading="loading"
        :columns="tableColumns"
        :column-type="['index']"
        :total="pageTotal" height="100%"
        @update-data="getList"
      >
        <div slot="btn">
          <el-button type="primary" @click="add">新增</el-button>
        </div>
      </dj-table>
    </page-pane>
    <dj-dialog width="832px" v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增用料代码': '编辑用料代码'">
      <div class="material-code-dialog" v-loading="dialogLoading">
        <div class="optional">
          <div class="optional-label">可选原纸</div>
          <div class="optional-area">
            <div class="optional-area-item" v-for="code in optionalPaper"
                 @click="selectPaper(code)" :key="code.id">{{code.paperCode}}</div>
          </div>
        </div>
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </single-page>
</template>

<script>
  import materialCodeService from '../../api/service/materialCode';
  import paperCodeService from '../../api/service/paperCode';
  import loadingMixins from '../../mixins/loading';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";
  import McDjSelect from "./materialCodeSelect/McDjSelect.vue";

  export default {
    name: 'materialCode',
    components: {PagePane},
    mixins: [loadingMixins],
    data() {
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
        searchConfig: [
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '平台材料名称', key: 'platformMaterialCode', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '用料代码', prop: 'materialCode'},
          {label: '平台材料名称', prop: 'platformMaterialCode'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected', formatter: row => row.isEffected ? '启用' : '禁用'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="td-btn-group">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.isEffected ? '禁用' : '启用'}</a>
                  <span></span>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        formData: {
          materialCode: [],
          platformMaterialCode: null,
        },
        originFormData: {},
        formOptions: [
          {
            type: 'custom',
            formItem: {
              prop: 'materialCode',
              label: '用料代码',
              rules: [
                djForm.rules.required('请选择用料代码'),
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
        optionalPaper: [],
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        searchData: {}
      };
    },
    methods: {
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
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.getAllPaperCode();
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      getList(page) {
        this.loading = true;
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(materialCodeService.list, post).then((res) => {
          this.tableData = res.list || [];
          this.pageTotal = res.total;
        }).finally(() => {
          this.loading = false;
        });
      },
      changeStatus(row) {
        // 接口
        let post = {
          id: row.id,
          effected: row.isEffected ? 0 : 1,
        };
        let text = row.isEffected ? '禁用' : '启用';
        this.$confirm(`确定${text}该条内容吗？`, '', {
          type: 'warning',
          showClose: false,
        }).then(() => {
          this.dj_api_extend(materialCodeService.changeEffected, post).then(() => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dialogLoading = true;
        this.getAllPaperCode();
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
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      confirm() {
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
              this.close();
              this.$refs.table.updateData();
              this.$message(message, 'success');
              this.dialogLoading = false;
            }).catch(() => {
              this.dialogLoading = false;
            });
          }
        });
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.$refs.form.resetFields();
        this.formData = {
          materialCode: [],
          platformMaterialCode: null,
        };
      },
      getAllPaperCode() {
        return this.dj_api_extend(paperCodeService.getAllList).then(res=>{
          this.optionalPaper = res.list || [];
          this.$set(this.formOptions[0].attrs, 'options', this.optionalPaper);
        });
      }
    },
    mounted() {
      this.getAllPaperCode();
      this.$refs.search.search();
    },
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
          padding: 6px 14px;
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
