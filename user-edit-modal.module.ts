import { NgModule } from '@angular/core';
import { UserEditModalComponent } from './user-edit-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        NgSelectModule,
        CommonModule,
        FormsModule
    ],
    declarations: [
        UserEditModalComponent
    ],
    exports: [
        UserEditModalComponent
    ]
})
export class UserEditModalModule {

}