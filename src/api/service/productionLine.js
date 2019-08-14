import {productionLine} from '../base-service/service';

export default {
  list() {
    return productionLine('/list.do');
  },
  changeLineEffected(data) {
    return productionLine('/changeLineEffected.do', data);
  },
  addLine(data) {
    return productionLine('/addLine.do', data);
  },
  showAllLine() {
    return productionLine('/showAllLine.do');
  },
  modifyLine(data) {
    return productionLine('/modifyLine.do', data);
  },
};
