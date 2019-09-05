<template>
  <single-page class="orderStatistics">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                :data="tableData"
                :loading="loading"
                height="100%"
                :defaultPageSize="pageSize"
                :total="pageTotal"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
        <div slot="btn">
          <div class="ext-data">
            <div class="ext-data-item">订单数：{{extData.orderAmount}}</div>
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
  export default {
    name: 'orderManage',
    data: function () {
      return {
        searchConfig: [
          {
            label: '分发日期', key: 'timeRange', type: 'date', attrs: {
              type: 'daterange',
              clearable: false,
              default: [dayjs().subtract(45, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
              beforeChange: (val) => {
                let _val = val ? [...val] : [];
                if (val[0] && val[1]) {
                  let towMonth = dayjs(val[0]).add(92, 'day');
                  if (towMonth.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], dayjs(towMonth).toDate()];
                  }
                  _val[0] = dayjs(_val[0]).format('YYYY-MM-DD');
                  _val[1] = dayjs(_val[1]).format('YYYY-MM-DD');
                }
                return _val;
              }
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
            component: {
              props: ['value', 'default'],
              render(h) {
                // 全选逻辑
                const input = (arr) => {
                  let realArr;
                  let lastValue = arr[arr.length - 1];
                  if (lastValue === 'all') {
                    realArr = [lastValue];
                  } else {
                    realArr = arr.filter(val => val !== 'all');
                  }
                  if (!arr.length) {
                    realArr = ['all'];
                  }
                  console.log(realArr);
                  this.$emit('input', realArr);
                };
                return (
                  <dj-select value={this.value}
                             collapse-tags
                             type="multiple"
                             default={this.default}
                             options={this.$enum.fluteType}
                             onInput={input}
                  ></dj-select>
                );
              }
            }
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
        pageSize: 30,
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
  @deep: ~'>>>';
  @{deep} .dj-table-container{
    .over-table .left-item {
      position: relative;
      bottom: -15px;
      margin-bottom: 0;
    }
  }

  .ext-data{
    font-size:16px;
    font-weight:600;
    color:rgba(48,49,51,1);
    line-height:22px;
    display: flex;
    &-item{
      height: 22px;
      line-height: 22px;
      font-family:PingFang SC Medium,sans-serif;
      margin-right: 96px;
    }
  }
</style>
