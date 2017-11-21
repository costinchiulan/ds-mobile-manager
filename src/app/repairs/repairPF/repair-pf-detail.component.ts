import { Component, OnInit } from '@angular/core';
import { RepairPFDetailService } from "./repair-pf-detail.service"
import {SelectItem, Message, LazyLoadEvent} from "primeng/primeng";
import {Observable} from "rxjs/Observable";
import {ClientPF} from "../../model/ClientPF";
import {UtilService} from "../../utils/util.service";
import {PhoneListService} from "../../clients/clientPF/phone-list/phone-list.service";
import {PhoneList} from "../../model/PhoneList";

@Component({
  selector: 'repair-pf-detail',
  templateUrl: './repair-pf-detail.component.html'
})
export class RepairPFDetailComponent implements OnInit {
  // repairsPF: Observable<ClientPF[]>;
  repairsPF: ClientPF[];
  dataSource: ClientPF[];
  loading = true;
  cols:any[];
  msgs:Message[] = [];
  columnOptions:SelectItem[];
  testingValues: any[];
  defaultDate: Date = new Date();
  totalRecords: number;

  constructor(private repairPFService:RepairPFDetailService, private _utilService: UtilService) {
  }

  ngOnInit() {
    this.defaultDate.setHours(12,0);
    setTimeout(() => {
      this.loading = true;
      this.getClientsPFList().subscribe(item => {
        this.dataSource = item;
        this.totalRecords = this.dataSource.length;
        this.repairsPF = this.dataSource;
        this.loading = false;
      }, err => {
        this.loading = false;
      });
    }, 0)
    this.testingValues = [{label: 'DA', value: 'DA'},{label: 'NU', value: 'NU'}];

    this.cols = [

      {field: 'addedDate', header: 'Data introducerii', filter: true, sortable: true},
      {field: 'lastname', header: 'Nume', filter: true, editable: true, sortable: true},
      {field: 'firstname', header: 'Prenume', filter: true, editable: true, sortable: true},
      {field: 'email', header: 'Email', filter: true, editable: true, sortable: true},
      {field: 'firm', header: 'Firma', filter: true, editable: true, sortable: true},
      {field: 'phone', header: 'Numar telefon', filter: true, editable: true, sortable: true},
      {field: 'phoneList', header: 'Model Telefon', filter: true, editable: true, sortable: true},
      {field: 'problem', header: 'Solicitare/Problema', filter: true, editable: true, sortable: true},
      {field: 'imei', header: 'IMEI', filter: true, editable: true, sortable: true},
      {field: 'priceOffer', header: 'Oferta pret', filter: true, editable: true, sortable: true},
      {field: 'appointmentDate', header: 'Data si ora programarii', filter: true, editable: true, sortable: true},
      {field: 'tested', header: 'Testat?', filter: true, editable: true, sortable: true},
      {field: 'aboutUs', header: 'Cum a aflat de noi?', filter: true, editable: false, sortable: true},
      {field: 'deliveredDate', header: 'Data Predarii', filter: true, editable: false, sortable: true},
      {field: 'isRepaired', header: 'Finalizat?', filter: true, editable: false , sortable: true}
    ];

    this.columnOptions = [];

    for (let i = 0; i < this.cols.length; i++) {
      this.columnOptions.push({label: this.cols[i].header, value: this.cols[i]});
    }
  }
  loadDataLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value

    //imitate db connection over a network
      if(this.dataSource) {
        this.repairsPF = this.dataSource.slice(event.first, (event.first + event.rows));
      }
  }
  updateField(event) {
    if (this._utilService.isNullOrUndefined(event.data.lastname)) {
      this.repairPFService.updateItem(event.data.$key, {lastname: event.data.lastname});
    }
    if (this._utilService.isNullOrUndefined(event.data.firstname)) {
      this.repairPFService.updateItem(event.data.$key, {firstname: event.data.firstname});
    }
    if (this._utilService.isNullOrUndefined(event.data.firm)) {
      this.repairPFService.updateItem(event.data.$key, {firm: event.data.firm});
    }
      this.repairPFService.updateItem(event.data.$key, {phone: event.data.phone});
    if (this._utilService.isNullOrUndefined(event.data.phoneModel)) {
      this.repairPFService.updateItem(event.data.$key, {phoneModel: event.data.phoneModel});
    }
    if (this._utilService.isNullOrUndefined(event.data.problem)) {
      this.repairPFService.updateItem(event.data.$key, {problem: event.data.problem});
    }
    if (this._utilService.isNullOrUndefined(event.data.imei)) {
      this.repairPFService.updateItem(event.data.$key, {imei: event.data.imei});
    }
    this.repairPFService.updateItem(event.data.$key, {priceOffer: event.data.priceOffer});
    this.repairPFService.updateItem(event.data.$key, {aboutUs: event.data.aboutUs});
    this.successMessage(event.data.lastname, event.data.firstname,'Valoare')
  }

  getClientsPFList(): Observable<any> {
    return this.repairPFService.getClientsPFList()
  }

  updateCheckedItem(row){
    this.repairPFService.updateItem(row.$key, {isRepaired: row.isRepaired});

    if(row.isRepaired == true){
      let date = new Date().getTime().toString();
      this.repairPFService.updateItem(row.$key, {deliveredDate: date});
    }
  }

  updateAppointmentDate(row, time){
    let date = new Date(time).getTime().toString();
    this.repairPFService.updateItem(row.$key, {appointmentDate: date});
    this.defaultDate = new Date();
    this.defaultDate.setHours(12,0);
    this.successMessage(row.lastname, row.firstname, 'Data programarii')
  }

  updateTestedItem(row){
    this.repairPFService.updateItem(row.$key, {tested: row.tested});
    this.successMessage(row.lastname, row.firstname, 'Valoarea `testat` a fost')
  }


  successMessage(lastname, firstname, msg) {
    this.msgs = [];
    this.msgs.push({
      severity: 'success',
      summary: msg + ' modificata pentru clientul: ' + lastname + ' ' + firstname,
      detail: 'Date modificate.'
    });
  }

  disabledRow(rowData: ClientPF) {
    return rowData.isRepaired ? 'disabled-account-row' : '';
  }


}
