import {ProblemList} from "./ProblemList";
/**
 * Created by Spacaru on 10/22/2017.
 */
export class PhoneList {
  phoneBrand = '';
  phoneModel = '';
  imei = '';
  phoneColor = '';
  phoneQuantity = 1;
  problemList: ProblemList[]  = [];
  observation = '';
  deliveredDate: string;
  isRepaird = false;
}
