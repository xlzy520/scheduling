import {planArrange} from '../base-service/service';
export default{
  getAllFluteType() {
    return planArrange('/getAllFluteType.do')
  },
  getRecommendProdlines() {
    return planArrange('/getRecommendProdlines.do')
  }
};
