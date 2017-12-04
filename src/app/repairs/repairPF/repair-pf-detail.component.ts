import {Component, ElementRef, Inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import { RepairPFDetailService } from "./repair-pf-detail.service"
import {SelectItem, Message} from "primeng/primeng";
import {Observable} from "rxjs/Observable";
import {ClientPF} from "../../model/ClientPF";
import {UtilService} from "../../utils/util.service";

@Component({
  selector: 'repair-pf-detail',
  templateUrl: './repair-pf-detail.component.html'
})
export class RepairPFDetailComponent implements OnInit {
  repairsPF: ClientPF[];
  dataSource: ClientPF[];
  loading = true;
  cols:any[];
  msgs:Message[] = [];
  columnOptions:SelectItem[];
  testingValues: any[];
  defaultDate: Date = new Date();
  totalRecords: number;

  constructor(private repairPFService:RepairPFDetailService, private _utilService: UtilService, private _el: ElementRef) {
  }

  ngOnInit() {

    window.addEventListener('scroll', this.scroll, true); //third parameter

    this.defaultDate.setHours(12,0);
    setTimeout(() => {
      this.loading = true;
      this.getClientsPFList().subscribe(item => {
        this.dataSource = item;
        this.totalRecords = this.dataSource.length;
        this.repairsPF = this.dataSource;
        this.loading = false;
        this.testingValues = [{label: 'DA', value: 'DA'},{label: 'NU', value: 'NU'}];
        this.cols = [
          {field: 'addedDate', header: 'Data introducerii', filter: true, sortable: true},
          {field: 'lastname', header: 'Nume', filter: true, editable: true, sortable: true},
          {field: 'firstname', header: 'Prenume', filter: true, editable: true, sortable: true},
          {field: 'email', header: 'Email', filter: true, editable: true, sortable: true},
          {field: 'firm', header: 'Firma', filter: true, editable: true, sortable: true},
          {field: 'phone', header: 'Telefon', filter: true, editable: true, sortable: true},
          {field: 'phoneList', header: 'Model', filter: true, sortable: true},
          {field: 'problem', header: 'Problema', filter: true, sortable: true},
          {field: 'imei', header: 'IMEI', filter: true, sortable: true},
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
      }, err => {
        this.loading = false;
      });
    }, 0)
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  scroll = (): void => {
    let tableOffset = this._el.nativeElement.querySelector('table').getBoundingClientRect().top;
    if (tableOffset < 0) {
      this._el.nativeElement.querySelector('thead').classList.add('sticky-head')
    }
    else {
      this._el.nativeElement.querySelector('thead').classList.remove('sticky-head')
    }
  };
  updateField(event) {
    const fieldName = event.column.field;
    const fieldVal = event.data[fieldName];
    let obj = {};
    obj[fieldName] = fieldVal;
    this.repairPFService.updateItem(event.data.$key, obj);
    this.successMessage(event.data.lastname, event.data.firstname,'Valoare');
  }

  getClientsPFList(): Observable<any> {
    return this.repairPFService.getClientsPFList();
  }

  updateCheckedItem(row) {
    this.repairPFService.updateItem(row.$key, {isRepaired: row.isRepaired});

    if(row.isRepaired) {
      let date = new Date().getTime().toString();
      this.repairPFService.updateItem(row.$key, {deliveredDate: date});
    }
  }

  updateAppointmentDate(row, time) {
    let date = new Date(time).getTime().toString();
    this.repairPFService.updateItem(row.$key, {appointmentDate: date});
    this.defaultDate = new Date();
    this.defaultDate.setHours(12,0);
    this.successMessage(row.lastname, row.firstname, 'Data programarii')
  }

  updateTestedItem(row) {
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
