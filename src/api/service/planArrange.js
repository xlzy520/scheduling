import {planArrange} from '../base-service/service';
export default{
  list(data) {
    return planArrange('/list.do', data)
  },
  changeProdLine(data) {
    return planArrange('/changeProdLine.do', data)
  },
  calcPaperSize(data) {
    return planArrange('/calcPaperSize.do', data)
  },
  editPaperSize(data) {
    return planArrange('/editPaperSize.do', data)
  },
  sort(data) {
    return planArrange('/sort.do', data)
  },
  stackUp(data) {
    return planArrange('/stackUp.do', data)
  },
  importProd(data) {
    return planArrange('/importProd.do', data)
  },
  changeSort(data) {
    return planArrange('/changeSort.do', data)
  },
  removeOrder(data) {
    return planArrange('/removeOrder.do', data)
  },
  getOrder(data) {
    return planArrange('/getOrder.do', data)
  },
  editOrder(data) {
    return planArrange('/editOrder.do', data)
  },
  getPaperSizeList(data) {
    return planArrange('/getPaperSizeList.do', data)
  },
  changeEffect(data) {
    return planArrange('/changeEffect.do', data)
  },
  integratedMaterial(data) {
    return planArrange('/integratedMaterial.do', data)
  },
};
