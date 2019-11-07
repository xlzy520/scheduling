import {branchTask} from '../base-service/service';
import methods from "../../utils/methods";
import { orderKeys } from "../../utils/system/constant/dataKeys";
const { getMaterialSize, getProductSize, handleTime, getOriginKey, getLayerFluteType } = methods;

export default {
  list(data) {
    return branchTask('/list.do', data).then(res=>{
      res.list.forEach(item=>{
        item[orderKeys.productSize] = getProductSize(item);
        item[orderKeys.materialSize] = getMaterialSize(item);
        item['fluteTypeAndLayers'] = getLayerFluteType(item);
        handleTime(item, orderKeys.deliveryTime, 'YYYY-MM-DD');
      });
      return res;
    });
  },
  removeOrder(data) {
    return branchTask('/removeOrder.do', data);
  },
  processe(data) {
    return branchTask('/processe.do', data);
  },
  getDivideMsg(data) {
    return branchTask('/getDivideMsg.do', data).then(res=>{
      res[orderKeys.productSize] = getProductSize(res);
      res[orderKeys.materialSize] = getMaterialSize(res);
      res['fluteTypeAndLayers'] = getLayerFluteType(res);
      handleTime(res, orderKeys.deliveryTime, 'YYYY-MM-DD');
      return res;
    });
  },
};
