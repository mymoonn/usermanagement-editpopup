import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    userList: Array<any>;
    roles: Array<any>;
    sources = {
        userListReload: new Subject<any>()
    };
    observables = {
        userListReload$: this.sources.userListReload.asObservable()
    };
    constructor(
        private api: ApiService
    ) { }

    reloadUserList() {
        this.sources.userListReload.next(true);
    }
    async getUserList(reload = false) {
        return new Promise((resolve, reject) => {
            if (this.userList && !reload) {
                resolve(this.userList);
            }
            this.api.post('users/list', {}).then((resp: any) => {
                if (resp.data) {
                    this.userList = resp.data.map((x) => {
                        const user: any = { ...x };
                        user.icon = x.logo;
                        user.name = `${x.firstname.replace(/^./, a => a.toUpperCase())} ${x.lastname.replace(/^./, a => a.toUpperCase())}`.trim();
                        user.role = x.rolename;
                        user.services = 0;
                        return user;
                    });
                    resolve(this.userList);
                } else {
                    reject('No records found');
                }
            }).catch((err) => {
                console.warn('Error while getting user details', err);
                reject('No records found');
            });
        });
    }
    async getOrgRoles(reload = false) {
        return new Promise((resolve, reject) => {
            if (this.roles && !reload) {
                resolve(this.roles);
            }
            this.api.post('organization/roles', {}).then((resp: any) => {
                if (resp && resp.status && Number(resp.status) === 1) {
                    this.roles = resp.roles;
                    resolve(this.roles);
                } else {
                    reject('No records found');
                }
            }).catch((err) => {
                console.warn('Error while getting roles details', err);
                reject('No records found');
            });
        });
    }

    

    async DeleteOrgUser(userid: number) {
        return new Promise((resolve, reject) => {
            this.api.doPost('users/deleteorguser', {
                userid
            }).then((resp: any) => {
                if (resp && resp.Status) {
                    resolve(true);
                } else {
                    reject(true);
                }
            }).catch(() => {
                reject(true);
            })
        });
    }




    async SaveOrgUser(userlist: string) {
        return new Promise((resolve, reject) => {
            this.api.doPost('users/add', {
                userlist
            }).then((resp: any) => {
                if (resp && resp.status) {
                    resolve(resp);
                } else {
                    reject(resp);
                }
            }).catch(() => {
                reject(false);
            });
        });
    }

    async editOrgUser(userlist: string) {
        return new Promise((resolve, reject) => {
            this.api.doPost('users/add', {
                userlist
            }).then((resp: any) => {
                if (resp && resp.status) {
                    resolve(resp);
                } else {
                    reject(resp);
                }
            }).catch(() => {
                reject(false);
            });
        });
    }
    async updateUserRole(params: any) {
        return new Promise((resolve, reject) => {
            this.api.doPost('user/updaterole', params).then((resp: any) => {
                if (resp && resp.Status) {
                    resolve(resp);
                } else {
                    reject(resp);
                }
            }).catch(() => {
                reject(false);
            });
        });
    }
    

}