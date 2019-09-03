<template>
  <div class="cpqs">
    <dj-search ref="search" :config="searchConfig" @search="search"></dj-search>
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :column-type="['index']"
      :total="pageTotal" height="100%"
      @update-data="pageChange"
    >
      <div slot="btn">
        <el-button type="primary" @click="add">新增</el-button>
      </div>
    </dj-table>
    <dj-dialog v-if="dialogVisible" ref="dialog" @close="close" @confirm="confirm"
               :title="dialogTypeIsAdd?'新增客户打包数量': '编辑客户打包数量'">
      <div class="cpqs-dialog">
        <dj-form ref="form" :form-data="formData" :form-options="formOptions"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import cpqsService from '../../api/service/customerPackageQuantitySetting';
  import {djForm} from 'djweb';

  export default {
    name: 'CustomerPackageQuantitySetting',
    data() {
      return {
        searchConfig: [
          {label: '收货人：', key: 'acceptMan', type: 'input'},
          {label: '联系方式：', key: 'phone', type: 'input',},
          {label: '用料代码：', key: 'code', type: 'input'},
          {label: '楞型：', key: 'lengxing', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '客户名称', prop: 'name'},
          {label: '收货人', prop: 'acceptMan'},
          {label: '联系方式', prop: 'phone'},
          {label: '用料代码', prop: 'code'},
          {label: '瓦楞楞型', prop: 'lengxing', formatter: row=> row.layer + row.lengxing},
          {label: '打包数量', prop: 'amount'},
          {label: '操作人', prop: 'man'},
          {label: '操作时间', prop: 'time', width: 150},
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.deleteRow(row)}>删除</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ]),
        formData: {
          name: '',
          code: '',
          lengxing: '',
          amount: '',
        },
        formOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '客户名称',
              rules: [
                djForm.rules.required('客户名称不能为空')
              ],
            },
          },
          {
            type: 'select',
            formItem: {
              prop: 'code',
              label: '用料代码',
              rules: [
                djForm.rules.required('请选择相应的用料代码'),
                ],
            },
            attrs: {
              options: [{
                label: '丽岙原纸仓库1',
                value: 'chu',
              }, {
                label: '丽岙原纸仓库2',
                value: 'gao',
              }, {
                label: '丽岙原纸仓库3',
                value: 'da',
              }],
            },
          },
          {
            type: 'el-cascader',
            formItem: {
              prop: 'lengxing',
              label: '层数/楞型',
              rules: [
                djForm.rules.required('请选择相应的层数/楞型'),
                ],
            },
            attrs: {
              options: [
                {
                value: 'zhinan',
                label: '指南',
                children: [{
                  value: 'shejiyuanze',
                  label: '设计原则',
                  children: [{
                    value: 'yizhi',
                    label: '一致'
                  }, {
                    value: 'fankui',
                    label: '反馈'
                  }, {
                    value: 'xiaolv',
                    label: '效率'
                  }, {
                    value: 'kekong',
                    label: '可控'
                  }]
                }, {
                  value: 'daohang',
                  label: '导航',
                  children: [{
                    value: 'cexiangdaohang',
                    label: '侧向导航'
                  }, {
                    value: 'dingbudaohang',
                    label: '顶部导航'
                  }]
                }]
              },
                {
                value: 'zujian',
                label: '组件',
                children: [{
                  value: 'basic',
                  label: 'Basic',
                  children: [{
                    value: 'layout',
                    label: 'Layout 布局'
                  }, {
                    value: 'color',
                    label: 'Color 色彩'
                  }, {
                    value: 'typography',
                    label: 'Typography 字体'
                  }, {
                    value: 'icon',
                    label: 'Icon 图标'
                  }, {
                    value: 'button',
                    label: 'Button 按钮'
                  }]
                }, {
                  value: 'form',
                  label: 'Form',
                  children: [{
                    value: 'radio',
                    label: 'Radio 单选框'
                  }, {
                    value: 'checkbox',
                    label: 'Checkbox 多选框'
                  }, {
                    value: 'input',
                    label: 'Input 输入框'
                  }, {
                    value: 'input-number',
                    label: 'InputNumber 计数器'
                  }, {
                    value: 'select',
                    label: 'Select 选择器'
                  }, {
                    value: 'cascader',
                    label: 'Cascader 级联选择器'
                  }, {
                    value: 'switch',
                    label: 'Switch 开关'
                  }, {
                    value: 'slider',
                    label: 'Slider 滑块'
                  }, {
                    value: 'time-picker',
                    label: 'TimePicker 时间选择器'
                  }, {
                    value: 'date-picker',
                    label: 'DatePicker 日期选择器'
                  }, {
                    value: 'datetime-picker',
                    label: 'DateTimePicker 日期时间选择器'
                  }, {
                    value: 'upload',
                    label: 'Upload 上传'
                  }, {
                    value: 'rate',
                    label: 'Rate 评分'
                  }, {
                    value: 'form',
                    label: 'Form 表单'
                  }]
                }, {
                  value: 'data',
                  label: 'Data',
                  children: [{
                    value: 'table',
                    label: 'Table 表格'
                  }, {
                    value: 'tag',
                    label: 'Tag 标签'
                  }, {
                    value: 'progress',
                    label: 'Progress 进度条'
                  }, {
                    value: 'tree',
                    label: 'Tree 树形控件'
                  }, {
                    value: 'pagination',
                    label: 'Pagination 分页'
                  }, {
                    value: 'badge',
                    label: 'Badge 标记'
                  }]
                }, {
                  value: 'notice',
                  label: 'Notice',
                  children: [{
                    value: 'alert',
                    label: 'Alert 警告'
                  }, {
                    value: 'loading',
                    label: 'Loading 加载'
                  }, {
                    value: 'message',
                    label: 'Message 消息提示'
                  }, {
                    value: 'message-box',
                    label: 'MessageBox 弹框'
                  }, {
                    value: 'notification',
                    label: 'Notification 通知'
                  }]
                }, {
                  value: 'navigation',
                  label: 'Navigation',
                  children: [{
                    value: 'menu',
                    label: 'NavMenu 导航菜单'
                  }, {
                    value: 'tabs',
                    label: 'Tabs 标签页'
                  }, {
                    value: 'breadcrumb',
                    label: 'Breadcrumb 面包屑'
                  }, {
                    value: 'dropdown',
                    label: 'Dropdown 下拉菜单'
                  }, {
                    value: 'steps',
                    label: 'Steps 步骤条'
                  }]
                }, {
                  value: 'others',
                  label: 'Others',
                  children: [{
                    value: 'dialog',
                    label: 'Dialog 对话框'
                  }, {
                    value: 'tooltip',
                    label: 'Tooltip 文字提示'
                  }, {
                    value: 'popover',
                    label: 'Popover 弹出框'
                  }, {
                    value: 'card',
                    label: 'Card 卡片'
                  }, {
                    value: 'carousel',
                    label: 'Carousel 走马灯'
                  }, {
                    value: 'collapse',
                    label: 'Collapse 折叠面板'
                  }]
                }]
              },
                {
                value: 'ziyuan',
                label: '资源',
                children: [{
                  value: 'axure',
                  label: 'Axure Components'
                }, {
                  value: 'sketch',
                  label: 'Sketch Templates'
                }, {
                  value: 'jiaohu',
                  label: '组件交互文档'
                }]
              }
              ]
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'amount',
              label: '打包数量：',
              rules: [
                djForm.rules.required('打包数量不能为空')
              ],
            },
            attrs: {
              type: 'number',
              maxlength: 10,
            },
          },
        ],
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 0,
        dialogTypeIsAdd: null,
        dialogVisible: false
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
      getTableData(data) {
        cpqsService.list(data).then((res) => {
          this.tableData = res.list;
        });
      },
      deleteRow(row) {
        this.$confirm('确定删除该条内容？', '', {
          type: 'warning',
          showClose: false,
        }).then(() => {
          cpqsService.list({
            id: row.id
          }).then((res) => {
            this.$message('禁用成功', 'success');
            this.getTableData();
          });
        });
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.formData = this.$method.deepClone(row);
        this.formData.lengxing = ["zujian", "basic", "layout"];
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
        this.$refs.form.validate(()=>{
          cpqsService.list(this.formData).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        });
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.formData = {
          name: '',
          code: '',
          lengxing: '',
          amount: '',
        };
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
        border-right: 1px solid #EBEEF5;
      }
    }
  }

  .cpqs-dialog {
    width: 50vw;
    padding-top: 20px;
  }
</style>
