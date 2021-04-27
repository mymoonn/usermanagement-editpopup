// Angular Imports
import { NgModule } from '@angular/core';
import { UserProfileComponent } from './user-profile.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { userProfileRoutingModule } from './user-profile-routing.module'
import { IntegrationsModule } from '../integrations/integrations.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { UserManagementModule } from './user-management/user-management.module';
import { UserAddModalModule } from './user-add-modal/user-add-modal.module';
import { OrganizationsManagementModule } from './organizations-management/organizations-management.module';
import { OrgAddModalModule } from './org-add-modal/org-add-modal.module';
import { ConfigCheckboxModule } from '../config/common/config-checkbox/config-checkbox.module';
import { AapiConfirmBoxModule } from '../config/common/aapi-confirm-box/aapi-confirm-box.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        SelectDropDownModule,
        userProfileRoutingModule,
        IntegrationsModule,
        TooltipModule,
        UserAddModalModule,
        OrgAddModalModule,
        UserManagementModule,
        OrganizationsManagementModule,
        ConfigCheckboxModule,
        AapiConfirmBoxModule
    ],
    declarations: [
        UserProfileComponent
    ],
    exports: [
        UserProfileComponent
    ]
})
export class UserProfileModule {

}
