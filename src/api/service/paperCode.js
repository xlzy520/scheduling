import {paperCode} from '../base-service/service';

export default {
  list(data) {
    return paperCode('/list.do', data);
  },
  getAllList(data) {
    return paperCode('/getPaperCodes.do', data);
  },
  edit(data) {
    return paperCode('/modifyCode.do', data);
  },
  getPaperCodeByid(data) {
    return paperCode('/getCodeByid.do', data);
  },
  changeEffected(data) {
    return paperCode('/changeEffected.do', data);
  },
  add(data) {
    return paperCode('/addCode.do', data);
  },
};
