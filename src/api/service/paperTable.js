import { paperTable } from '../base-service/service';

export default {
  listDetail(data) {
    return paperTable('/listDetail.do', data);
  },
  listSummary(data) {
    return paperTable('/listSummary.do', data);
  },
  printSummary(data) {
    return paperTable('/printSummary.do', data);
  },
  listInventory(data) {
    return paperTable('/listInventory.do', data);
  },
  listInventoryRecord(data) {
    return paperTable('/listInventoryRecord.do', data);
  },
};
