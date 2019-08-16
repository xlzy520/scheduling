<template>
  <div class="table-page branch-task" v-loading="loading">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table
      ref="table"
      :data="tableData"
      :columns="tableColumns"
      :column-type="['selection', 'index']"
      @selection-change="selectionChange"
      :total="pageTotal"
      height="100%"
      @update-data="getTableData"
    >
      <div slot="btn">
        <el-button type="primary" @click="printTag">打印标签</el-button>
        <el-button type="primary" @click="removeOrder">移除订单</el-button>
      </div>
    </dj-table>
    <dj-dialog v-if="visible" ref="dialog" @close="close" @confirm="confirm" title="处理">
      <div class="dialog">
        <dj-form :form-data="formData" ref="form" :form-options="formOptions" :column-num="2"></dj-form>
        <div class="order-info-text">订单信息</div>
        <dj-form :form-data="formData" :form-options="orderFormOptions" :column-num="3"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import dayjs from 'dayjs';
  import branchTaskService from '../../api/service/branchTask';
  import {djForm} from 'djweb';
  import formRules from "../baseSetting/formRules";

  const branchStatusOptions = [
    {label: '待处理', value: '0'},
    {label: '处理中', value: '1'},
    {label: '已处理', value: '2'},
    {label: '全部', value: '3'},
  ];
  const initFormData = {
    mergeOrderNumber: '',
    produceOrderNumber: '',
    waitHandleNum: 222,
    handledNum: '',
  };
  export default {
    name: 'branchTask',
    data() {
      const handleNum = (rule, value, callback) => {
        if (value > this.formData.waitHandleNum) {
          callback(new Error('处理数量不能大于待处理数量'));
        } else {
          callback();
        }
      };
      return {
        searchConfig: [
          {
            label: '生成时间', key: 'timeRange', type: 'date', attrs: {
              default: [dayjs(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')],
              beforeChange: (val) => {
                let _val = val;
                if (val[0] && val[1]) {
                  let day92 = dayjs(val[0]).add(92, 'day');
                  if (day92.isBefore(dayjs(val[1]))) {
                    this.$message('时间不能超过92天', 'error');
                    _val = [val[0], day92.toDate()];
                  }
                }
                return _val;
              },
              type: 'daterange',
              pickerOptions: {
                shortcuts: [
                  {
                    text: '今天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '近七天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '近30天',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                      picker.$emit('pick', [start, end]);
                    }
                  }
                ]
              },
              valueFormat: "yyyy-MM-dd"
            }
          },
          {label: '分线状态', key: 'divideState', type: 'select', attrs: {options: branchStatusOptions}},
          {label: '用料代码', key: 'materialCode', type: 'input'},
          {label: '订单编号', key: 'produceOrderNumber', type: 'input', attrs: {reg: /\w+/g}},
          {
            label: '下料规格', key: 'guige', type: 'custom',
            component: {
              data() {
                return {
                  start: '',
                  end: ''
                };
              },
              props: {
                value: {
                  type: Array,
                  default: () => [null, null]
                },
              },
              methods: {
                update(val) {
                  this.start = val[0];
                  this.end = val[1];
                }
              },
              render(h) {
                const input = (index, val) => {
                  const value = this.value;
                  value[index] = val;
                  this.update(value);
                  this.$emit('input', value);
                };
                return (
                  <div class="xialiaoguige">
                    <dj-input type='number' value={this.start} onInput={val => input(0, val)}
                              placeholder="切长cm" maxLength="10"/>
                    <span class="text">*</span>
                    <dj-input type='number' value={this.end} onInput={val => input(1, val)}
                              placeholder="切宽cm" maxLength="10"/>
                  </div>
                );
              }
            }
          },
        ],
        tableData: [],
        tableColumns: [
          {
            label: '订单标记', prop: 'grouponOrderFlag', render: (h, {props: {row}}) => {
              return (
                <div class={row.grouponOrderFlag === '急' ? 'urgent' : 'delay'}>{row.grouponOrderFlag}</div>
              );
            }
          },
          {label: '分线状态', prop: 'divideState'},
          {label: '合并编号', prop: 'combineId'},
          {label: '订单编号', prop: 'grouponOrderNumber'},
          {label: '生产编号', prop: 'produceOrderNumber'},
          {label: '用料代码', prop: 'materialCode'},
          {label: '瓦楞楞型', prop: 'tilemodel'},
          {label: '订单数量', prop: 'pieceAmount'},
          {label: '生产数量', prop: 'prodAmount'},
          {label: '处理数量', prop: 'pieceAmount'},
          {label: '下料规格(cm)', prop: 'xialiaoguige'},
          {label: '产品规格', prop: 'prodGuige'},
          {label: '压线方式', prop: 'yaxianMethod'},
          {label: '纵压公式', prop: 'zhongyaformula'},
          {label: '横压公式', prop: 'hengyaformula'},
          {label: '订单交期', prop: 'jiaoqi'},
          {label: '客户名称', prop: 'name'},
          {label: '产品名称', prop: 'prodName'},
          {label: '生成时间', prop: 'createTime'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'operatTime'},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a class={row.divideState === '已处理' ? 'divideState-completed' : ''}
                     onClick={() => this.handle(row)}>处理</a>
                </div>
              );
            },
          },
        ],
        pageTotal: 0,
        searchData: {},
        loading: false,
        checkedList: [],

        formData: initFormData,
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'mergeOrderNumber',
              label: '合并编号',
            },
            attrs: {
              disabled: true,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'produceOrderNumber',
              label: '生产编号',
            },
            attrs: {
              disabled: true,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'waitHandleNum',
              label: '待处理数量',
            },
            attrs: {
              disabled: true,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'processeAmount',
              label: '处理数量',
              rules: [
                djForm.rules.required('请输入处理数量'),
                formRules.number,
                {validator: handleNum}
              ],
            },
            attrs: {
              maxLength: 10,
            },
          },
        ],
        orderFormOptions: [
          {formItem: {prop: 'grouponOrderNumber', label: '订单编号：'}},
          {formItem: {prop: 'orderAmount', label: '订单数量：'}},
          {formItem: {prop: 'jiaoqi', label: '订单交期：'}},
          {formItem: {prop: 'prodName', label: '产品名称：'}},
          {formItem: {prop: 'name', label: '客户名称：'}},
          {formItem: {prop: 'prodGuige', label: '产品规格：'}},
          {formItem: {prop: 'code', label: '用料代码：'}},
          {formItem: {prop: 'lengxing', label: '瓦楞楞型：'}},
          {formItem: {prop: 'xialiaoguige', label: '下料规格：'}},
          {formItem: {prop: 'yaxianMethod', label: '压线方式：'}},
          {formItem: {prop: 'hengyaformula', label: '横压公式：'}},
          {formItem: {prop: 'zhongyaformula', label: '纵压公式：'}},
        ],
        visible: false
      };
    },
    methods: {
      handle(row) {
        this.formData = this.$method.deepClone(row);
        this.formData.waitHandleNum = 222; // todo  mock
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.dialog.open();
        });
      },
      close() {
        this.visible = false;
        this.formData = initFormData;
      },
      confirm() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.dj_api_extend(branchTaskService.processe, this.formData).then(res => {
              this.$message('保存成功', 'success');
              this.close();
              this.$refs.search.search();
            }).catch(() => {
              this.loading = false;
            });
          }
        });
      },
      printTag() {
        const {length} = this.checkedList;
        if (length === 0) {
          this.$message('订单未选择，请重新操作', 'info');
          return false;
        } else {

        }
      },
      removeOrder() {
        if (this.checkedList.length === 0) {
          this.$message('订单未选择，请重新操作', 'info');
          return false;
        } else {
          this.$confirm('确定移除该条内容吗？', '', { //todo
            type: 'warning',
            showClose: false,
          }).then(() => {
            const canRemove = this.checkedList.some(v => !['已处理', '处理中'].includes(v.divideState));
            if (canRemove) {
              this.loading = true;
              this.dj_api_extend(branchTaskService.removeOrder, {
                list: this.checkedList
              }).then(res => {
                this.$message('移除成功', 'success');
                this.$refs.search.search();
              }).catch(() => {
                this.loading = false;
              });
            } else {
              this.$message(' 分线状态发生变化，无法进行操作', 'warning');
            }
          });

        }
      },
      selectionChange(checkedList) {
        this.checkedList = checkedList;
      },
      search(query) {
        const {timeRange, guige, ...restQuery} = query;
        let params = {
          ...restQuery,
          startTime: timeRange[0],
          endTime: timeRange[1],
        };
        if (guige!== undefined) {
          let guigeparams = {
            materialLength: guige[0],
            materialWidth: guige[1],
          };
          Object.assign(params, guigeparams);
        }
        this.searchData = params;
        this.$refs.table.changePage(1);
      },
      getTableData(data) {
        this.loading = true;
        this.dj_api_extend(branchTaskService.list, {
          ...data,
          ...this.searchData
        }).then(res => {
          const {list, total} = res;
          this.tableData = list;
          this.pageTotal = total;
        }).finally(() => {
          this.loading = false;
        });
      }
    },
    mounted() {
      this.$refs.search.search();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .xialiaoguige {
    display: flex;
    .text {
      margin: auto 5px;
    }
  }

  @{deep} .operation {
    line-height: 1;
    a {
      color: #3654EA;
      padding: 2px 10px;
      cursor: pointer;
    }
    .divideState-completed {
      pointer-events: none;
      color: #909399;
    }
  }

  @{deep} .cell {
    .urgent {
      color: #ff0000;
    }
    .delay {
      color: #F89816;
    }
  }

  .dialog {
    width: 1000px;
    .order-info-text {
      font-family: PingFang SC Medium, sans-serif;
      font-weight: 500;
      color: rgba(48, 49, 51, 1);
      width: 105px;
      padding: 15px 8px 15px 0;
      text-align: right;
    }
  }

</style>
