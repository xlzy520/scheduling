import {paperWarehouse} from '../base-service/service';

export default {
  getPaperWarehouse(data) {
    if (data) {
      Object.assign(data, {
        type: 6,
        pageSize: 100000000,
        pageNo: 1
      });
    }
    return paperWarehouse('/getWarehouseByAttribute.do', data);
  },
  getAreaAllList(data) {
    return paperWarehouse('/getAreaAllList.do', data);
  },
};
