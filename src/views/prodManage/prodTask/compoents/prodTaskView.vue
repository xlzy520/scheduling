<template>
  <dj-dialog title="查看" ref="dialog" @close="close" :hasFooter="false">
    <div class="content" v-loading="loading">
      <div class="item" v-for="form in formOptions">
        <div>{{form.label}}</div>
        <dj-form :form-data="formData" ref="form" :form-options="form.formBlock" :column-num="3"></dj-form>
      </div>
    </div>
  </dj-dialog>
</template>

<script>
  import {djForm} from 'djweb';
  import formRules from "../../../baseSetting/formRules";
  import prodTaskService from '@/api/service/prodTask';
export default {
  name: 'prodTaskView',
  data() {
    return {
      formData: {},
      formOptions: [
        {
          label: '订单信息',
          formBlock: [
            {formItem: {prop: 'grouponOrderNumber', label: '订单编号：'}},
            {formItem: {prop: 'arrivetime', label: '订单交期：'}},
            {formItem: {prop: 'customerName', label: '客户名称：'}},
            {formItem: {prop: 'orderSort', label: '订单排序：'}},
            {formItem: {prop: 'orderMark', label: '订单标记：'}},
          ]
        },
        {
          label: '产品信息',
          formBlock: [
            {formItem: {prop: 'produceOrderNumber', label: '生产编号：'}},
            {formItem: {prop: 'pieceAmount', label: '订单数量：'}},
            {formItem: {prop: 'materialCode', label: '用料代码：'}},
            {formItem: {prop: 'tilemodel', label: '瓦楞楞型：'}},
            {formItem: {prop: 'chanpingguige', label: '产品规格：'}},
            {formItem: {prop: 'xialiaoguige', label: '下料规格：'}},
            {formItem: {prop: 'stavetype', label: '压线方式：'}},
            {formItem: {prop: 'hformula', label: '横压公式：'}},
          ]
        },
        {
          label: '最终生产信息',
          formBlock: [
            {formItem: {prop: 'zuiyoumenfu', label: '最优门幅：'}},
            {formItem: {prop: 'zhongdaoshu', label: '单台纵切刀数：'}},
            {formItem: {prop: 'daoshu', label: '刀数：'}},
            {formItem: {prop: 'shengchanshuliang', label: '生产数量：'}},
            {formItem: {prop: 'vformula', label: '纵压公式：'}},
            {formItem: {prop: 'qiekuan', label: '切宽：'}},
            {formItem: {prop: 'mishu', label: '订单米数：'}},
            {formItem: {prop: 'xiubian', label: '修边（mm）：'}},
            {formItem: {prop: 'liyonglv', label: '利用率（%）：'}},
            {formItem: {prop: 'diedanbiaoji', label: '叠单标志：'}},
          ]
        },
        {
          label: '原生产信息',
          formBlock: [
            {formItem: {prop: 'zuiyoumenfuSource', label: '最优门幅：'}},
            {formItem: {prop: 'zhongdaoshuSource', label: '单台纵切刀数：'}},
            {formItem: {prop: 'daoshuSource', label: '刀数：'}},
            {formItem: {prop: 'shengchanshuliangSource', label: '生产数量：'}},
            {formItem: {prop: 'vformulaSource', label: '纵压公式：'}},
            {formItem: {prop: 'qiekuanSource', label: '切宽：'}},
            {formItem: {prop: 'mishuSource', label: '订单米数：'}},
            {formItem: {prop: 'xiubianSource', label: '修边（mm）：'}},
            {formItem: {prop: 'liyonglvSource', label: '利用率（%）：'}},
            {formItem: {prop: 'diedanbiaojiSource', label: '叠单标志：'}},
          ]
        },
      ],
      loading: false
    };
  },
  methods: {
    orderSort() {
      this.$refs.form.validate(()=>{
        this.loading = true;
        this.dj_api_extend(prodTaskService.processe, this.formData).then(() => {
          this.$message('调整排序成功', 'success');
          this.close();
          this.$emit('confirm');
        }).finally(() => {
          this.loading = false;
        });
      });
    },
    close () {
      this.formData = {}
      this.$emit('close');
    },
    open() {
      this.$refs.dialog.open();
    },
    initForm(){
      // const formKeys = this.formOptions.reduce((pre, cur)=>{
      //   return pre.concat(cur.formBlock.map(b=>b.formItem.prop))
      // }, [])
      this.formOptions.map(v=>v.formBlock.map(b=>{
        this.formData[b.formItem.prop] = ''
      }))
    }
  },
  mounted() {
    this.initForm()
  }
};
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  .content{
    width: 1140px;
    .item{
      border-bottom: 1px solid #EBEEF5;
      margin-top: 20px;
      padding-bottom: 16px;
    }
    @{deep} .dj-form{
      .el-form-item{
        margin-bottom: 0;
        margin-top: 0;
      }
    }
  }
</style>
