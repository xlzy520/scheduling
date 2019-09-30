import MapObject from './mapObject';
let fluteTypeLayer = [
  {
    label: '3层',
    fluteType: [
      {label: '单A瓦'},
      {label: '单B瓦'},
      {label: '单C瓦'},
      {label: '单E瓦'},
      {label: '单F瓦'}
    ]
  },
  {
    label: '5层',
    fluteType: [
      {label: 'AA瓦'},
      {label: 'AB瓦'},
      {label: 'AC瓦'},
      {label: 'AE瓦'},
      {label: 'BB瓦'},
      {label: 'BC瓦'},
      {label: 'BE瓦'},
      {label: 'CC瓦'},
      {label: 'CE瓦'},
      {label: 'EE瓦'}
    ]
  },
  {
    label: '7层',
    fluteType: [
      {label: 'BAA瓦'},
      {label: 'BAB瓦'},
      {label: 'BAC瓦'},
      {label: 'BCA瓦'},
      {label: 'BCB瓦'},
      {label: 'BCC瓦'},
      {label: 'BEE瓦'},
      {label: 'CAC瓦'},
      {label: 'CEB瓦'},
      {label: 'EBA瓦'},
      {label: 'EBC瓦'}
    ]
  }
];
function getValueByLabel(arr, children = 'fluteType') {
  arr.forEach(obj=>{
    obj.value = obj.label.replace(/[\u4e00-\u9fa5]/g, '');
    if (Array.isArray(obj[children])) {
      getValueByLabel(obj[children]);
    }
  });
}
getValueByLabel(fluteTypeLayer);
const fluteType = fluteTypeLayer.reduce((arr, obj)=>{
  return arr.concat(obj.fluteType);
  // return arr.concat(obj.fluteType.map(obj=>({ label: obj.label, value: obj.label.replace(/[\u4e00-\u9fa5]/g, '') })));
}, [{label: '全部', value: 'all'}]);

export default {
  orderTip: new MapObject({
    'all': {
      label: '全部',
      value: ''
    },
    'ordinary': {
      label: '普通',
      value: 0
    },
    'urgent': {
      label: '加急',
      omit: '急',
      value: 1
    },
    'delay': {
      label: '延期',
      omit: '延',
      value: 2
    },
  }),
  productStatus: new MapObject({
    'all': {
      label: '全部',
      value: ''
    },
    'waitImport': {
      label: '待导入',
      value: 0
    },
    'arranging': {
      label: '排单中',
      value: 1
    },
    'producing': {
      label: '生产中',
      value: 2
    },
    'intoLocated': {
      label: '已打包',
      value: 4
    },
    'canceled': {
      label: '生产取消',
      value: 3
    },
  }),
  orderStatus: new MapObject({
    'waitImport': {
      label: '待导入',
      value: '1'
    },
    'producting': {
      label: '生产中',
      value: '2'
    },
    'apartIntoLocation': {
      label: '部分入库',
      value: '3'
    },
    'readyIntoLocation': {
      label: '已入库',
      value: '4'
    },
    'canceled': {
      label: '已取消',
      value: '5'
    }
  }),
  orderType: new MapObject({
    'all': {
      label: '全部',
      value: ''
    },
    'groupPurchase': {
      label: '平台纸板订单',
      value: 0
    },
    'abnormal': {
      label: '生产补单',
      value: 12
    },
    'merge': {
      label: '合并订单',
      value: 13
    },
    'preparingMaterials': {
      label: '备料订单',
      value: 14
    },
    'paperBoard': {
      label: '线下纸板订单',
      value: 1
    },
    'paperBoardSupplement': {
      label: '线下纸板补单',
      value: 2
    },
    'groupPurchaseSupplement': {
      label: '平台纸板补单',
      value: 3
    },
    'paperBox': {
      label: '线下纸箱订单',
      value: 4
    },
    'paperBoxSupplement': {
      label: '线下纸箱补单',
      value: 5
    },
  }),
  linePressingWay: new MapObject({
    'not': {
      label: '不压线',
      value: '0'
    },
    'normal': {
      label: '普通压线',
      value: '1'
    },
    'inner': {
      label: '内压线',
      value: '2'
    },
    'transverse': {
      label: '横压线',
      value: '3'
    }
  }),
  storageType: new MapObject({
    'purchase': {
      label: '采购入库',
      value: '采购入库'
    },
    'prodWithdrawal': {
      label: '生产退料',
      value: '生产退料'
    },
    'noBarWithdrawal': {
      label: '无条码退料',
      value: '无条码退料'
    },
    'inventorySurplus': {
      label: '盘盈入库',
      value: '盘盈入库'
    },
    'allocation': {
      label: '调拨入库',
      value: '调拨入库'
    }
  }),
  outStockType: new MapObject({
    'Sale': {
      label: '销售出库',
      value: '销售出库'
    },
    'returnGoods': {
      label: '采购退货',
      value: '采购退货'
    },
    'prodProvide': {
      label: '生产领料',
      value: '生产领料'
    },
    'scrap': {
      label: '报废出库',
      value: '报废出库'
    },
    'losses': {
      label: '盘亏出库',
      value: '盘亏出库'
    },
    'allocation': {
      label: '调拨出库',
      value: '调拨出库'
    }
  }),
  paperType: new MapObject({
    'normal': {
      label: '普通瓦楞',
      value: 1,
    },
    'height': {
      label: '高强瓦楞',
      value: 2,
    },
    'cow': {
      label: '牛卡',
      value: 3,
    },
    'regenerate': {
      label: '再生',
      value: 4,
    }
  }),
  mergeStatus: new MapObject({
    'wait': {
      label: '待合并',
      value: '0',
    },
    'already': {
      label: '已合并',
      value: '1',
    }
  }),
  stackUpTip: new MapObject({
    'first': {
      label: '首单堆叠',
      value: 1,
    },
    'multiple': {
      label: '多单堆叠',
      value: 2,
    },
    'no': {
      label: '不叠单',
      value: '',
    }
  }),
  basketType: new MapObject({
    'big': {
      label: '大吊篮',
      value: 1,
    },
    'small': {
      label: '小吊篮',
      value: 2,
    }
  }),
  orderCutNumber: [1, 2, 3, 4, 5, 6, 7],
  fluteTypeLayer,
  fluteType
};
