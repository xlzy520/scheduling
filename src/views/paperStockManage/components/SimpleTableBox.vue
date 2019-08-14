<template>
  <single-page class="table-page">
    <dj-search ref="search" :config="searchConfig" @search="getTableData"></dj-search>
    <page-pane>
      <dj-table
        :data="tableData"
        :columns="tableColumns"
        :column-type="['index']"
        :total="pageTotal"
        @update-data="pageChange"
      >
        <div slot="btn">
          <div class="ext-content">
            <el-button type="primary" @click="exportRecord">导出记录</el-button>
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
  import axios from 'axios';
  import PagePane from "../../../components/page/pagePane";
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
          pageSize: 20
        },
        pageTotal: 0,
        searchData: {},
        totalCount: '',
        totalWeight: '',

      };
    },
    methods: {
      exportRecord() {
        // this.$method.fileDownload('/djsupplier/report/printSummary.do')
        axios.post(`/djsupplier/report/${this.download.url}.do`, {...this.searchData, ...this.pageOptions}, {
          responseType: 'blob'
        }).then(res=>{
          const dataUrl = URL.createObjectURL(res.data);
          const filename = this.download.filename + this.$method.timeFormat(new Date(), 'yyyy-MM-dd HH：mm：ss') + 'xlsx';
          const eleLink = document.createElement('a');
          eleLink.download = filename;
          eleLink.style.display = 'none';
          eleLink.href = dataUrl;
          document.body.appendChild(eleLink);
          eleLink.click();
          document.body.removeChild(eleLink);
        });
      },
      getTableData(data) {
        if (data && data.timeRange) {
          data.startTime = data.timeRange[0];
          data.endTime = data.timeRange[1];
        }
        this.searchData = data;
        paperTableService[this.serviceUrl]({
          ...data,
          ...this.pageOptions
        }).then((res) => {
          this.tableData = res.list || res.data.list;
          this.pageTotal = res.total || res.data.total;
          this.totalCount = res.totalCount;
          this.totalWeight = res.totalWeight;
        });
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },
    },
    mounted() {
      this.getTableData();
    },
  };
</script>

<style lang="less" scoped>
  .table-page {
    padding-top: 20px;
  }
  .ext-content{
    padding-left: 15px;
  }
  .ext-data{
    display: flex;
    padding: 5px 0;
    font-family: "PingFang SC Regular",sans-serif;
    font-weight: bold;
    div{
      margin-right: 30px;
    }
  }
</style>
