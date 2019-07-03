<template>
  <div class="plts">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :column-type="['prodLineTrim']"
      :total="pageTotal"
      @update-data="pageChange"
    >
      <div slot="btn">
        <el-button type="primary" @click="add">新增</el-button>
      </div>
    </dj-table>
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增流水线修边': '编辑流水线修边'">
      <div class="plts-dialog" :class="{'edit': !dialogTypeIsAdd}">
        <dj-form  v-for="(formOption, index) in formOptions"
                  :key="formOption[0].formItem.prop"
                  :ref="'form'+prodLineTrim"
                  :form-data="formData[prodLineTrim]"
                  :form-options="formOption"
                  :inline="dialogTypeIsAdd"></dj-form>
        <div class="plts-dialog-aside" v-if="dialogTypeIsAdd">
          <a @click.prevent="addLayer">+添加层数修边</a>
        </div>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import productionLineTrimmingSettingsService from '../../api/service/productionLineTrimmingSettings';
  import {djForm} from 'djweb';
  const baseOption = [
    {
      type: 'select',
      formItem: {
        prop: 'line',
        label: '生产线:',
        rules: [djForm.rules.required('请选择相应的生产线')],
      },
      attrs: {
        options: [{
          label: '一层',
          value: 'chu',
        }, {
          label: '二层',
          value: 'gao',
        }, {
          label: '三层',
          value: 'da',
        }, {
          label: '四层',
          value: 'daa',
        }],
      },
    },
    {
      type: 'select',
      formItem: {
        prop: 'layer',
        label: '层数:',
        rules: [
          djForm.rules.required('请选择相应的层数'),
        ],
      },
      attrs: {
        options: [{
          label: '一层',
          value: 'chu',
        }, {
          label: '二层',
          value: 'gao',
        }, {
          label: '三层',
          value: 'da',
        }, {
          label: '四层',
          value: 'daa',
        }],
      },
    },
    {
      type: 'input',
      formItem: {
        prop: 'trimming',
        label: '修边:',
        rules: [
          {type: 'number', message: '只可输入数字', trigger: 'change'},
          {type: 'number', max: 9999, message: '不能超过9999', trigger: 'change'},
          djForm.rules.required('修边不能为空'),
        ],
      },
      attrs: {
        type: 'number'
      },
    },
  ];
  export default {
    name: 'productionLineTrimmingSettings',
    data() {
      return {
        searchConfig: [
          {label: '生产线：', key: 'line', type: 'input'},
          {label: '层数：', key: 'layer', type: 'input'},
          {label: '修边：', key: 'trimming', type: 'input', attrs: {type: 'number'}},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '生产线', prop: 'line'},
          {label: '层数', prop: 'layer'},
          {label: '修边', prop: 'trimming'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {label: '启用状态', prop: 'status', formatter: row => row.status ? '启用' : '禁用'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.changeStatus(row)}>
                    {row.status ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        formData: [{
          line: '',
          layer: '',
          trimming: ''
        }],
        formOptions: [
          [
            {
              type: 'select',
              formItem: {
                prop: 'line',
                label: '生产线:',
                rules: [djForm.rules.required('请选择相应的生产线')],
              },
              attrs: {
                options: [{
                  label: '一层',
                  value: 'chu',
                }, {
                  label: '二层',
                  value: 'gao',
                }, {
                  label: '三层',
                  value: 'da',
                }, {
                  label: '四层',
                  value: 'daa',
                }],
              },
            },
            {
              type: 'select',
              formItem: {
                prop: 'layer',
                label: '层数:',
                rules: [
                  djForm.rules.required('请选择相应的层数'),
                ],
              },
              attrs: {
                options: [{
                  label: '一层',
                  value: 'chu',
                }, {
                  label: '二层',
                  value: 'gao',
                }, {
                  label: '三层',
                  value: 'da',
                }, {
                  label: '四层',
                  value: 'daa',
                }],
              },
            },
            {
              type: 'input',
              formItem: {
                prop: 'trimming',
                label: '修边:',
                rules: [
                  {type: 'number', message: '只可输入数字', trigger: 'change'},
                  {type: 'number', max: 9999, message: '不能超过9999', trigger: 'change'},
                  djForm.rules.required('修边不能为空'),
                ],
              },
              attrs: {
                type: 'number'
              },
            },
          ],
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 100,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        addLayerNum: 1
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
      addLayer() {
        this.addLayerNum += 1;
        this.formData.push({
          line: '',
          layer: '',
          trimming: ''
        });
        this.formOptions.push(baseOption);
      },
      getTableData(data) {
        productionLineTrimmingSettingsService.list(data).then((res) => {
          this.tableData = res.list;
        });
      },
      changeStatus(row) {
        // 接口
        if (row.status) {
          this.$confirm('您确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            productionLineTrimmingSettingsService.list().then((res) => {
              this.$message('禁用成功', 'success');
              row.status = !row.status;
            });
          });
        } else {
          productionLineTrimmingSettingsService.list().then((res) => {
            this.$message('启用成功', 'success');
            row.status = !row.status;
          });
        }
      },
      formReset() {
        this.formOptions = [baseOption];
        this.formData = [{
          line: '',
          layer: '',
          trimming: ''
        }];
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.formOptions = [baseOption];
        this.formData = [row];
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(data) {
        this.getTableData({
          ...data,
          ...this.pageOptions,
        });
      },
      confirm(data) {
        let allValid = true;
        for (let i = 0; i < this.addLayerNum; i++) {
          this.$refs['form' + i][0].validate(valid=>{
            if (!valid) {
              allValid = false;
            }
          });
        }
        if (!allValid) {
          productionLineTrimmingSettingsService.list(data).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        }
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.formReset();
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },

    },
    created() {
      this.getTableData();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} a{
    cursor: pointer;
  }
  @{deep} .operation {
    a {
      margin-right: 15px;
    }
  }

  .plts-dialog {
    width: 70vw;
    &.edit{
      width: 30vw;
    }
    @{deep} .dj-form .el-form-item{
      width: auto;
    }
  }
</style>
