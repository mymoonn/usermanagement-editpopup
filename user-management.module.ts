import { NgModule } from "@angular/core";
import { UserManagementComponent } from './user-management.component';
import { CollectionSearchBoxModule } from '../../collection/common/search-box/search-box.module';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AapiTableModule } from '../aapi-table/aapi-table.module';
import { UserManagementService } from './user-management.service';
import { AapiConfirmBoxModule } from '../../config/common/aapi-confirm-box/aapi-confirm-box.module';
import { UserAddModalModule } from '../user-add-modal/user-add-modal.module';
import { UserEditModalModule } from '../user-edit-modal/user-edit-modal.module';



@NgModule({
    imports: [AapiTableModule, CommonModule, FormsModule, CollectionSearchBoxModule, AapiConfirmBoxModule, UserAddModalModule,UserEditModalModule],
    declarations: [UserManagementComponent],
    exports: [UserManagementComponent],
    providers: [DatePipe, UserManagementService]
})
export class UserManagementModule { }