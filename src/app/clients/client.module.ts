import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { GrowlModule, DropdownModule, CalendarModule, SpinnerModule } from "primeng/primeng";

import { ClientTypeListComponent } from "./client-type-list/client-type-list.component";
import { ClientTypeService } from "./client-type-list/client-type.service";
import { ClientPfDetailComponent } from "./clientPF/client-pf-detail.component";
import { ClientPFService } from "./clientPF/client-pf-detail.service";
import { ClientGSMDetailComponent } from "./clientGSM/client-gsm-detail.component";
import { ClientGSMService } from "./clientGSM/client-gsm-detail.service";
import {PhoneModelService} from "./phone-models/phone-model.service";
import {UtilService} from "../utils/util.service";
import {
  PhoneModelCascadingListComponent
} from "./phone-models/phone-model-cascading-list.component";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    //primeng
    GrowlModule,
    DropdownModule,
    CalendarModule,
    SpinnerModule
  ],
  declarations: [
    ClientTypeListComponent,
    ClientPfDetailComponent,
    ClientGSMDetailComponent,
    PhoneModelCascadingListComponent

  ],
  providers: [
    ClientTypeService,
    ClientPFService,
    ClientGSMService,
    PhoneModelService,
    UtilService
  ]
})
export class ClientModule { }
