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
        <el-button type="primary" @click="open(true)">新增</el-button>
      </div>
    </dj-table>
    </page-pane>
    <look-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"></look-dialog>
  </single-page>
</template>

<script>
  import lookDialog from "./paperCodeModule/lookDialog";
  import paperCodeService from '../../api/service/paperCode';
  import loadingMixins from '../../mixins/loading';
  import PagePane from "../../components/page/pagePane";

  export default {
    name: 'paperCode',
    components: {PagePane,lookDialog},
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
                  <a onClick={() => this.open(false,row)}>编辑</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
        dialogVisible: false
      };
    },
    methods: {
      open(isAdd, row) {
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open(isAdd, row);
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
        this.$method.tipBox(`确定${text}该条内容吗？`, ()=>{
          return this.dj_api_extend(paperCodeService.changeEffected, post).then(() => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
        // this.$confirm(`确定${text}该条内容吗？`, '', {
        //   type: 'warning',
        //   showClose: false,
        // }).then(() => {
        //   this.dj_api_extend(paperCodeService.changeEffected, post).then(() => {
        //     this.$message(`${text}成功`, 'success');
        //     row.isEffected = !row.isEffected;
        //   });
        // });
      },
      close() {
        this.dialogVisible = false;
      },
      confirm() {
        this.$refs.table.changePage(1);
      }
    },
    mounted() {
      this.confirm();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .paper-kind{
    padding-top: 24px;
  }
  @{deep} .status-off {
    color: #909399;
  }
</style>
