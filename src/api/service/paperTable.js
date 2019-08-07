import { paperTable } from '../base-service/service';

export default {
  list(data) {
    return paperTable('/getAllRule.do', data);
  },
  changeEffected(data) {
    return paperTable('/changeEffected.do', data);
  },
  getRuleDetail(data) {
    return paperTable('/getRuleDetail.do', data,'get');
  },
};
