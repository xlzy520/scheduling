<template>
  <div class="table-page rule-customize">
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :total="pageTotal"
      v-loading="tableLoading"
    >
      <div slot="btn">
        <el-button type="primary" @click="addStackOrPack('stack')">新增叠单规则</el-button>
        <el-button type="primary" @click="addStackOrPack('pack')">新增打包规则</el-button>
        <!--<el-button type="primary" @click="closeSuoBian">关闭缩边</el-button>-->
      </div>
    </dj-table>
    <stack-dialog v-if="dialogType==='stack'" ref="dialog" @close="close" @confirm="stackConfirm"
                 :dialog-type-is-add="dialogTypeIsAdd"></stack-dialog>
    <pack-dialog v-if="dialogType==='pack'" ref="dialog" @close="close" @confirm="packConfirm"
                 :dialog-type-is-add="dialogTypeIsAdd"></pack-dialog>
    <view-dialog  ref="viewDialog" v-if="dialogType.includes('view')" @close="close" :dialogType="dialogType"></view-dialog>
  </div>
</template>

<script>
  import ruleCustomizeService from '@/api/service/ruleCustomize';
  import ViewDialog from './components/ViewDialog';
  import PackDialog from './components/PackDialog';
  import StackDialog from './components/StackDialog';

  export default {
    name: 'ruleCustomize',
    components: {ViewDialog, PackDialog, StackDialog},
    data() {
      return {
        dialogType: '',
        dialogTypeIsAdd: false,
        tableLoading: false,
        tableData: [],
        tableColumns: [
          {label: '名称', prop: 'name'},
          {label: '规则类型', prop: 'typeName'},
          {label: '生效时间', prop: 'effectiveTime'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.isEffected ? '' : 'rule-status-off'}>
                  {row.isEffected ? '已启用' : '已失效'}
                </div>
              );
            }
          },
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.view(row)}>查看</a>
                  <a onClick={() => this.changeStatus(row)}>{row.isEffected ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ],

        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 0,
      };
    },
    methods: {
      addStackOrPack(dialogType) {
        this.dialogTypeIsAdd = true;
        this.dialogType = dialogType;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      changeRuleEffectedApi({isEffected, id}) {
        ruleCustomizeService.changeEffected({
          effected: Math.pow(0, isEffected), // 0、1数字取反
          ruleId: id
        }).then(() => {
          this.$message(isEffected ? '禁用成功' : '启用成功', 'success');
          this.getTableData();
        });
      },
      changeStatus(row) {
        if (!row.isEffected) {
          this.$confirm('确定启用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.changeRuleEffectedApi(row);
          });
        } else {
          this.changeRuleEffectedApi(row);
        }
      },
      view(row) {
        this.dialogType = (row.typeName === '叠单规则' ? 'stack' : 'pack') + '_view';
        this.$nextTick(()=>{
          this.$refs.viewDialog.view(row);
        });
      },
      edit(row) {
        this.dialogType = row.typeName === '叠单规则' ? 'stack' : 'pack';
        this.dialogTypeIsAdd = false;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
        ruleCustomizeService.getRuleDetail({
          ruleId: row.id
        }).then(res=>{
          if (this.dialogType === 'stack') {
            let { detailModels, ...rest } = res;
            this.$refs.dialog.stackFormData = rest;
            let cache = [[], [], [], [], [], [], []];
            for (let i = 0; i < detailModels.length; i++) {
              detailModels[i].cut = [detailModels[i].cut ];
              cache[detailModels[i].cut - 1].push(detailModels[i]);
            }
            this.$refs.dialog.stackConditionFormData = cache;
          } else {
            let { packRuleDetails, ...rest } = res;
            this.$refs.dialog.packFormData = rest;
            let cache = [[], [], [], [], [], []];
            for (let i = 0; i < packRuleDetails.length; i++) {
              cache[packRuleDetails[i].layer - 2].push(packRuleDetails[i]);
            }
            this.$refs.dialog.packConditionFormData = cache;
          }
        });
      },
      closeSuoBian() {
        this.$confirm('确定关闭缩边吗？', '', {
          type: 'warning',
          showClose: false,
        }).then(() => {
          ruleCustomizeService.list().then((res) => {
            this.$message('关闭成功', 'success');
          });
        });
      },
      formValidate(formType) {
        return new Promise((resolve) => {
          let allIsTrue = [];
          this.$refs.dialog.$refs[formType + 'Form'].validate((valid) => {
            if (valid) {
              allIsTrue.push(true);
            }
          });
          const childConditionForms = this.$refs.dialog.$refs['childConditionForm'];
          childConditionForms.map((child, index)=>{
            child.validate((valid) => {
              if (valid) {
                allIsTrue.push(true);
              }
              if (index === childConditionForms.length - 1) {
                if (allIsTrue.length === childConditionForms.length + 1) {
                  resolve(true);
                }
              }
            });
          });
        });
      },
      submitSuccess() {
        this.close();
        const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
        this.$message(message, 'success');
        this.$refs.search.search();
      },
      stackConfirm() {
        this.formValidate('stack').then(()=>{
          const detailModels = this.$refs.dialog.stackConditionFormData.reduce((pre, cur)=>{
            let cache = cur.map(v=> v.cut.map(vcut=>{
                return {
                  tilemodel: v.tilemodel,
                  cut: vcut,
                  piece: v.piece,
                };
              }));
            return pre.concat(...cache);
          }, []);
          const packRequest = this.dialogTypeIsAdd ? ruleCustomizeService.addStackRule : ruleCustomizeService.modifyStackRule;
          packRequest({
            ...this.$refs.dialog.stackFormData,
            detailModels: detailModels
          }).then(() => {
            this.submitSuccess();
          });
        });
      },
      packConfirm() {
        this.formValidate('pack').then(()=>{
          const packRuleDetails = this.$refs.dialog.packConditionFormData.reduce((pre, cur)=>{
            return pre.concat(...cur);
          }, []);
          const packRequest = this.dialogTypeIsAdd ? ruleCustomizeService.addPackRule : ruleCustomizeService.modifyPackRule;
          packRequest({
            ...this.$refs.dialog.packFormData,
            packRuleDetails: packRuleDetails
          }).then((res) => {
            this.submitSuccess();
          });
        });
      },
      close() {
        this.dialogType = '';
      },
      getTableData(data) {
        this.tableLoading = true;
        ruleCustomizeService.list({
          ...data,
          ...this.pageOptions
        }).then((res) => {
          this.tableData = res.list;
          this.pageTotal = res.total;
        }).finally(()=>{
          this.tableLoading = false;
        });
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
  @{deep} .rule-status-off{
    color: #afb1b5;
  }
  @{deep} .pack-dialog,
  .stack-dialog{
    width: 80vw;
    .condition-item{
      display: flex;
    }
  }
</style>
