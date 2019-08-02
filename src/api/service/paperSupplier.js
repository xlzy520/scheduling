import {paperSupplier} from '../base-service/service';

export default {
  list(data) {
    return paperSupplier('/getSupplierList.do', data);
  },
  add(data) {
    return paperSupplier('/addSupplier.do', data);
  },
  edit(data) {
    return paperSupplier('/modifySupplier.do', data);
  },
  getSupplierById(data) {
    return paperSupplier('/getSupplier.do', data, 'get');
  },
};
