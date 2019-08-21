import {plannedMerger} from '../base-service/service';
export default{
  list(params) {
    return plannedMerger('/list.do', params);
  },
  mergeOrder(params) {
    return plannedMerger('/mergeOrder.do', params);
  },
  cancelMergeOrder(params) {
    return plannedMerger('/cancelMergeOrder.do', params);
  },
  moveToSort(params) {
    return plannedMerger('/moveToSort.do', params);
  },
  moveToBranch(params) {
    return plannedMerger('/moveToBranch.do', params);
  },
  removeOrder(params) {
    return plannedMerger('/removeOrder.do', params);
  },
  getOrderById(params) {
    return plannedMerger('/getOrderById.do', params);
  },
  edit(params) {
    return plannedMerger('/edit.do', params);
  },
  editLinePress(params) {
    return plannedMerger('/editLinePress.do', params);
  }
};
