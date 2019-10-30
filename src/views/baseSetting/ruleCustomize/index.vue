<template>
  <single-page class="table-page rule-customize">
    <page-pane>
      <dj-table
        ref="table"
        :data="tableData"
        :columns="tableColumns"
        :total="pageTotal"
        height="100%"
        @update-data="getTableData"
        :loading="loading"
      >
        <div slot="btn">
          <el-button type="primary" @click="addStackOrPack('stack')">新增叠单规则</el-button>
          <el-button type="primary" @click="addStackOrPack('pack')">新增打包规则</el-button>
          <el-button @click="closeShrink" v-if="shrink !== 0">{{getShrinkText()}}缩边</el-button>
        </div>
      </dj-table>
    </page-pane>

    <stack-dialog v-if="dialogType==='stack'" ref="dialog" @close="close" @confirm="stackConfirm"
                 :dialog-type-is-add="dialogTypeIsAdd"></stack-dialog>
    <pack-dialog v-if="dialogType==='pack'" ref="dialog" @close="close" @confirm="packConfirm"
                 :dialog-type-is-add="dialogTypeIsAdd"></pack-dialog>
    <view-dialog  ref="viewDialog" v-if="dialogType.includes('view')" @close="close" :dialog-type="dialogType"></view-dialog>
  </single-page>
</template>

