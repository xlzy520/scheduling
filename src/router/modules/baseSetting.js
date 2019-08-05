export default {
  path: 'baseSetting',
  meta: {
    title: '基础设置',
  },
  children: [
    {
      path: 'paperKind',
      meta: {
        title: '原纸品种',
      },
      component: 'views/baseSetting/paperKind'
    },
    {
      path: 'paperCode',
      meta: {
        title: '原纸代码',
      },
      component: 'views/baseSetting/paperCode'
    },
    {
      path: 'materialCode',
      meta: {
        title: '用料代码',
      },
      component: 'views/baseSetting/materialCode'
    },
    {
      path: 'paperSupplier',
      meta: {
        title: '原纸供应商',
      },
      component: 'views/baseSetting/paperSupplier'
    },
    {
      path: 'prodLineTrim',
      meta: {
        title: '生产线修边设置',
      },
      component: 'views/baseSetting/prodLineTrim'
    },
    {
      path: 'customerPackageQuantity',
      meta: {
        title: '客户打包数量设置',
      },
      component: 'views/baseSetting/customerPackageQuantity'
    },
    {
      path: 'ruleCustomize',
      meta: {
        title: '规则自定义',
      },
      component: 'views/baseSetting/ruleCustomize/index'
    },
    {
      path: 'productionLine',
      meta: {
        title: '生产线设置',
      },
      component: 'views/baseSetting/productionLine/index'
    },
  ],
};

