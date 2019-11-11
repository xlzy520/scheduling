import {planArrange} from '../base-service/service';
import methods from "../../utils/methods";
import { orderKeys } from "../../utils/system/constant/dataKeys";
const { getMaterialSize, getOriginKey, handleTime, getProductSize, getOrderTip, getLayerFluteType } = methods;
export default{
  list(data) {
    return planArrange('/selectArrangeOrder.do', data).then((res = {})=>{
      let list = res.list || [];
      list.map(obj=>{
        obj['fluteTypeAndLayers'] = getLayerFluteType(obj);
        handleTime(obj, orderKeys.deliveryTime, 'YYYY-MM-DD');
      });
      return res;
    });
  },
  changeProdLine(data) {
    return planArrange('/changeLine.do', data);
  },
  calcPaperSize(data) {
    return planArrange('/calPaperSize.do', data);
  },
  getTotalMeters(data) {
    return planArrange('/selectLength.do', data);
  },
  getOptimalSize(data) {
    return planArrange('/selectPaperSize.do', data);
  },
  editPaperSize(data) {
    return planArrange('/modifyPaperSize.do', data);
  },
  sort(data) {
    return planArrange('/sortOrder.do', data);
  },
  stackUp(data) {
    return planArrange('/stack.do', data);
  },
  importProd(data) {
    return planArrange('/importProd.do', data);
  },
  changeSort(data) {
    return planArrange('/changeSort.do', data);
  },
  removeOrder(data) {
    return planArrange('/remove.do', data);
  },
  getOrder(data) {
    return planArrange('/selectAllInfo.do', data).then(res=>{
      res[getOriginKey(orderKeys.materialSize, 'old')] = getMaterialSize(res, false, ['oldMaterialLength', 'oldMaterialWidth']);
      res[orderKeys.materialSize] = getMaterialSize(res);
      res['fluteTypeAndLayers'] = getLayerFluteType(res);
      res['orderTipLabel'] = getOrderTip(res);
      res[orderKeys.productSize] = getProductSize(res);
      handleTime(res, orderKeys.deliveryTime, 'YYYY-MM-DD');
      return res;
    });
  },
  editOrder(data) {
    return planArrange('/updateEditOrder.do', data);
  },
  editStack(data) {
    return planArrange('/updateStack.do', data);
  },
  getPaperSizeList(data) {
    return planArrange('/expectLength.do', data);
  },
  // changeEffect(data) {
  //   return planArrange('/changeEffect.do', data)
  // },
  integratedMaterial(data) {
    return planArrange('/selectMaterialLength.do', data);
  },
  exportExcel(data) {
    data.pageNo = 1;
    data.pageSize = 999999999;
    return planArrange('/exportExcel.do', data, 'download_post');
  },
  getCalcResult(data) {
    return planArrange('/getUpdateValue.do', data);
  },
};
