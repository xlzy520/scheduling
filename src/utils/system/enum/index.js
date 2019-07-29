import MapObject from './mapObject';
const fluteTypeLayer = [
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
      {label: 'EBA'},
      {label: 'EBC瓦'}
    ]
  }
];
const fluteType = fluteTypeLayer.reduce((arr, obj)=>{
  return arr.concat(obj.fluteType.map(obj=>({ lable: obj.label, value: obj.label })));
}, [{label: '全部', value: ''}]);

export default {
  orderTip: new MapObject({
    'all': {
      label: '全部',
      value: 0
    },
    'urgent': {
      label: '加急',
      value: 1
    },
    'delay': {
      label: '延期',
      value: 2
    },
    'ordinary': {
      label: '普通',
      value: 3
    },
  }),
  productStatus: new MapObject({
    'all': {
      label: '全部',
      value: '-1'
    },
    'waitImport': {
      label: '待导入',
      value: '0'
    },
    'arranging': {
      label: '排单中',
      value: '1'
    },
    'producing': {
      label: '生产中',
      value: '2'
    },
    'apartIntoLocation': {
      label: '部分入库',
      value: '21'
    },
    'intoLocated': {
      label: '已入库',
      value: '4'
    },
    'canceled': {
      label: '已取消',
      value: '6'
    },
  }),
  orderType: new MapObject({
    'all': {
      label: '全部',
      value: '-1'
    },
    'groupPurchase': {
      label: '团购订单',
      value: '0'
    },
    'carton': {
      label: '纸箱订单',
      value: '1'
    },
    'offline': {
      label: '线下纸板订单',
      value: '2'
    },
    'preparingMaterials': {
      label: '备料订单',
      value: '3'
    },
    'abnormal': {
      label: '异常补单',
      value: '4'
    }
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
      value: '1'
    },
    'prodWithdrawal': {
      label: '生产退料',
      value: '2'
    },
    'noBarWithdrawal': {
      label: '无条码退料',
      value: '3'
    },
    'inventorySurplus': {
      label: '盘盈入库',
      value: '4'
    },
    'allocation': {
      label: '调拨入库',
      value: '5'
    }
  }),
  fluteTypeLayer,
  fluteType
};
