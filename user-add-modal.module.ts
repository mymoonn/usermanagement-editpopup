import { NgModule } from '@angular/core';
import { UserAddModalComponent } from './user-add-modal.component';
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
        UserAddModalComponent
    ],
    exports: [
        UserAddModalComponent
    ]
})
export class UserAddModalModule {

}