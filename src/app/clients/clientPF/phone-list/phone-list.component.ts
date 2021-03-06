import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PhoneCascadeService} from '../../../shared/phone-cascade.service';
import {Observable} from 'rxjs/Observable';
import {UtilService} from "../../../utils/util.service";
import {forbiddenStringInput} from "../../../shared/forbiddenStringInput";
import {ProblemPrice} from "../../../model/ProblemPrice";
import {PhoneListService} from "./phone-list.service";

@Component({
  selector: 'app-phone-list',
  templateUrl: 'phone-list.component.html',
  providers: [PhoneCascadeService]
})
export class PhoneListComponent implements OnInit {
  @Input('group') phoneListGroup: FormGroup;
  @Input('clientPFForm') clientPFForm: FormGroup;
  @Output('change') phoneItem = new EventEmitter<any>();

  newItem: any;
  mainArray: Array<any> = [];
  phoneBrandsArray: any = [];
  phoneModelsArray: any = [];
  modelsArray: any = [];
  problemsPriceList: any = [];
  isRequired = false;
  isRequiredModel = false;
  newBrandNameExists = false;
  newModelNameExists = false;
  selectedModel = 'iPhone 7 Plus';
  selectedBrand = 'Iphone';
  partName: string;
  constructor(private fb: FormBuilder, private _utilService: UtilService,
              private _phoneListService: PhoneListService) {
  }

  ngOnInit() {
    this.populateAllDropDowns();
    this.initBrandModelList();
    this.addProblem();
  }

  private populateAllDropDowns() {
    this._phoneListService.getBrandList().subscribe(phoneModels => {
      this.phoneBrandsArray = [];
      phoneModels.forEach(snapshot => {
        this.phoneBrandsArray.push({label: snapshot.name, value: snapshot.name});
      });
    });
    this._phoneListService.getModelList().subscribe(phoneBrands => {
      this.phoneModelsArray = [];
      phoneBrands.forEach(snapshot => {
        this.phoneModelsArray.push({label: snapshot.name, value: snapshot.name, phoneId: snapshot.phoneId});
        this.modelsArray = this.phoneModelsArray;
      });
      this.phoneModelsArray = this.phoneModelsArray.filter((item) => item.phoneId === "iphone" || item.phoneId === 'altele');
    });
    this._phoneListService.getPartPrices().subscribe(parts => {
      this.problemsPriceList = [];
      parts.forEach(snapshot => {
        this.problemsPriceList.push(new ProblemPrice(snapshot.problemId, snapshot.phoneBrand, snapshot.phoneModel, snapshot.price));
      })
    })
  }

  private initBrandModelList() {
    this.newItem = {
      phoneId: "iphone",
      modelId: "iPhone 7 Plus"
    };
    this.mainArray.push(this.newItem);
  }

  addProblem() {
    const problemArray = <FormArray>this.phoneListGroup.controls['problems'];
    const newProblem = this.initProblem();
    problemArray.push(newProblem);
    this.setPriceForNewPart(newProblem);
  }

  /**
   * Method that set the price for the initial problem 'Sticla' on component init and when
   * new part is added from the GUI
   *
   * @param {FormArray} problemArray
   */
  private setPriceForNewPart(newProblem: FormGroup) {
    this._phoneListService.getPartPrices().subscribe(parts => {
      this.problemsPriceList = [];
      parts.forEach(snapshot => {
        this.problemsPriceList.push(new ProblemPrice(snapshot.problemId, snapshot.phoneBrand, snapshot.phoneModel, snapshot.price));
      })
      const that = this;
      const results = this.problemsPriceList.filter(function (part) {
        return part._phoneBrand.toLowerCase() === that.selectedBrand.toLowerCase()
          && part._phoneModel.toLowerCase() === that.selectedModel.toLowerCase()
          && part._problemId.toLowerCase() === 'sticla';
      })
      if (results[0] !== undefined) {
        newProblem.patchValue({pricePerPart: results[0]._price});
      }
    })
  }

  removeProblem(idx: number) {
    const problemArray = <FormArray>this.phoneListGroup.controls['problems'];
    problemArray.removeAt(idx);
  }

  private initProblem() {
    return this.fb.group({
      problem: '',
      pricePerPart: new FormControl('', [
        Validators.required,
        forbiddenStringInput(/^\\d+$/)
      ]),
    });
  }

  onSelect(phoneId) {
    const problemArray = this.phoneListGroup.controls['problems'] as FormArray;
    const firstModelOfBrandPrint = this.getFirstModelOfBrand();
    this.selectedModel = firstModelOfBrandPrint;
    this.checkIsOtherBrandModel(phoneId);
    if(this.newModel !== null) {
      this.checkIfNewModelExists(this.newModel.value)
    }
    this._phoneListService.getModelList().subscribe(phoneBrands => {
      this._phoneListService.getPartPrices().subscribe(parts => {
        this.problemsPriceList = [];
        parts.forEach(snapshot => {
          this.problemsPriceList.push(new ProblemPrice(snapshot.problemId, snapshot.phoneBrand, snapshot.phoneModel, snapshot.price));
        })
        this.phoneModelsArray = [];
        phoneBrands.forEach(snapshot => {
          this.phoneModelsArray.push({label: snapshot.name, value: snapshot.name, phoneId: snapshot.phoneId});
        });
        this.onModelSelect(firstModelOfBrandPrint);
        this.phoneModelsArray = this.phoneModelsArray.filter((item) => item.phoneId.toLowerCase() === phoneId.toLowerCase() || item.phoneId === 'altele');
        for (let i=0; i < problemArray.length; i++) {
          const that = this;
          const itemInput = <FormGroup>problemArray.at(i)
          if (firstModelOfBrandPrint !== null) { //will be null when `Altele` is selected so no price will be retrieved as it doesn't exist
            const results = this.problemsPriceList.filter(function(part) {
              return part._phoneBrand.toLowerCase() === that.selectedBrand.toLowerCase()
                && part._phoneModel.toLowerCase() === firstModelOfBrandPrint.toLowerCase()
                && part._problemId.toLowerCase() === itemInput.controls['problem'].value.toLowerCase();
            })
            if(results.length > 0) {
              if (results[0] !== undefined) {
                itemInput.controls['pricePerPart'].setValue(results[0]._price)
              } else {
                itemInput.controls['pricePerPart'].setValue(0)
              }
            } else {
              itemInput.controls['pricePerPart'].setValue(0);
            }
          }
        }
        this.phoneItem.emit(this.phoneListGroup);
      });
    })
  }