<script>
  import ruleCustomizeService from '@/api/service/ruleCustomize';
  import ViewDialog from './components/ViewDialog';
  import PackDialog from './components/PackDialog';
  import StackDialog from './components/StackDialog';
  import PagePane from "../../../components/page/pagePane";

  export default {
    name: 'ruleCustomize',
    components: {PagePane, ViewDialog, PackDialog, StackDialog},
    data() {
      return {
        loading: false,
        dialogType: '',
        dialogTypeIsAdd: false,
        tableData: [],
        tableColumns: [
          {label: '名称', prop: 'name'},
          {label: '规则类型', prop: 'typeName'},
          {label: '生效时间', prop: 'effectTime'},
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
                <div class="td-btn-group">
                  <a onClick={() => this.view(row)}>查看</a>
                  <span></span>
                  <a onClick={() => this.changeStatus(row)}>{row.isEffected ? '禁用' : '启用'}</a>
                  <span></span>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
        shrink: 0
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
      changeStatus(row) {
        let post = {
          ruleId: row.id,
          effected: row.isEffected ? 0 : 1,
        };
        let text = row.isEffected ? '禁用' : '启用';
        this.$method.tipBox(`确定${text}该条内容吗？`, ()=>{
          return this.dj_api_extend(ruleCustomizeService.changeEffected, post).then(() => {
            this.$message(`${text}成功`, 'success');
            this.$refs.table.updateData();
          });
        });
        // this.$confirm(`确定${text}该条内容吗？`, '', {
        //   type: 'warning',
        //   showClose: false,
        // }).then(() => {
        //   this.dj_api_extend(ruleCustomizeService.changeEffected, post).then(() => {
        //     this.$message(`${text}成功`, 'success');
        //     this.$refs.table.updateData();
        //   });
        // });
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
          this.$refs.dialog.renderAllCondition(row.id);
        });
      },
      getShrinkText() {
        const textMap = ['', '关闭', '开启'];
        return textMap[this.shrink];
      },
      getShrink() {
        this.dj_api_extend(ruleCustomizeService.getShrink).then(res=>{
          this.shrink = res;
        });
      },
      closeShrink() {
        const text = this.getShrinkText();
        this.$method.tipBox(`确定${text}缩边吗？`, ()=>{
          return this.dj_api_extend(ruleCustomizeService.changeShrinkType).then(()=>{
            this.$message(`${text}成功`, 'success');
            this.getShrink();
          });
        });
        // this.$confirm(`确定${text}缩边吗？`, '', {
        //   type: 'warning',
        //   showClose: false,
        // }).then(() => {
        //   this.dj_api_extend(ruleCustomizeService.changeShrinkType).then(()=>{
        //     this.$message(`${text}成功`, 'success');
        //     this.getShrink();
        //   });
        // });
      },
      formValidate(formType) {
        return new Promise((resolve, reject) => {
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
                } else {
                  reject();
                }
              } else {
                reject();
              }
            });
          });
        });
      },
      submitSuccess() {
        this.close();
        const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
        this.$message(message, 'success');
        this.$refs.table.updateData();
      },
      stackConfirm(cb) {
        this.formValidate('stack').then(()=>{
          const flag = this.$refs.dialog.stackConditionFormData.every((v, index)=>{
            const cuts = v.reduce((pre, cur)=>pre.concat(cur.cut), []);
            const allCuts = new Array(7).fill('').map((v, i)=>(i + 1).toString());
            const cut = allCuts.find(c=>!cuts.includes(c));
            if (cut > 0) {
              this.$message(`条件${index + 1}: 切数${cut}未选择`, 'warning');
              return false;
            }
            return true;
          });
          if (flag) {
            this.$refs.dialog.loading = true;
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
            const stackRequest = this.dialogTypeIsAdd ? ruleCustomizeService.addStackRule : ruleCustomizeService.modifyStackRule;
            const stackFormData = this.$method.handleFormDataStartOrEndByZero(
              this.$refs.dialog.stackFormData, ['name', 'produceLineId'], false);
            return stackRequest({
              ...stackFormData,
              detailModels: detailModels.map(v=>this.$method.handleFormDataStartOrEndByZero(v, ['piece'], true))
            }).then(() => {
              this.$refs.dialog.loading = false;
              this.submitSuccess();
            }).catch(() => {
              this.$refs.dialog.loading = false;
            });
          }
        }).finally(cb);
      },
      packConfirm(cb) {
        this.formValidate('pack').then(()=>{
          let flag = true;
          const layers = this.$refs.dialog.getLayers();
          const allLayers = new Array(6).fill('').map((v, i)=>(i + 2).toString());
          const layer = allLayers.find(c=>!layers.includes(c));
          if (layer > 0) {
            this.$message(`层数${layer}未选择`, 'warning');
            flag = false;
          }
          if (flag) {
            this.$refs.dialog.loading = true;
            const packRuleDetails = this.$refs.dialog.packConditionFormData.reduce((pre, cur)=>{
              if (this.dialogTypeIsAdd) {
                let cache = cur.map(v=> v.layer.map(vlayer=>{
                  return {
                    endUnitarea: v.endUnitarea,
                    layer: vlayer,
                    packpiece: v.packpiece,
                    startUnitarea: v.startUnitarea
                  };
                }));
                return pre.concat(...cache);
              } else {
                let cache = cur.map(v=> v);
                return pre.concat(...cache);
              }

            }, []);
            const packRequest = this.dialogTypeIsAdd ? ruleCustomizeService.addPackRule : ruleCustomizeService.modifyPackRule;
            const packFormData = this.$method.handleFormDataStartOrEndByZero(
              this.$refs.dialog.packFormData, ['name'], false);
            return packRequest({
              ...packFormData,
              packRuleDetails: packRuleDetails.map(v=>this.$method.handleFormDataStartOrEndByZero(v, ['packpiece', 'endUnitarea'], true))
            }).then(() => {
              this.$refs.dialog.loading = false;
              this.submitSuccess();
            }).catch(() => {
              this.$refs.dialog.loading = false;
            });
          }
        }).finally(cb);
      },
      close() {
        this.dialogType = '';
      },
      getTableData(data) {
        this.loading = true;
        this.dj_api_extend(ruleCustomizeService.list, data).then((res) => {
          this.tableData = res.list;
          this.pageTotal = res.total;
        }).finally(()=>{
          this.loading = false;
        });
      },
    },
    mounted() {
      this.$refs.table.changePage(1);
      this.getShrink();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .rule-status-off {
    color: #909399;
  }
  .rule-customize{
    padding-top: 24px;
  }
</style>
