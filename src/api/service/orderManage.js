import {orderManage} from '../base-service/service';
import methods from "../../utils/methods";
import { orderKeys } from "../../utils/system/constant/dataKeys";
const { getMaterialSize, handleTime, getVFormula, getProductSize } = methods;
export default {
  list(data) {
    return orderManage('/selectPlan.do', data);
  },
  importOrder(data) {
    return orderManage('/importProduceOrder.do', data);
  },
  importAllOrder(data) {
    return orderManage('/importAllProduceOrder.do', data);
  },
  getOrderById(data) {
    return orderManage('/selectPlanById.do', data).then((res)=>{
      res['longitudinalPressure'] = getVFormula(res, orderKeys.longitudinalPressure) || [];
      res[orderKeys.materialSize] = getMaterialSize(res, true);
      res['fluteTypeAndLayers'] = [res[orderKeys.layer] + '', res[orderKeys.fluteType]];
      res[orderKeys.productSize] = getProductSize(res);
      handleTime(res, orderKeys.deliveryTime, 'YYYY-MM-DD');
      // _res[orderKeys.deliveryTime] = dayjs(res[orderKeys.deliveryTime]).format('YYYY-MM-DD');
      return res;
    });
  },
  edit(data) {
    return orderManage('/updatePreOrder.do', data);
  },
  add(data) {
    return orderManage('/insertPreOrder.do', data);
  },
  orderStatistics(data) {
    return orderManage('/orderStatistics.do', data);
  }
};
