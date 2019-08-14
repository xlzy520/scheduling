import {orderManage} from '../base-service/service';

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
    return orderManage('/selectPlanById.do', data);
  },
  edit(data) {
    return orderManage('/updatePreOrder.do', data);
  },
  add(data) {
    return orderManage('/insertPreOrder.do', data);
  },
};