  private getFirstModelOfBrand() {
    const firstModelId = this.modelsArray.filter(phone => phone.phoneId.toLowerCase() === this.selectedBrand.toLowerCase())
    const firsModelOfBrand = firstModelId[0] === undefined ? null : firstModelId[0].label;
    return firsModelOfBrand;
  }

  onModelSelect(modelId) {
    const problemArray = this.phoneListGroup.controls['problems'] as FormArray;
    this.checkIsOtherModel(modelId);
    const that = this;
    this._phoneListService.getPartPrices().subscribe(parts => {
      this.problemsPriceList = [];
      parts.forEach(snapshot => {
        this.problemsPriceList.push(new ProblemPrice(snapshot.problemId, snapshot.phoneBrand, snapshot.phoneModel, snapshot.price));
      })
      for (let i = 0; i < problemArray.length; i++) {
        const itemInput = <FormGroup>problemArray.at(i);
        const items = this.problemsPriceList.filter(phone => {
          return phone._phoneBrand.toLowerCase() === that.selectedBrand.toLowerCase()
            && phone._phoneModel.toLowerCase() === modelId.toLowerCase()
            && phone._problemId.toLowerCase() === itemInput.controls['problem'].value.toLowerCase();
        });
        if (items[0] !== undefined) {
          itemInput.controls['pricePerPart'].setValue(items[0]._price)
        } else {
          itemInput.controls['pricePerPart'].setValue(0);
        }
      }
    })
  }
  checkIfNewBrandExists(newBrandName) {
    if(this._utilService.isNullOrUndefined(newBrandName)) {
      this.newBrandNameExists = this._utilService.containsObject(newBrandName, this.phoneBrandsArray);
    }
  }
  checkIfNewModelExists(newModelName) {
    if(this._utilService.isNullOrUndefined(newModelName)) {
      this._phoneListService.getModelList().subscribe(phoneBrands => {
        this.phoneModelsArray = [];
        phoneBrands.forEach(snapshot => {
          this.phoneModelsArray.push({label: snapshot.name, value: snapshot.id, phoneId: snapshot.phoneId});
        });
        this.newModelNameExists = this._utilService.containsObject(newModelName, this.phoneModelsArray);
        if(!this.newModelNameExists) {
          this.phoneModelsArray = this.phoneModelsArray.filter((item) => item.phoneId === 0);
        }
      });
    }
  }
  checkIsOtherBrandModel(val) {
    this.isRequired = this._utilService.checkIsOther(val);
    if (this.isRequired) {
      this.isRequiredModel = false;
      this.phoneListGroup.addControl('newBrand',
        new FormControl('', Validators.required, this.newBrandNameValidator.bind(this)
        ));
      this.phoneListGroup.addControl('newModel',
        new FormControl('', Validators.required, this.newModelNameValidator.bind(this)
        ));
    } else {
      this.phoneListGroup.removeControl('newBrand');
      this.phoneListGroup.removeControl('newModel');
    }
  }

  checkIsOtherModel(val) {
    if(!this.isRequired) {
      this.isRequiredModel = this._utilService.checkIsOther(val);
    }
    if(this.isRequiredModel) {
      this.phoneListGroup.addControl('newSingleModel',
        new FormControl('', Validators.required, this.newSingleModelNameValidator.bind(this)
        ));
    } else {
      this.phoneListGroup.removeControl('newSingleModel');
    }
  }

  newBrandNameValidator() {
    const brandNames = this.phoneBrandsArray;
    return Observable
      .of(this._utilService.containsObject(this.newBrand.value, brandNames))
      .map(result => !result ? null : { invalid: true });
  }

  newModelNameValidator() {
    const modelNames = this.phoneModelsArray;
    const modelName = this.newModel.value;
    return Observable
      .of(this._utilService.containsObject(modelName, modelNames))
      .map(result => !result ? null : { invalid: true });
  }

  newSingleModelNameValidator() {
    const modelNames = this.phoneModelsArray;
    const modelName = this.newSingleModel.value;
    return Observable
      .of(this._utilService.containsObject(modelName, modelNames))
      .map(result => !result ? null : { invalid: true });
  }

  setPartName(val) {
    this.partName = val;
  }
  get newBrand() {
    //noinspection TypeScriptUnresolvedFunction
    return this.phoneListGroup.get('newBrand');
  }
  get newModel() {
    //noinspection TypeScriptUnresolvedFunction
    return this.phoneListGroup.get('newModel');
  }
  get newSingleModel() {
    //noinspection TypeScriptUnresolvedFunction
    return this.phoneListGroup.get('newSingleModel');
  }
}
