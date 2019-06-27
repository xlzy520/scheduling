<template>
  <div class="paper-kind">
    <dj-search :config="searchConfig" @search="search"></dj-search>
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :column-type="['index']"
      :is-need-page="false">
      <div slot="btn">
        <el-button type="primary" @click="add">新增</el-button>
      </div>
    </dj-table>
  </div>
</template>

<script>
  import paperKindService from '../../api/service/paper-kind';
  export default {
    name: 'paperKind',
    data() {
      return {
        searchConfig: [
          {label: '原纸代码：', key: 'code', type: 'input'},
          {label: '门幅：', key: 'menfu', type: 'input', attrs: {type: 'number'}},
        ],
        tableData: [],
        tableColumns: [
          {label: '原纸代码', prop: 'code'},
          {label: '原纸类型', prop: 'type'},
          {label: '克重（g）', prop: 'kezhong'},
          {label: '门幅（mm）', prop: 'menfu'},
          {label: '仓库名称', prop: 'name'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {label: '启用状态', prop: 'status', formatter: row => row.status ? '启用' : '禁用'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}})=> {
              return (
                <div class="operation">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.status ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>修改</a>
                </div>
              );
            },
          },
        ],
      };
    },
    methods: {
      add() {

      },
      getTableData(data) {
        paperKindService.list(data).then((res) => {
          this.tableData = res.list;
        });
      },
      changeStatus(row) {
        row.status = !row.status;
      },
      edit() {

      },
      search(data) {
        this.getTableData(data);
      },
    },
    created() {
      this.getTableData();
    },
  };
</script>

<style lang="less" scoped>
  .paper-kind {
    .search {
      position: relative;
      height: 150px;
      overflow: hidden;
    }
  }
  /deep/ .operation{
    /deep/ a{
      margin-right: 15px;
      cursor: pointer;
    }
  }
</style>
