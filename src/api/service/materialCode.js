import {materialCode} from '../base-service/service';

export default {
  list(data) {
    return materialCode('/list.do', data);
  },
  add(data) {
    return materialCode('/addMaterial.do', data);
  },
  edit(data) {
    return materialCode('/modifyMaterial.do', data);
  },
  getMaterialByid(data) {
    return materialCode('/getMaterialByid.do', data);
  },
  changeEffected(data) {
    return materialCode('/changeEffected.do', data);
  },
};
