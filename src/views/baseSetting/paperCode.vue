<template>
  <single-page class="table-page paper-kind">
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
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增原纸代码': '编辑原纸代码'">
      <div class="paper-kind-dialog" v-loading="dialogLoading">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions" :column-num="1"></dj-form>
      </div>
    </dj-dialog>
  </single-page>
</template>

<script>
  import paperCodeService from '../../api/service/paperCode';
  import loadingMixins from '../../mixins/loading';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";

  const initFormData = {
    paperCode: '',
    paperType: '',
    paperGram: '',
  };
  export default {
    name: 'paperCode',
    components: {PagePane},
    mixins: [loadingMixins],
    data() {
      return {
        tableData: [],
        tableColumns: [
          {label: '原纸代码', prop: 'paperCode'},
          {label: '原纸类型', prop: 'paperTypeName'},
          {label: '克重（g）', prop: 'paperGram'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.isEffected ? '' : 'status-off'}>
                  {row.isEffected ? '已启用' : '已禁用'}
                </div>
              );
            }
          },
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
        ],
        formData: initFormData,
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'paperCode',
              label: '原纸代码',
              rules: [
                djForm.rules.required('请输入原纸代码'),
                formRules.word_number
              ],
            },
            attrs: {
              maxLength: 10,
            },
            listeners: {
              'input': (val) => {
                this.formData.paperCode = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'paperType',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择原纸类型')],
            },
            attrs: {
              options: this.$enum.paperType._arr
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'paperGram',
              label: '克重',
              rules: [
                djForm.rules.required('请输入克重'),
                formRules.number,
                formRules.number5
                ],
            }
          },
        ],
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false
      };
    },
    methods: {
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      getList(page) {
        this.loading = true;
        this.dj_api_extend(paperCodeService.list, page).then((res) => {
          let list = res.list || [];
          list.forEach(obj=>{
            obj.paperTypeName = this.$enum.paperType._swap[obj.paperType] && this.$enum.paperType._swap[obj.paperType].label;
          });
          this.tableData = list;
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
          this.dj_api_extend(paperCodeService.changeEffected, post).then((res) => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dialogLoading = true;
        this.dj_api_extend(paperCodeService.getPaperCodeByid, {id: row.id}).then(res=>{
          this.formData = res;
        }).finally(() => {
          this.dialogLoading = false
        });
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      confirm() {
        this.$refs.form.validate(()=>{
          this.dialogLoading = true;
          let message;
          let api;
          let post = {
            paperCode: this.formData.paperCode,
            paperType: this.formData.paperType,
            paperGram: this.formData.paperGram,
          };
          if (this.dialogTypeIsAdd) {
            message = '新增成功';
            api = paperCodeService.add;
          } else {
            message = '编辑成功';
            api = paperCodeService.edit;
            post.id = this.formData.id;
          }
          this.dj_api_extend(api, post).then((res) => {
            this.close();
            this.$refs.table.updateData();
            this.$message(message, 'success');
            this.dialogLoading = true;
          }).catch(() => {
            this.dialogLoading = false;
          });
        });
      },
      close() {
        this.$refs.form.resetFields();
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.formData = initFormData;
      },
    },
    mounted() {
      this.$refs.table.changePage(1);
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .status-off{
    color: #909399;
  }

  .paper-kind-dialog {
    width: 400px;
  }
</style>
