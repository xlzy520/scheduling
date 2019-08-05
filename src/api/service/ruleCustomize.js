import {ruleCustomize} from '../base-service/service';

export default {
  list(data) {
    return ruleCustomize('/getAllRule.do', data);
  },
  changeEffected(data) {
    return ruleCustomize('/changeEffected.do', data);
  },
  getRuleDetail(data) {
    return ruleCustomize('/getRuleDetail.do', data,'get');
  },
  addStackRule(data) {
    return ruleCustomize('/addStackRule.do', data);
  },
  modifyStackRule(data) {
    return ruleCustomize('/modifyStackRule.do', data);
  },
  addPackRule(data) {
    return ruleCustomize('/addPackRule.do', data);
  },
  modifyPackRule(data) {
    return ruleCustomize('/modifyPackRule.do', data);
  },
  getAllLine(data) {
    return ruleCustomize('/getAllLine.do', data);
  },
};
