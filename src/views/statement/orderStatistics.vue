<template>
  <single-page class="orderStatistics" v-loading="loading">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                :data="tableData"
                height="100%"
                :total="pageTotal"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
        <div slot="btn">
          <div class="ext-data">
            <div class="ext-data-item">订单数: {{extData.orderAmount}}</div>
            <div class="ext-data-item">产品数量(片)：{{extData.productAmount}}</div>
            <div class="ext-data-item">产品面积(㎡)：{{extData.productArea}}</div>
          </div>
        </div>
      </dj-table>
    </page-pane>
  </single-page>
</template>
<script>
  import dayjs from 'dayjs';
  import orderStatisticsService from '../../api/service/orderManage';
  import fluteTypeSelect from '../../components/fluteTypeSelect';
  export default {
    name: 'orderManage',
    data: function () {
      return {
        searchConfig: [
          {
            label: '分发日期', key: 'timeRange', type: 'date', attrs: {
              default: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              beforeChange: (val) => {
                let _val = val ? [...val] : [];
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(91, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], dayjs(towMonth).toDate()];
                  }
                  _val[0] = dayjs(_val[0]).format('YYYY-MM-DD');
                  _val[1] = dayjs(_val[1]).format('YYYY-MM-DD');
                }
                return _val;
              },
              type: 'daterange',
              clearable: false
            }
          },
          {label: '材料名称', key: 'materialName', type: 'input'},
          {
            key: 'tileModels',
            label: '瓦楞楞型',
            type: 'custom',
            attrs: {
              default: ['all']
            },
            component: fluteTypeSelect
          },
        ],
        tableData: [],
        tableColumns: [
          {label: '材料名称', prop: 'materialName'},
          {label: '瓦楞楞型', prop: 'tileModel'},
          {label: '订单数', prop: 'orderAmount', sortable: true, sortMethod: (a, b)=>this.sort(a, b, 'orderAmount')},
          {label: '产品数量（片）', prop: 'productAmount', sortable: true, sortMethod: (a, b)=>this.sort(a, b, 'productAmount')},
          {label: '产品面积（m²）', prop: 'productArea', sortable: true, sortMethod: (a, b)=>this.sort(a, b, 'productArea')},
        ],
        searchData: {},
        extData: {
          orderAmount: '',
          productAmount: '',
          productArea: ''
        },
        pageTotal: 0,
        loading: false
      };
    },
    created() {
    },
    mounted() {
      this.$refs.search.search();
    },
    methods: {
      sort(a, b, prop) {
        if (a[prop] && b[prop]) {
          return a[prop] - b[prop];
        }
        console.log(a, b, prop);
      },
      getList(page) {
        this.loading = true;
        const { timeRange, ...restSearchData } = this.searchData;
        let post = {
          startTime: timeRange[0],
          endTime: timeRange[1],
          ...restSearchData,
          ...page
        };
        this.dj_api_extend(orderStatisticsService.orderStatistics, post).then(res => {
          const { orderStatisticList, total, ...restData } = res;
          this.tableData = orderStatisticList;
          this.extData = restData;
          this.pageTotal = Number(total);
        }).finally(()=>{
          this.loading = false;
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
    }
  };
</script>
<style lang="less" scoped>
  .ext-data {
    display: flex;
    font-family: PingFang SC Medium, sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    color: rgba(48, 49, 51, 1);
    &-item {
      margin-right: 20px;
    }
  }
</style>
