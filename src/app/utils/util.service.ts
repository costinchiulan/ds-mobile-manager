
import {Injectable} from "@angular/core";
import {isUndefined} from "util";

@Injectable()
export class UtilService {

  check(x) {
    if (x == null) {
      return false;
    }

    if (x === null) {
      return false;
    }

    if (typeof x === 'undefined') {
      return false;
    }
    return true;
  }
  checkIsOther(part) {
    if(part === 3) {
      return true;
    }
    else{
      return false;
    }
  }

  containsObject(partName, list){
    var fireArr = [];
    var arr = [];
    var maxId = '';
    list.subscribe(items =>{
      items.forEach(snapshot => {
        fireArr.push({partName: snapshot.name, id: snapshot.id})
      })
      maxId = Math.max.apply(Math,fireArr.map(function(o){return o.id;}))
      arr = fireArr;
    })
    var found = arr.some(function (el) {
      return el.partName === partName;

    })
    if(!found) {
      return maxId;
    }
    return null;
  }
}