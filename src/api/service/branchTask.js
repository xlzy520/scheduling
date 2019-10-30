import {branchTask} from '../base-service/service';
import methods from "../../utils/methods";
import { orderKeys } from "../../utils/system/constant/dataKeys";
const { getMaterialSize, getProductSize, handleTime, getOriginKey } = methods;

export default {
  list(data) {
    return branchTask('/list.do', data).then(res=>{
      res.list.forEach(item=>{
        item[orderKeys.productSize] = getProductSize(item);
        item[orderKeys.materialSize] = getMaterialSize(item);
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
    return branchTask('/getDivideMsg.do', data);
  },
};
