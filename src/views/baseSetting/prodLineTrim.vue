<template>
  <single-page class="plts">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        :data="tableData"
        ref="table"
        :columns="tableColumns"
        is-cache-columns
        :cache-columns-name="$store.getters.uids+'-'+ $route.name"
        :loading="loading"
        :column-type="['index']"
        :total="pageTotal"
        height="100%"
        @update-data="getTableData"
      >
        <div slot="btn">
          <el-button type="primary" @click="open(true)">新增</el-button>
        </div>
      </dj-table>
    </page-pane>

    <look-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm" @showAllLine="showAllLine"
                 :line="lineOptions"></look-dialog>
  </single-page>
</template>

<script>
  import lookDialog from "./paperLineTrimModule/lookDialog";
  import prodLineTrimService from '../../api/service/productionLineTrim';
  import prodLineService from '../.././api/service/productionLine';
  import loadingMixins from '../../mixins/loading';
  import PagePane from "../../components/page/pagePane";
  const cengshuOption = [
    {label: '二层', value: 2},
    {label: '三层', value: 3},
    {label: '四层', value: 4},
    {label: '五层', value: 5},
    {label: '六层', value: 6},
    {label: '七层', value: 7},
  ];
  export default {
    name: 'productionLineTrim',
    components: {PagePane, lookDialog},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '生产线', key: 'lineId', type: 'select', attrs: {options: []}, listeners: {
              'visible-change': (val)=>{
                if (val) {
                  this.showAllLine();
                }
              }
            }},
          {label: '层数', key: 'layer', type: 'select', attrs: {options: cengshuOption}},
          {label: '修边', key: 'wasteSize', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '生产线', prop: 'lineNum', formatter: row=> row.lineNum + '号线'},
          {label: '层数', prop: 'layer', formatter: row=> {
              const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
              return chnNumChar[row.layer] + '层';
            }},
          {label: '修边(mm)', prop: 'wasteSize'},
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
                  <a onClick={() => this.open(false, row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        pageTotal: 0,
        dialogVisible: false,
        lineOptions: []
      };
    },
    methods: {
      open(isAdd, row) {
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open(isAdd, row);
        });
      },
      getTableData(data) {
        this.loading = true;
        prodLineTrimService.list({
          ...data,
          ...this.searchData,
        }).then((res) => {
          this.tableData = res.list;
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
          return this.dj_api_extend(prodLineTrimService.changeEffected, post).then(() => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      confirm() {
        this.$refs.search.search();
      },
      close() {
        this.dialogVisible = false;
      },
      showAllLine () {
        prodLineService.showAllLine().then(res=>{
          const lineOptions = res.list.map(v=>{
            return {
              label: v.lineNum + '号线',
              value: v.id
            };
          });
          this.lineOptions = lineOptions;
          this.searchConfig[0].attrs.options = lineOptions;
        });
      },
    },
    mounted() {
      this.showAllLine();
      this.confirm();
    },
  };
</script>

<style lang="less" scoped>

</style>
