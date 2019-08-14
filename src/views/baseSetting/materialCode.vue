<template>
  <single-page class="material-code">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
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
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增用料代码': '编辑用料代码'">
      <div class="material-code-dialog">
        <div class="optional">
          <div class="optional-label">可选原纸</div>
          <div class="optional-area">
            <div class="optional-area-item" v-for="code in optionalPaper" @click="selectPaper(code)" :key="code.id">{{code.paperCode}}</div>
          </div>
        </div>
        <dj-form ref="form" :form-data="formData" :form-options="formOptions" labelWidth="125px"></dj-form>
      </div>
    </dj-dialog>
  </single-page>
</template>

<script>
  import materialCodeService from '../../api/service/materialCode';
  import paperCodeService from '../../api/service/paperCode';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";

  const validateCode = (rule, selectArr, callback) => {
    if (selectArr.length === 10) {
      callback(new Error('最多支持10个原纸组合!'));
    } else {
      callback();
    }
  };
  export default {
    name: 'materialCode',
    components: {PagePane},
    data() {
      return {
        searchConfig: [
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '平台材料名称', key: 'platformMaterialCode', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '用料代码', prop: 'materialCode'},
          {label: '平台材料名称', prop: 'platformMaterialCode'},
          {label: '操作人', prop: 'supplierId'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected', formatter: row => row.isEffected ? '启用' : '禁用'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.isEffected ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        formData: {
          materialCode: [],
          platformMaterialCode: '',
        },
        formOptions: [
          {
            type: 'select',
            formItem: {
              prop: 'materialCode',
              label: '用料代码',
              rules: [
                djForm.rules.required('请选择用料代码'),
                { validator: validateCode, trigger: 'blur' }
                ],
            },
            attrs: {
              class: 'code',
              key: 'multiple',
              type: 'multiple',
              bindObject: true,
              keyMap: {
                label: 'paperCode',
                value: 'id'
              },
              options: [],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'platformMaterialCode',
              label: '平台材料名称',
              rules: [
                djForm.rules.required('请输入平台材料名称'),
                formRules.word_number
              ],
            },
            attrs: {
              maxLength: 20,
            },
            listeners: {
              'input': (val) => {
                this.formData.platformMaterialCode = val.toUpperCase();
              },
            },
          },
        ],
        optionalPaper: [],
        pageTotal: 100,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        searchData: {}
      };
    },
    methods: {
      selectPaper(obj) {
        const materialCode = this.formData.materialCode;
        if (materialCode.length > 10) {
          this.$message('最多支持10个原纸组合！', 'warning');
        } else {
          this.formData.materialCode.push(obj);
        }
      },
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      getList(page) {
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(materialCodeService.list, post).then((res) => {
          this.tableData = res.list || [];
          this.pageTotal = res.total;
        });
      },
      changeStatus(row) {
        // 接口
        let post = {
          id: row.id,
          effected: row.isEffected ? 0 : 1,
        };
        if (row.isEffected) {
          this.$confirm('确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.dj_api_extend(materialCodeService.changeEffected, post).then((res) => {
              this.$message('禁用成功', 'success');
              row.isEffected = !row.isEffected;
            });
          });
        } else {
          this.dj_api_extend(materialCodeService.changeEffected, post).then((res) => {
            this.$message('禁用成功', 'success');
            row.isEffected = !row.isEffected;
          });
        }
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dj_api_extend(materialCodeService.getMaterialByid, {id: row.id}).then(res=>{
          let data = {
            materialCode: (res.codeDetail || []).map(obj=>({id: obj.paperCodeId, _id: obj.id})),
            id: row.id
          };
          this.formData = {...(res || {}), ...data};
        });
        // this.formData = this.$method.deepClone(row);
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
          let message;
          let api;
          let post = {
            paperMaterialDetails: this.formData.materialCode.map((obj, index)=>({
              seq: index + 1,
              paperCodeId: obj.id,
              id: obj._id
            })),
            platformMaterialCode: this.formData.platformMaterialCode,
          };
          if (this.dialogTypeIsAdd) {
            message = '新增成功';
            api = materialCodeService.add;
          } else {
            message = '编辑成功';
            api = materialCodeService.edit;
            post.id = this.formData.id;
          }
          this.dj_api_extend(api, post).then((res) => {
            this.close();
            this.$refs.table.updateData();
            this.$message(message, 'success');
          });
        });
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.$refs.form.resetFields();
        this.formData = {
          materialCode: [],
          platformMaterialCode: '',
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
  @{deep} .operation {
    line-height: 1;
    a {
      padding: 2px 10px;
      cursor: pointer;
      &:not(:last-child){
        border-right: 1px solid #f0f2f5;
      }
    }
  }

  .material-code-dialog {
    width: 50vw;
    @{deep} .dj-form .el-form-item{
      .el-form-item__label{
        float: unset;
      }
      .el-select.code{
        width: 100%;
        pointer-events: none;
      }
      .el-form-item__content{
        width: 100%;
        margin-left: 0!important;
      }
      .el-input__suffix{
        display: none;
      }
      .el-select__tags .el-tag .el-tag__close{
        pointer-events: visible;
      }
      .el-select__tags-text{
        pointer-events: none;
      }
    }
    @{deep} .optional{
      width: 100%;
      min-height: 120px;
      margin-bottom: 20px;
      &-label{
        font-size: 14px;
        color: #606266;
        line-height: 34px;
        padding: 0 12px 0 0;
        margin: 0;
      }
      &-area{
        min-height: 80px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        border: 1px solid #eee;
        border-radius: 4px;
        &-item{
          text-align: center;
          font-size: 16px;
          min-width: 60px;
          height: 24px;
          line-height: 24px;
          padding: 5px 10px;
          margin: 5px;
          color: #747579;
          background: #F0F2F5;
          border-radius: 5px;
          cursor: pointer;
          user-select: none;
          &.selected{
            pointer-events: none;
            cursor: not-allowed;
            color: #45464a;
            background: #c2c3c7;
          }
        }
      }
    }
  }
</style>
