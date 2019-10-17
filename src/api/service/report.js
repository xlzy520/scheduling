import { report } from '../base-service/service';

export default {
  listDetail(data) {
    return report('/listDetail.do', data);
  },
  listSummary(data) {
    return report('/listSummary.do', data);
  },
  printSummary(data) {
    return report('/printSummary.do', data);
  },
  listInventory(data) {
    return report('/listInventory.do', data);
  },
  listInventoryRecord(data) {
    return report('/listInventoryRecord.do', data);
  },
  exportFile(url, data) {
    return report(`/${url}.do`, data, 'download_post');
  }
};
