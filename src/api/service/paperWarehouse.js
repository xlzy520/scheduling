import {paperWarehouse} from '../base-service/service';
import {warehouse} from '../base-service/service';
import methods from "../../utils/methods";
import { cylinderKeys } from "../../utils/system/constant/dataKeys";
const { cloneData } = methods;
export default {
  getPaperWarehouse(data) {
    if (data) {
      Object.assign(data, {
        type: 6,
        pageSize: 100000000,
        pageNo: 1
      });
    }
    return warehouse('/getWarehouseByAttribute.do', data);
  },
  getAreaAllList(data) {
    return warehouse('/getAreaAllList.do', data);
  },
  getTubeNumber(data) {
    return paperWarehouse('/generateTubeNumber.do', data, 'get');
  },
  getReceiptId(data) {
    return paperWarehouse('/generateNumber.do', data);
  },
  setAmount(data) {
    return paperWarehouse('/setAmount.do', data);
  },
  editOutStorage(data) {
    return paperWarehouse('/modifyPaperOutStorage.do', data);
  },
  editInStorage(data) {
    return paperWarehouse('/modifyPaperInStorage.do', data);
  },
  getSupplierList(data) {
    return paperWarehouse('/getSupplierList.do', data, 'get');
  },
  getPaperTube(data) {
    return paperWarehouse('/getPaperTube.do', data, 'get');
  },
  getPaperOutStorage(data) {
    return paperWarehouse('/getPaperOutStorage.do', cloneData([cylinderKeys.receiptNumber, 'cancelToken'], {}, data), 'get');
  },
  getPaperInStorage(data) {
    return paperWarehouse('/getPaperInStorage.do', cloneData([cylinderKeys.receiptNumber, 'cancelToken'], {}, data), 'get');
  },
  listInStorage(data) {
    return paperWarehouse('/getPaperInStorageList.do', data);
  },
  listOutStorage(data) {
    return paperWarehouse('/getPaperOutStorageList.do', data);
  },
  exportPaperOutStorage(data) {
    return paperWarehouse('/exportPaperOutStorage.do', data, 'download_post');
  },
  exportPaperInStorage(data) {
    return paperWarehouse('/exportPaperInStorage.do', data, 'download_post');
  },
  addOutStorage(data) {
    return paperWarehouse('/addPaperOutStorage.do', data);
  },
  addInStorage(data) {
    return paperWarehouse('/addPaperInStorage.do', data);
  },
  getDepartment(data) {
    return paperWarehouse('/getDepartment.do', data, 'get').then(res=>{
      return (res.list || []).map(obj=>{
        return {
          label: obj.name,
          value: obj.id
        };
      })
    });
  },
  getRole(data) {
    return paperWarehouse('/getRole.do', data, 'get').then(res=>{
      return (res.list || []).map(obj=>{
        return {
          label: obj.name,
          value: obj.id
        };
      })
    });
  },
  getMember(data) {
    return paperWarehouse('/getMember.do', data, 'get').then(res=>{
      return (res.list || []).map(obj=>{
        return {
          label: obj.name,
          value: obj.id
        };
      })
    });
  },
};
