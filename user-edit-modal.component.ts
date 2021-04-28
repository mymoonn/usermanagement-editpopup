import { Component, EventEmitter, Output, Input } from "@angular/core";
import { UserManagementService } from '../user-management/user-management.service';
import { UtilService } from 'src/app/shared/services/util.service';

@Component({
    templateUrl: './user-edit-modal.component.html',
    styleUrls: ['./user-edit-modal.component.scss'],
    selector: 'user-edit-modal'
}) 
export class UserEditModalComponent {
    @Output() closeModal = new EventEmitter();
    loading = false;
    roleList = [];
    userList1: Array<{
        firstname: string;
        lastname: string;
    }> = [];
    userList: Array<{
        email: string;
        role?: string;
    }> = [];
    constructor(
        private util: UtilService,
        private service: UserManagementService
    ) {
        this.initData();
    }
    doCloseModal() {
        this.closeModal.emit(true);
    }
    // autoAddUserRow() {
    //     let empty = false;
    //     this.userList.forEach((x) => {
    //         if (!(x.email && x.role)) {
    //             empty = true;
    //         }
    //     });
    //     if (!empty) {
    //         this.userList.push({
    //             email: ''
    //         });
    //     }
    // }
    // deleteRow(user) {
    //     this.userList.splice(this.userList.indexOf(user), 1);
    //     this.autoAddUserRow();
    // }
    initData() {
        this.userList = [{
            email: ''
        }];
        this.service.getOrgRoles().then((res: any) => {
            this.roleList = res;
        }).catch();
        this.userList1 = [{
            firstname: '' ,lastname:'' 
        }]; 
    }
    saveUsers() {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const userlist = this.userList.filter(user => user.email && user.role);
        userlist.forEach(el => {
            el["sameorg"] = true;
        });
        this.service.SaveOrgUser(JSON.stringify(userlist)).then((resp: any) => {
            this.loading = false;
            if (resp && resp.status) {
                const message = resp.message || 'users have been edited successfully!';
                this.util.notify(message);
                this.initData();
                this.service.reloadUserList();
                this.doCloseModal();
            } else {
                this.util.notify('Error while saving users!');
            }
        }).catch(() => {
            this.util.notify('Error while saving users!');
            this.loading = false;
        });
    }
}