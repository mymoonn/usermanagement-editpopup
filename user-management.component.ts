import { Component, Input, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/shared/services/api.service';
import { UserManagementService } from './user-management.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { ConfigWizardService } from '../../config/config.service';
import { ScopeService } from 'src/app/shared/services/scope.service';
@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent {
    @ViewChild('content', { static: false }) content;
   
    
    viewType: 'grid' | 'list' = 'grid';
    userData = [];
    userColumns: Array<AapiTableColumn> = [];
    addUserModal = false;
    orgRoles = [];
    subsribers = [];
    integrationsList = [];
    searchStr = undefined;
    searchedUserData = [];
    selectedIntegration: any;
    constructor(
        private dp: DatePipe,
        public scopeService: ScopeService,
        private util: UtilService,
        private service: UserManagementService,
        private wizard: ConfigWizardService
    ) {
        this.service.getOrgRoles().then((res: any) => {
            this.orgRoles = res;
            this.loadColumns();
        }).catch();
        this.loadColumns();
        this.loadData();
        this.initSubscribe();
    }
    initSubscribe() {
        this.service.observables.userListReload$.subscribe((data: any) => {
            this.loadData(true);
        });
    }
    setViewType(type: 'grid' | 'list') {
        this.viewType = type;
    }
    loadColumns() {
        const actionList: Array<AapiTableAction> = [];
        if (this.getScope('editUser')) {
            actionList.push({
                type: 'icon',
                icon: '/pages-aapi-services/assets/usmt/settings.png',
                onClick: ($event) => {
                    console.log($event);
                }
            }, {
                type: 'icon',
                icon: '/pages-aapi-services/assets/usmt/lock.png',
                onClick: ($event) => {
                    console.log($event);
                },
                customTemplate: ($event) => {
                    let img = `<img src="/pages-aapi-services/assets/usmt/lock.png">`;
                    if (!$event.row.status) {
                        img = `<img class="lock-icon" src="/pages-aapi-services/assets/usmt/lock.png">` + img;
                    }

                    return img;
                }
            });
        }
        if (this.getScope('removeUser')) {
            actionList.push({
                type: 'icon',
                confirm: true,
                confirmButtonText: 'Remove',
                confirmMessage: 'Are you sure want to remove?',
                icon: '/pages-aapi-services/assets/usmt/delete.png',
                onClick: ($event) => {
                    this.deleteOrgUser($event.row);
                }
            });
        }
        this.userColumns = [{
            label: ($event: AapiTableCellEvent) => `${$event.data ? $event.data.length : 0} Users`,
            width: '90px',
            type: 'profile_photo',
            property: 'image'
        }, {
            label: 'Username',
            width: '170px',
            property: 'username',
            type: 'text',
        }, {
            label: 'Name',
            width: '250px',
            property: 'name',
            type: 'text',
        }, {
            label: 'Email id',
            width: '230px',
            property: 'email',
            type: 'text',
        }, {
            label: 'Role',
            width: '160px',
            type: 'select',
            property: 'roleid',
            selectData: {
                items: this.orgRoles,
                bindValue: 'roleid',
                bindLabel: 'rolename',
                disabled: !Boolean(this.getScope('changeRole')),
                onChange: ($event) => {
                    return this.updateUserRole($event);
                }
            }
        }, {
            label: 'Date Added',
            width: '200px',
            property: 'createon',
            value: ($event) => {
                return !$event.value ? '' : this.dp.transform(new Date($event.value), 'MM/dd/yyyy');
            }
        }, {
            label: 'Services',
            width: '100px',
            property: 'services'
        }, {
            label: '',
            width: '200px',
            property: '',
            type: 'actions',
            actionList
        }];
    }
    loadData(reload = false) {
        if (reload) {
            delete this.userData;
        }
        this.service.getUserList(reload).then((resp: any) => {
            this.userData = resp;
            this.searchList(this.searchStr);
        }).catch();

    }

    deleteUserConfirm(user) {
        const message = 'Are you sure want to remove?';
        this.wizard.confirm({
            condition: true,
            message
        }).then(() => {
            this.deleteOrgUser(user);
        }).catch((e) => {
            console.log(e);
        });
    }


    




    deleteOrgUser(user: any) {
        this.service.DeleteOrgUser(user.userid)
            .then(() => {
                //this.loadData(true);
                this.userData.splice(this.userData.indexOf(user), 1);
                this.util.notify('User has been removed successfully!');
            })
            .catch(() => {
                this.util.notify('Error while removing user!');
            });
    }

    


    getRoleName(role) {
        const rolename = `${role || ''}`.toLowerCase();
        if (rolename.includes('admin')) {
            return 'Admin';
        } else {
            return 'Member';
        }
    }
    getScrollLeft() {
        const style: any = {};
        const width = (this.content) ? this.content.nativeElement.offsetWidth : (window.innerWidth - 60);
        style.left = `${(this.viewType === 'grid') ? 0 : width * -1}px`;
        return style;
    }
    getViewWidth() {
        const style: any = {};
        const width = (this.content) ? this.content.nativeElement.offsetWidth : (window.innerWidth - 60);
        style.width = `${width}px`;
        return style;
    }
    getScope(text: string) {
        const scopes = this.scopeService.scopes;
        if (text === 'editUser') {
            return scopes.UserManagement.EditUserModify;
        }
        if (text === 'removeUser') {
            return scopes.UserManagement.RemoveUserModify;
        }
        if (text === 'changeRole') {
            return scopes.UserManagement.UserRolesModify;
        }
        return false;
    }

    async updateUserRole(rowData) {
        return new Promise((resolve, reject) => {
            const message = 'Are you sure to change user role?';
            this.wizard.confirm({
                condition: true,
                message
            }).then(() => {
                const params = {
                    userid: rowData.data.userid,
                    roleid: rowData.selectData.roleid
                };
                this.service.updateUserRole(params).then((res: any) => {
                    if (res && res.Message) {
                        this.util.notify(res.Message);
                        if (res.Status) {
                            this.loadData(true);
                            resolve(true);
                        }
                    } else {
                        this.util.notify('Error while updating user role.');
                        reject(false);
                    }
                })
                    .catch(() => {
                        this.util.notify('Error while updating user role.');
                        reject(false);
                    });
            }).catch((e) => {
                console.log(e);
                reject(false);
            });
        });
    }
    searchList(searchStr) {
        this.searchedUserData = []
        if (searchStr) {
            searchStr = searchStr.trim(" ").toLowerCase();
            if (this.userData.length) {
                this.userData.forEach(el => {
                    if (
                        el.username.toLowerCase().includes(searchStr) || 
                        el.role.toLowerCase().includes(searchStr) || 
                        el.email.toLowerCase().includes(searchStr) || 
                        el.name.toLowerCase().includes(searchStr)
                    ) {
                        this.searchedUserData.push(el)
                    }
                });
            }
        } else {
            this.searchedUserData = this.userData;
        }
    }
}
