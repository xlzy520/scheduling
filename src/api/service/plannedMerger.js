import {plannedMerger} from '../base-service/service';
import methods from "../../utils/methods";
import { orderKeys } from "../../utils/system/constant/dataKeys";
const { getMaterialSize, getProductSize, handleTime, getOriginKey, getLayerFluteType, getOrderTip, getMergeStatus } = methods;
export default{
  list(params) {
    return plannedMerger('/getMergeList.do', params).then(res=>{
      let list = res.list || [];
      function handleData(obj) {
        obj['fluteTypeAndLayers'] = getLayerFluteType(obj);
        obj['orderTipLabel'] = getOrderTip(obj, true);
        obj['mergeStatusLabel'] = getMergeStatus(obj);
        obj[orderKeys.productSize] = getProductSize(obj);
        obj[orderKeys.materialSize] = getMaterialSize(obj);
      }
      list.forEach((obj)=>{
        if (Array.isArray(obj.childList)) {
          obj.childList.forEach(item=>{
            item.isChild = true;
            item['table_level'] = 1;
            handleData(item);
          });
        }
        obj.childNum = (obj.childList || []).length;
        handleData(obj);
        // obj[orderKeys.materialSize] = getMaterialSize(obj);
        // obj[orderKeys.productSize] = getProductSize(obj);
        return obj;
      });
      return res;
    });
  },
  mergeOrder(params) {
    return plannedMerger('/addMergeOrder.do', params);
  },
  cancelMergeOrder(params) {
    return plannedMerger('/cancelMergeOrder.do', params);
  },
  // moveOrder(params) {
  //   return plannedMerger('/moveOrder.do', params);
  // },
  moveToBranch(params) {
    return plannedMerger('/moveDivide.do', params);
  },
  moveToSort(params) {
    return plannedMerger('/moveSort.do', params);
  },
  removeOrder(params) {
    return plannedMerger('/removeOrder.do', params);
  },
  getOrderById(params) {
    return plannedMerger('/getOrderDetail.do', params).then((res = {})=>{
      let list = res.list || [res, ...(res.childList || [])];
      list.forEach((obj)=>{
        // if (Array.isArray(res.childList)) {
        //   res.childList.forEach(item=>{
        //     item.isChild = true;
        //   })
        // }
        // obj.childNum = (obj.childList || []).length;
        obj[orderKeys.materialSize] = getMaterialSize(obj);
        obj[orderKeys.productSize] = getProductSize(obj);
        obj['fluteTypeAndLayers'] = getLayerFluteType(res);
        res['orderTipLabel'] = getOrderTip(res);
        handleTime(obj, [orderKeys.deliveryTime, orderKeys.mergeTime], 'YYYY-MM-DD');
        return obj;
      });
      let main = res;
      // obj[orderKeys.materialSize] = getMaterialSize(obj);
      // obj[orderKeys.productSize] = getProductSize(obj);
      // obj[orderKeys.deliveryTime] = dayjs(obj[orderKeys.deliveryTime]).format('YYYY-MM-DD HH:mm:ss');
      return {main, list};
    });
  },
  getOriginalPressLine(params) {
    return plannedMerger('/getOriginalPressLine.do', params, 'get').then(res=>{
      res['originalMaterialSize'] = getMaterialSize(res);
      return res;
    });
  },
  getModifyOrder(params) {
    return plannedMerger('/getModifyOrder.do', params).then((res = {})=>{
      res[getOriginKey(orderKeys.materialSize)] = getMaterialSize(res);
      res[getOriginKey(orderKeys.materialLength)] = res[orderKeys.materialLength];
      res[getOriginKey(orderKeys.materialWidth)] = res[orderKeys.materialWidth];
      res[getOriginKey(orderKeys.orderAmount)] = res[orderKeys.orderAmount];
      return res;
    });
  },
  edit(params) {
    return plannedMerger('/modifyMergeOrder.do', params);
  },
  editLinePress(params) {
    return plannedMerger('/adjustPressLine.do', params);
  },
  judgeRule(params) {
    return plannedMerger('/judgeMergeOrder.do', params);
  }
};
