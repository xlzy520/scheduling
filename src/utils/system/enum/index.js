import MapObject from './mapObject';
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
  })
};
