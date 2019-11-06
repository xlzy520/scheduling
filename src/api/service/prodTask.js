import {prodTask} from '../base-service/service';
import methods from "../../utils/methods";
import { orderKeys } from "../../utils/system/constant/dataKeys";
const { getMaterialSize, getProductSize, handleTime, getOriginKey, getLayerFluteType, getOrderTip, getMergeStatus } = methods;
export default {
  list(data) {
    return prodTask('/pageSearch.do', data).then(res=>{
      let list = res.list || [];
      list.forEach((obj)=>{
        obj['fluteTypeAndLayers'] = getLayerFluteType(obj, false, ['layer']);
        obj['orderTipLabel'] = getOrderTip(obj, true);
        obj[orderKeys.productSize] = getProductSize(obj);
        obj[orderKeys.materialSize] = getMaterialSize(obj);
        handleTime(obj, orderKeys.affluxTime, 'YYYY-MM-DD');
        return obj;
      });
      return res;
    });
  },
  removeOrder(data) {
    return prodTask('/removeOrder.do', data);
  },
  findDetailByProduceOrderNumber(data) {
    return prodTask('/findDetailByProduceOrderNumber.do', data, 'get');
  },
  toProduceManager(data) {
    return prodTask('/toProduceManager.do', data);
  },
  exportExcel(data) {
    return prodTask('/exportExcel.do', data, 'download_post');
  },
};
