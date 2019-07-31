<template>
  <div class="plts">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :column-type="['index']"
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
                  :ref="'form'+index"
                  labelWidth="70px"
                  :column-num="dialogTypeIsAdd?4: 1"
                  @click.native="()=>deleteCurRow($event, index)"
                  :col-rule="(item,ruleIndex)=>colRule(item,ruleIndex)"
                  :form-data="formData[index]"
                  :form-options="formOption"></dj-form>
        <div class="plts-dialog-aside" v-if="dialogTypeIsAdd">
          <el-button type="primary" @click.prevent="addLayer">+添加层数修边</el-button>
        </div>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import productionLineTrimmingSettingsService from '../../api/service/productionLineTrimmingSettings';
  import {djForm} from 'djweb';
  const cengshuOption = [
      {label: '二层', value: '2'},
      {label: '三层', value: '3'},
      {label: '四层', value: '4'},
      {label: '五层', value: '5'},
      {label: '六层', value: '6'},
      {label: '七层', value: '7'},
      ];
  const baseOption = [
    {
      type: 'select',
      formItem: {
        prop: 'line',
        label: '生产线:',
        rules: [djForm.rules.required('请选择相应的生产线')],
      },
      attrs: {
        options: cengshuOption,
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
        options: cengshuOption,
      },
    },
    {
      type: 'input',
      formItem: {
        prop: 'trimming',
        label: '修边:',
        rules: [
          // {type: 'number', message: '只可输入数字', trigger: 'change'},
          // {type: 'number', max: 9999, message: '不能超过9999', trigger: 'change'},
          djForm.rules.required('修边不能为空'),
        ],
      },
      attrs: {
        // type: 'number'
      },
    },
    {
      type: 'i',
      formItem: {
        prop: '',
        label: '',
      },
      attrs: {
        class: 'el-icon-delete'
      }
    }
  ];
  export default {
    name: 'productionLineTrimmingSettings',
    data() {
      return {

        searchConfig: [
          {label: '生产线：', key: 'line', type: 'input'},
          {label: '层数：', key: 'layer', type: 'select', attrs: {options: cengshuOption}},
          {label: '修边：', key: 'trimming', type: 'input', attrs: {type: 'number'}},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '生产线', prop: 'line'},
          {label: '层数', prop: 'layer'},
          {label: '修边', prop: 'trimming'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time'},
          {label: '启用状态', prop: 'status',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.status ? '' : 'status-off'}>
                  {row.status ? '已启用' : '已禁用'}
                </div>
              );
            }
          },
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
          baseOption
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 100,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        addLayerNum: 1,
        layerIndex: 0
      };
    },
    methods: {
      deleteCurRow(evt, index) {
        if (evt.target.className === 'el-icon-delete') {
          this.formOptions.splice(index, 1);
          this.formData.splice(index, 1);
        }
      },
      colRule(item, index) {
        if (this.dialogTypeIsAdd) {
          if (index < 2) {
            return 8;
          }
          if (index === 3) {
            return 'delete';
          }
          return 7;
        } else {
          return '';
        }
      },
      add() {
        console.log(this.formOptions);
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
        this.formOptions = [this.$method.deepClone(baseOption).splice(0, 3)];
        this.formData = [this.$method.deepClone(row)];
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
      confirm() {
        let allValid = 0;
        for (let i = 0; i < this.addLayerNum; i++) {
          this.$refs['form' + i][0].validate(()=>{
            allValid += 1;
          });
        }
        if (allValid === this.addLayerNum) {
          productionLineTrimmingSettingsService.list(this.formData).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        }
      },
      close() {
        // this.$refs.form.resetFields();
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
  @{deep} .operation {
    line-height: 1;
    a {
      padding: 2px 10px;
      cursor: pointer;
      &:not(:last-child){
        border-right: 1px solid #f0f2f5;
      }
    }
  }
  @{deep} .status-off{
    color: #afb1b5;
  }

  .plts-dialog {
    width: 70vw;
    padding-top: 20px;
    &.edit{
      width: 40vw;
      @{deep} .el-col-delete{
        .el-form-item__content{
          display: none;
        }
      }
    }
    @{deep} .dj-form .el-col-delete{
      .el-form-item__content{
        width: 30px;
        cursor: pointer;
        margin-left: unset!important;
      }
    }
  }
</style>
