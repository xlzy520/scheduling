import {productionLineTrim} from '../base-service/service';

export default {
  list(data) {
    return productionLineTrim('/list.do', data);
  },
  modifyWasterLineByid(data) {
    return productionLineTrim('/modifyWasterLineByid.do', data);
  },
  getWasterLineByid(data) {
    return productionLineTrim('/getWasterLineByid.do', data);
  },
  add(data) {
    return productionLineTrim('/add.do', data);
  },
  changeEffected(data) {
    return productionLineTrim('/changeEffected.do', data);
  },

};
