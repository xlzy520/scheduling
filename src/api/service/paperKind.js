import {paperKind} from '../base-service/service';

export default {
  list(data) {
    return paperKind('/findByCondition.do', data);
  },
  getPaperByid(data) {
    return paperKind('/getPaperVarietyMsgByid.do', data);
  },
  edit(data) {
    return paperKind('/modifiedPaperVariety.do', data);
  },
  add(data) {
    return paperKind('/add.do', data);
  },
  changeEffected(data) {
    return paperKind('/changeEffected.do', data);
  },
};
