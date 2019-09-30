<template>
  <single-page class="table-page">
    <dj-search ref="search" :config="searchConfig" @search="getTableData"></dj-search>
    <page-pane>
      <dj-table
        :data="tableData"
        :columns="tableColumns"
        :column-type="['index']"
        :total="pageTotal"
        :loading="loading"
        height="100%"
        @update-data="pageChange"
      >
        <div slot="btn">
          <div class="ext-content">
            <el-button type="primary" @click="exportRecord" :loading="exportLoading">导出记录</el-button>
            <div class="ext-data">
              <div v-if="totalCount">总件数： {{totalCount}}</div>
              <div v-if="totalWeight">总重量： {{totalWeight}}</div>
            </div>
          </div>
        </div>
      </dj-table>
    </page-pane>

  </single-page>
</template>

<script>
  import paperTableService from '@/api/service/paperTable';
  import reportService from '@/api/service/report';
  import PagePane from "../../../components/page/pagePane";
  import dayjs from 'dayjs';
  export default {
    name: 'SimpleTableBox',
    components: {PagePane},
    props: {
      searchConfig: {
        type: Array,
        default: ()=>[]
      },
      tableColumns: {
        type: Array,
        default: ()=>[]
      },
      serviceUrl: {
        type: String
      },
      download: {
        type: Object
      },
    },
    data() {
      return {
        tableData: [],
        pageOptions: {
          pageNo: 1,
          pageSize: 15
        },
        pageTotal: 0,
        searchData: {},
        totalCount: '',
        totalWeight: '',
        loading: false,
        exportLoading: false
      };
    },
    methods: {
      exportRecord() {
        this.exportLoading = true;
        reportService.exportFile(this.download.url, {...this.searchData, ...this.pageOptions}).then(res=>{
          // const filename = this.download.filename + this.$method.timeFormat(new Date(), 'yyyy-MM-dd HH:mm:ss') + '.xlsx';
          this.$method.downloadExecl(res, this.download.filename);
        }).finally(()=>{
          this.exportLoading = false;
        });
      },
      getTableData(data) {
        this.loading = true;
        if (data && data.timeRange) {
          const _val = data.timeRange;
          data.startTime = _val[0];
          if (dayjs(_val[1]).isSame(dayjs(), 'day')) {
            _val[1] = dayjs().format('YYYY-MM-DD HH:mm:ss');
          } else {
            _val[1] = dayjs(_val[1]).format('YYYY-MM-DD') + ' 23:59:59';
          }
          data.endTime = _val[1];
        }
        this.searchData = data;
        paperTableService[this.serviceUrl]({
          ...data,
          ...this.pageOptions
        }).then((res) => {
          // 没有额外数据的在list里，有额外数据的在data.list里
          res.data = res.data ? res.data : {};
          this.tableData = res.list || res.data.list || [];
          this.pageTotal = res.total || res.data.total || 0;
          this.totalCount = res.totalCount;
          this.totalWeight = res.totalWeight;
        }).finally(() => {
          this.loading = false;
        });
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },
    },
    mounted() {
      this.$refs.search.search();
    },
  };
</script>

<style lang="less" scoped>
  .ext-content {
    padding-left: 15px;
  }
  .ext-data {
    display: flex;
    padding: 5px 0;
    font-family: "PingFang SC Regular", sans-serif;
    font-weight: bold;
    div {
      margin-right: 30px;
    }
  }
</style>
