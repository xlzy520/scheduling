<template>
  <single-page class="table-page paper-kind">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <page-pane>
      <dj-table
        ref="table"
        :loading="loading"
        :data="tableData"
        :columns="tableColumns"
        :column-type="['index']"
        :total="pageTotal" height="100%"
        @update-data="getList"
      >
        <div slot="btn">
          <el-button type="primary" @click="add">新增</el-button>
        </div>
      </dj-table>
    </page-pane>

    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               width="780px" :title="dialogTypeIsAdd?'新增原纸品种': '编辑原纸品种'">
      <div class="paper-kind-dialog" v-loading="dialogLoading">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions" :column-num="2"></dj-form>
      </div>
    </dj-dialog>
  </single-page>
</template>

<script>
  import paperKindService from '../../api/service/paperKind';
  import paperCodeService from '../../api/service/paperCode';
  import paperWarehouseService from '../../api/service/paperWarehouse';
  import loadingMixins from '../../mixins/loading';
  import {djForm} from 'djweb';
  import formRules from "./formRules";
  import PagePane from "../../components/page/pagePane";
  const initFormData = {
    paperNumber: undefined,
    paperCodeId: undefined,
    paperCodeType: undefined,
    paperGram: undefined,
    paperSize: undefined,
    warehouseId: undefined,
    warehouseAreaId: undefined,
  };
  export default {
    name: 'paperKind',
    components: {PagePane},
    mixins: [loadingMixins],
    data() {
      return {
        searchConfig: [
          {label: '原纸编号', key: 'paperNumber', type: 'input'},
          {label: '原纸代码', key: 'paperCode', type: 'input'},
          {label: '门幅', key: 'paperSize', type: 'input'},
        ],
        tableData: [],
        tableColumns: [
          {label: '原纸编号', prop: 'paperNumber'},
          {label: '原纸代码', prop: 'paperCode'},
          {label: '原纸类型', prop: 'paperTypeName'},
          {label: '克重（g）', prop: 'paperGram'},
          {label: '门幅（mm）', prop: 'paperSize'},
          {label: '仓库名称', prop: 'warehouseName'},
          {label: '库区名称', prop: 'warehouseAreaName'},
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
        ],
        formData: this.$method.deepClone(initFormData),
        originFormData: {},
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false,
        searchData: {},
        warehouseList: [],
        warehouseAreaList: [],
        warehouseList_map: [],
        paperCodeList: [],
      };
    },
    computed: {
      formOptions() {
        return [
          {
            type: 'input',
            formItem: {
              prop: 'paperNumber',
              label: '原纸编号',
              rules: [
                djForm.rules.required('请输入原纸编号'),
                formRules.word_number
              ],
            },
            attrs: {
              maxlength: 5,
            },
            listeners: {
              'input': (val) => {
                this.formData.paperNumber = val.toUpperCase();
              },
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'paperCodeId',
              label: '原纸代码',
              rules: [
                djForm.rules.required('请选择原纸代码'),
              ],
            },
            attrs: {
              keyMap: {
                label: 'paperCode',
                value: 'id'
              },
              options: this.paperCodeList
            },
            listeners: {
              'input': (val) => {
                this.getPaperCodeById(val);
              },
              'clear': ()=>{
                this.resetTypeAndGram();
              },
              'visible-change': (val)=>{
                if (val) {
                  this.getAllPaperCode();
                }
              }
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'paperType',
              label: '原纸类型',
              rules: [djForm.rules.required('请选择原纸类型')],
            },
            attrs: {
              disabled: true,
              options: this.$enum.paperType._arr,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'paperGram',
              label: '克重(g)',
              rules: [
                djForm.rules.required('请输入克重'),
                formRules.number
              ],
            },
            attrs: {
              disabled: true,
              placeholder: '请输入该原纸品种对应最大克重'
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'paperSize',
              label: '门幅',
              rules: [
                djForm.rules.required('请输入门幅'),
                formRules.number,
                formRules.number5
              ],
            },
            attrs: {
              suffixIcon: "mm"
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseId',
              label: '仓库名称',
              rules: [
                djForm.rules.required('请选择仓库名称'),
              ],
            },
            attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseId'
              },
              options: this.warehouseList
            },
            listeners: {
              input: (val) => {
                this.formData.warehouseAreaId = undefined;
                if (!['', undefined, null].includes(val)) {
                  this.dj_api_extend(this.getWarehouseArea, val);
                }
              },
              'clear': ()=>{
                this.formData.warehouseAreaId = '';
                this.formOptions[this.formOptions.length - 1].attrs.options = [];
              },
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'warehouseAreaId',
              label: '库区名称',
              rules: [
                djForm.rules.required('请选择库区名称'),
              ],
            },
            attrs: {
              keyMap: {
                label: 'name',
                value: 'warehouseAreaId'
              },
              options: this.warehouseAreaList,
            },
          },
        ];
      }
    },
    methods: {
      resetTypeAndGram() {
        this.formData.paperType = '';
        this.formData.paperGram = '';
      },
      getAllPaperCode() {
        return this.dj_api_extend(paperCodeService.getAllList).then(res=>{
          this.paperCodeList = res.list || [];
        });
      },
      getPaperCodeById(id) {
        if (id) {
          return this.dj_api_extend(paperCodeService.getPaperCodeByid, {id}).then(res=>{
            let { paperType, paperGram } = res || {};
            let _res = {
              paperType,
              paperGram
            };
            this.formData = {...this.formData, ..._res};
          });
        }
      },
      getPaperKindById(id) {
        return this.dj_api_extend(paperKindService.getPaperByid, {id}).then(res=>{
          if (this.paperCodeList.findIndex(v=>v.id === res.paperCodeId) === -1) {
            const { paperCodeId: id, paperCode, paperGram, paperType} = res;
            this.paperCodeList.push({id, paperCode, paperGram, paperType});
          }
          this.formData = res || {};
          this.originFormData = this.$method.deepClone(res);
          return res;
        });
      },
      getWarehouse() {
        return this.dj_api_extend(paperWarehouseService.getPaperWarehouse).then((res) => {
          this.warehouseList = res.list || [];
          this.warehouseList_map = this.warehouseList.reduce((map, obj) => {
            map[obj.warehouseId] = obj;
            return map;
          }, {});
        });
      },
      getWarehouseArea(id) {
        return this.dj_api_extend(paperWarehouseService.getAreaAllList, {warehouseId: id}).then((res) => {
          this.warehouseAreaList = res.list || [];
        });
      },
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.getWarehouse();
        this.$nextTick(()=>{
          this.$refs.dialog.open();
          // this.getWarehouse();
        });
      },
      getList(page) {
        this.loading = true;
        let post = {
          ...this.searchData,
          ...page
        };
        this.dj_api_extend(paperKindService.list, post).then((res) => {
          let list = res.list || [];
          list.forEach(obj=>{
            obj.paperTypeName = this.$enum.paperType._swap[obj.paperType] && this.$enum.paperType._swap[obj.paperType].label;
          });
          this.tableData = list;
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
        this.$method.tipBox(`确定${text}该条内容吗？`, () => {
          return this.dj_api_extend(paperKindService.changeEffected, post).then(() => {
            this.$message(`${text}成功`, 'success');
            row.isEffected = !row.isEffected;
          });
        });
        // this.$confirm(`确定${text}该条内容吗？`, '', {
        //   type: 'warning',
        //   showClose: false,
        // }).then(() => {
        //   this.dj_api_extend(paperKindService.changeEffected, post).then(() => {
        //     this.$message(`${text}成功`, 'success');
        //     row.isEffected = !row.isEffected;
        //   });
        // });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.dialogLoading = true;
        this.getWarehouse();
        this.getPaperKindById(row.id).then((res)=>{
          this.getWarehouseArea(res.warehouseId);
        }).finally(() => {
          this.dialogLoading = false;
        });
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      search(query) {
        this.searchData = query;
        this.$refs.table.changePage(1);
      },
      confirm() {
        this.$refs.form.validate(()=>{
          if (!this.$method.equalsObjMessage(this.originFormData, this.formData)) {
            this.dialogLoading = true;
            let message;
            let api;
            let { paperCodeId, paperGram, paperNumber, paperSize, paperType, warehouseAreaId, warehouseId } = this.formData;
            let post = {paperCodeId, paperGram, paperNumber, paperSize, paperType, warehouseAreaId, warehouseId};
            if (this.dialogTypeIsAdd) {
              message = '新增成功';
              api = paperKindService.add;
            } else {
              message = '编辑成功';
              api = paperKindService.edit;
              post.id = this.formData.id;
            }
            post = this.$method.handleFormDataStartOrEndByZero(post, ['paperSize'], true);
            this.dj_api_extend(api, post).then(() => {
              this.close();
              this.$refs.table.updateData();
              this.$message(message, 'success');
              this.dialogLoading = false;
            }).catch(() => {
              this.dialogLoading = false;
            });
          }
        });
      },
      close() {
        this.$refs.form.resetFields();
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.getAllPaperCode();
        this.formData = this.$method.deepClone(initFormData);
        this.warehouseAreaList = [];
      }
    },
    mounted() {
      this.$refs.search.search();
      this.getAllPaperCode();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .status-off {
    color: #909399;
  }
</style>
