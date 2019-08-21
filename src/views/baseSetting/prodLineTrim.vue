<template>
  <single-page class="plts">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        :data="tableData"
        :columns="tableColumns"
        :loading="loading"
        :column-type="['index']"
        :total="pageTotal" height="100%"
        @update-data="pageChange"
      >
        <div slot="btn">
          <el-button type="primary" @click="add">新增</el-button>
        </div>
      </dj-table>
    </page-pane>

    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm" append-to-body
               :title="dialogTypeIsAdd?'新增生产线修边': '编辑生产线修边'">
      <div class="plts-dialog" :class="{'edit': !dialogTypeIsAdd}" v-loading="dialogLoading">
        <dj-form  v-for="(formOption, index) in formOptions"
                  ref="form"
                  :column-num="dialogTypeIsAdd?4: 1"
                  @click.native="()=>deleteCurRow($event, index)"
                  :col-rule="(item,ruleIndex)=>colRule(item,ruleIndex)"
                  :form-data="formData[index]"
                  :form-options="formOption"></dj-form>
        <div class="plts-dialog-aside" v-if="dialogTypeIsAdd">
          <el-button type="primary" @click.prevent="addLayer">添加生产线</el-button>
        </div>
      </div>
    </dj-dialog>
  </single-page>
</template>

<script>
  import prodLineTrimService from '../../api/service/productionLineTrim';
  import prodLineService from '../.././api/service/productionLine';
  import loadingMixins from '../../mixins/loading';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";

  const cengshuOption = [
      {label: '二层', value: 2},
      {label: '三层', value: 3},
      {label: '四层', value: 4},
      {label: '五层', value: 5},
      {label: '六层', value: 6},
      {label: '七层', value: 7},
      ];
  let baseOption = [
    {
      type: 'select',
      formItem: {
        prop: 'lineId',
        label: '生产线',
        rules: [djForm.rules.required('请选择生产线')],
      },
      attrs: {
        options: [],
      },
    },
    {
      type: 'select',
      formItem: {
        prop: 'layer',
        label: '层数',
        rules: [
          djForm.rules.required('请选择层数'),
        ],
      },
      attrs: {
        options: cengshuOption,
      },
    },
    {
      type: 'input',
      formItem: {
        prop: 'wasteSize',
        label: '修边',
        rules: [
          djForm.rules.required('请输入修边'),
          formRules.number,
          formRules.number5
        ],
      }
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
    name: 'productionLineTrim',
    components: {PagePane},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '生产线', key: 'lineId', type: 'select', attrs: {options: []}},
          {label: '层数', key: 'layer', type: 'select', attrs: {options: cengshuOption}},
          {label: '修边', key: 'wasteSize', type: 'input', attrs: {type: 'number'}},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '生产线', prop: 'lineNum', formatter: row=> row.lineNum + '号线'},
          {label: '层数', prop: 'layer', formatter: row=> {
              const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
              return chnNumChar[row.layer] + '层';
            }},
          {label: '修边', prop: 'wasteSize'},
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
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        formData: [{
          lineId: '',
          layer: '',
          wasteSize: ''
        }],

        formOptions: [
          baseOption
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        addLayerNum: 1
      };
    },
    methods: {
      deleteCurRow(evt, index) {
        if (evt.target.className === 'el-icon-delete') {
          if (this.formOptions.length === 1) {
            this.$message('最后一条记录不可删除', 'warning');
            return false;
          }
          this.formOptions.splice(index, 1);
          this.formData.splice(index, 1);
          this.addLayerNum -= 1;
        }
      },
      colRule(item, index) {
        if (this.dialogTypeIsAdd) {
          if (index === 3) {
            return 0;
          }
          return 8;
        }
      },
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
          lineId: '',
          layer: '',
          wasteSize: ''
        });
        this.formOptions.push(baseOption);
      },
      getTableData(data) {
        this.loading = true;
        prodLineTrimService.list(data).then((res) => {
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
        this.$confirm(`确定${text}该条内容吗？`, '', {
          type: 'warning',
          showClose: false,
        }).then(() => {
          this.dj_api_extend(prodLineTrimService.changeEffected, post).then((res) => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
      },
      formReset() {
        this.formOptions = [baseOption];
        this.formData = [{
          lineId: '',
          layer: '',
          wasteSize: ''
        }];
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dialogLoading = true;
        this.addLayerNum = 1;
        this.dj_api_extend(prodLineTrimService.getWasterLineByid, {
          id: row.id
        }).then(res=>{
          this.formData = [{
            id: row.id,
            lineId: res.id,
            layer: res.layer,
            wasteSize: res.wasteSize
          }];
          this.formOptions = [this.$method.deepClone(baseOption).splice(0, 3)];
        }).catch(err=>{
          this.$message('获取信息失败', 'error');
        }).finally(() => {
          this.dialogLoading = false;
        });
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
        const formValidate = new Promise((resolve) => {
          let allIsTrue = [];
          this.$refs.form.map((v, index)=>{
            v.validate((valid) => {
              allIsTrue.push(valid);
              if (index === this.addLayerNum - 1) {
                resolve(allIsTrue);
              }
            });
          });
        });
        formValidate.then(res=>{
          if (res.length === this.addLayerNum && res.every(v=>v)) {
            let poor = this.formData.map(v=>v.layer.toString() + '&' + v.lineId);
            console.log(poor);
            if (this.dialogTypeIsAdd) {
              let existData;
              for (let i = 0; i < poor.length; i++) {
                if (poor.findIndex(v=>poor[i] === v) !== i) {
                  existData = poor[i].split('&');
                }
              }
              console.log(existData);
              if (existData && existData.length > 1) {
                const [layer, lineId] = existData;
                const lineNum = baseOption[0].attrs.options.find(v=>v.value === lineId).label;
                this.$message(`已存在生产线：${lineNum}号线，层数：${layer}，该核对`, 'warning');
                return false;
              }
            }
            const request = this.dialogTypeIsAdd
            ? prodLineTrimService.add(this.formData)
            : prodLineTrimService.modifyWasterLineByid({
                ...this.formData[0],
              });
            this.dialogLoading = true;
            request.then((res) => {
              this.close();
              const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
              this.$message(message, 'success');
              this.$refs.search.search();
            }).finally(() => {
              this.dialogLoading = false;
            });
          }
        });
      },
      close() {
        this.dialogLoading = false;
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
      prodLineService.showAllLine().then(res=>{
        const lineOptions = res.list.map(v=>{
          return {
            label: v.lineNum + '号线',
            value: v.id
          };
        });
        baseOption[0].attrs.options = lineOptions;
        this.searchConfig[0].attrs.options = lineOptions;
      });
      this.search();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .status-off{
    color: #909399;
  }

  @{deep} .el-col-8 {
    width: 30%;
  }
  @{deep} .dj-form{
    .el-col-0{
      display: block;
      .el-form-item__content{
        cursor: pointer;
        margin-left: 12px!important;
      }
    }
  }
  .plts-dialog {
    width: 1164px;
    height: 497px;
    margin-bottom: 20px;
    &-aside{
      margin-left: 90px;
    }
    &.edit{
      width: 400px;
      height: 157px;
      @{deep} .el-col-delete{
        .el-form-item__content{
          display: none;
        }
      }
    }
  }
</style>
