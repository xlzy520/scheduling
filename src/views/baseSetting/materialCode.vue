<template>
  <div class="material-code">
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
               :title="dialogTypeIsAdd?'新增用料代码': '编辑用料代码'">
      <div class="material-code-dialog">
        <div class="optional">
          <div class="optional-label">可选原纸</div>
          <div class="optional-area" @click="selectPaper($event)">
            <div class="optional-area-item" :class="formData.code.includes(code.label)?'selected': ''"
                 v-for="code in optionalPaper" :key="code.label">{{code.label}}</div>
          </div>
        </div>
        <dj-form ref="form" :form-data="formData" :form-options="formOptions" labelWidth="125px"></dj-form>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import materialCodeService from '../../api/service/materialCode';
  import {djForm} from 'djweb';

  export default {
    name: 'materialCode',
    data() {
      const validateCode = (rule, selectArr, callback) => {
        if (selectArr.length === 10) {
          callback(new Error('最多支持10个原纸组合!'));
        } else {
          callback();
        }
      };
      return {
        searchConfig: [
          {label: '用料代码：', key: 'code', type: 'input'},
          {label: '平台材料名称：', key: 'platformMaterialName', type: 'input'},
        ],
        tableData: [],
        tableColumns: Object.freeze([
          {label: '用料代码', prop: 'code'},
          {label: '平台材料名称', prop: 'platformMaterialName'},
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
        formData: {
          code: [],
          platformMaterialName: '',
        },
        formOptions: [
          {
            type: 'select',
            formItem: {
              prop: 'code',
              label: '用料代码',
              rules: [
                djForm.rules.required('请选择相应的用料代码'),
                { validator: validateCode, trigger: 'blur' }
                ],
            },
            attrs: {
              class: 'code',
              key: 'multiple',
              type: 'multiple',
              options: [{
                label: '普通瓦楞',
                value: 'chu',
              }, {
                label: '高强瓦楞',
                value: 'gao',
              }, {
                label: '牛卡',
                value: 'da',
              }, {
                label: '再生',
                value: 'daa',
              }],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'platformMaterialName',
              label: '平台材料名称：',
              rules: [
                djForm.rules.required('平台材料名称不能为空'),
                {required: true, pattern: /[a-zA-Z0-9]/g, message: '只可输入字母、数字', trigger: 'blur'},
              ],
            },
            attrs: {
              maxLength: 20,
            },
            listeners: {
              'input': (val) => {
                this.formData.platformMaterialName = val.toUpperCase();
              },
            },
          },
        ],
        optionalPaper: [],
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 100,
        dialogTypeIsAdd: null,
        dialogVisible: false
      };
    },
    methods: {
      selectPaper(evt) {
        const { innerText: text, className } = evt.target;
        if (text && className === 'optional-area-item') {
          this.formData.code.push(text);
        }
      },
      add() {
        this.dialogTypeIsAdd = true;
        this.dialogVisible = true;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      getTableData(data) {
        materialCodeService.list(data).then((res) => {
          this.tableData = res.list;
        });
      },
      changeStatus(row) {
        if (row.status) {
          this.$confirm('您确定禁用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            materialCodeService.list().then((res) => {
              this.$message('禁用成功', 'success');
              row.status = !row.status;
            });
          });
        } else {
          materialCodeService.list().then((res) => {
            this.$message('启用成功', 'success');
            row.status = !row.status;
          });
        }
      },
      edit(row) {
        this.dialogVisible = true;
        this.dialogTypeIsAdd = false;
        this.formData = this.$method.deepClone(row);
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
          materialCodeService.list(this.formData).then((res) => {
            this.close();
            const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
            this.$message(message, 'success');
          });
        });
      },
      close() {
        this.$refs.dialog.close();
        this.dialogVisible = false;
        this.$refs.form.resetFields();
        this.formData = {
          code: [],
          platformMaterialName: '',
        };
      },
      pageChange(option) {
        this.pageOptions = option;
        this.$refs.search.search();
      },
    },
    mounted() {
      let mock = [];
      for (let i = 0; i < 20; i++) {
        mock.push({label: 'DJ88' + String(i), value: 'DJ88' + String(i)});
      }
      this.optionalPaper = mock;
      this.$set(this.formOptions[0].attrs, 'options', mock);
    },
    created() {
      this.getTableData();
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .operation {
    a {
      margin-right: 15px;
      cursor: pointer;
    }
  }

  .material-code-dialog {
    width: 50vw;
    padding-top: 20px;
    @{deep} .dj-form .el-form-item{
      .el-form-item__label{
        float: unset;
      }
      .el-select.code{
        pointer-events: none;
      }
      .el-form-item__content{
        width: 100%;
        margin-left: 0!important;
      }
      .el-input__suffix{
        display: none;
      }
      .el-select__tags .el-tag{
        pointer-events: visible;
      }
    }
    @{deep} .optional{
      width: 100%;
      min-height: 120px;
      margin-bottom: 20px;
      &-label{
        font-size: 14px;
        color: #606266;
        line-height: 34px;
        padding: 0 12px 0 0;
        margin: 0;
      }
      &-area{
        width: 100%;
        min-height: 80px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        border: 1px solid #eee;
        border-radius: 4px;
        &-item{
          text-align: center;
          font-size: 16px;
          min-width: 60px;
          height: 24px;
          line-height: 24px;
          padding: 5px 10px;
          margin: 5px;
          color: #747579;
          background: #f1f2f6;
          border-radius: 5px;
          cursor: pointer;
          user-select: none;
          &.selected{
            pointer-events: none;
            cursor: not-allowed;
            color: #45464a;
            background: #c2c3c7;
          }
        }
      }
    }
  }
</style>
