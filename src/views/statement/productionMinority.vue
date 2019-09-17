<template>
  <single-page class="productionMinority">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table ref="table"
                :data="tableData"
                height="100%"
                :total="total"
                :columns="tableColumns"
                :column-type="['index']"
                @update-data="getList">
        <div slot="btn">
          <el-button type="primary" @click="fileDownload">导出记录</el-button>
        </div>
      </dj-table>
    </page-pane>
  </single-page>
</template>
<script>
  import { orderKeys } from "../../utils/system/constant/dataKeys";
  import dayjs from 'dayjs';
  import productionMinorityService from '../../api/service/productionMinority';
  export default {
    name: 'productionMinority',
    data: function () {
      return {
        searchConfig: [
          {
            type: 'select',
            label: '订单类型',
            key: orderKeys.orderType,
            attrs: {
              options: this.$enum.orderType._arr.filter(obj=>![this.$enum.orderType['abnormal'].value, this.$enum.orderType['merge'].value, this.$enum.orderType['preparingMaterials'].value].includes(obj.value)),
              deafult: ''
            }
          }
        ],
        tableData: [],
        tableColumns: [
          {
            prop: orderKeys.productionNo,
            label: '生产编号',
            width: 150
          },
          {
            prop: orderKeys.customerName,
            label: '客户名称',
          },
          {
            prop: orderKeys.orderId,
            label: '订单编号',
            width: 150,
            formatter(a, b, cur) {
              return cur || '——'
            }
          },
          {
            prop: orderKeys.productName,
            label: '产品名称',
            width: 100,
            formatter(a, b, cur) {
              return cur || '——'
            }
          },
          {
            prop: 'produceMaterial',
            label: '用料代码',
            width: 100,
          },
          {
            prop: orderKeys.fluteType,
            label: '瓦楞楞型',
            width: 100,
            formatter(row, index, cur) {
              return row[orderKeys.layer] + cur;
            }
          },
          {
            prop: orderKeys.materialSize,
            label: '下料规格(cm)',
            width: 150,
            formatter(row) {
              return row[orderKeys.materialLength] + '*' + row[orderKeys.materialWidth];
            }
          },
          {
            prop: orderKeys.orderAmount,
            label: '订单数量'
          },
          {
            prop: 'packNumber',
            label: '打包数量'
          },
          {
            prop: 'few',
            label: '少数'
          },
          {
            prop: 'affluxTime',
            label: '汇入时间',
            width: 200,
            formatter(row, index, cur) {
              return dayjs(cur).format('YYYY-MM-DD HH:mm:ss');
            }
          },
          {
            prop: 'packTime',
            label: '打包时间',
            width: 200,
            formatter(row, index, cur) {
              return dayjs(cur).format('YYYY-MM-DD HH:mm:ss');
            }
          },
          {
            prop: orderKeys.orderType,
            label: '订单类型',
            width: 100,
            formatter: (row, index, cur) => {
              let obj = this.$enum.orderType._swap[cur] || {};
              return obj.label || ''
            }
          }
        ],
        searchData: {},
        total: 0
      };
    },
    created() {
    },
    mounted() {
      this.$refs.search.search();
    },
    methods: {
      fileDownload() {
        this.dj_api_extend(productionMinorityService.exportFile, this.searchData).then(res=>{
          this.$method.fileDownload(res, `生产少数 ${dayjs().format('YYYYMMDD')}.xlsx`);
        });
      },
      getList(page) {
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(productionMinorityService.list, post).then(res=>{
          this.tableData = res.list || [];
          this.total = res.total || 0;
        });
        console.log(post);
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      refresh() {
        this.$refs.table.updateData();
      },
    }
  };
</script>
<style lang="less" scoped>

</style>
