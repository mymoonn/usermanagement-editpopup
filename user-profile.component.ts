import { Component, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { State, CommonStore } from 'src/app/shared/services/common-store';
import { HttpService } from 'src/app/shared/services/http.service';
import { type } from 'os';
import { UtilService } from 'src/app/shared/services/util.service';
import { CollectionViewService } from '../collection/services/view.service';
import { AppService } from 'src/app/shared/services/app.service';
import { CommonStoreHelper } from 'src/app/shared/services/common-store-helper';
import { ScopeService } from 'src/app/shared/services/scope.service';
import { ConfigWizardService } from '../config/config.service';


export const StoreKeys = {
  apiConfigurations: 'apiConfigurations',
  orgName: 'orgName',
  activeUser: 'activeUser',
  updateActiveService: 'updateActiveService',
  hideBanner: 'hideBanner',
};

const defaultState: State = {
  apiConfigurations: null,
  orgName: undefined,
  activeUser: null,
  updateActiveService: undefined,
  hideBanner: false,
};


const _store = new BehaviorSubject<State>(defaultState);

@Component({
  moduleId: module.id,
  selector: 'aapi-user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss']
})
export class UserProfileComponent implements OnDestroy {
  loading = true;
  orgNameOld = '';
  displayName = 'Google';
  displayBGMOdal: boolean;
  mail = '';
  url = '';
  location = '';
  description = '';
  profPicture = '';
  bannerImage = '';
  orgID = 0;
  isAapiAdmin = false;
  isOrgOwner = false;
  tabSelected = 'information';
  popoverTabSelected = 'aapi images';
  tabTitles = [{
    title: 'INFORMATION',
    selected: true,
  }];
  popoverTitles = [
    {
      title: 'AAPI IMAGES',
      selected: true,
    },
    {
      title: 'MY IMAGES',
      selected: false,
    }
  ];
  imgList = [];
  userData: any;
  userSignedIn: boolean;
  subscribers = [];
  wallpaper = '';
  bg = '';
  tempBG = '';
  userFirstName = '';
  userLastName = '';
  imgListAapi = [{
    url: 'https://profiles.aapi.io/aapi_background_1.jpg',
    type: 'default'
  }, {
    url: 'https://profiles.aapi.io/aapi_background_2.jpg',
    type: 'default'
  }, {
    url: 'https://profiles.aapi.io/aapi_background_3.jpg',
    type: 'default'
  }, {
    url: 'https://profiles.aapi.io/aapi_background_4.jpg',
    type: 'default'
  }, {
    url: 'https://profiles.aapi.io/aapi_background_5.jpg',
    type: 'default'
  }];
  imgListCustom = [];
  imgRootPath = 'https://profiles.aapi.io/';
  user: any;
  addUserModal = false;
  addOrgModal = false;
  constructor(
    private api: ApiService,
    private router: Router,
    private store: CommonStore,
    private http: HttpService,
    private util: UtilService,
    private viewService: CollectionViewService,
    private appService: AppService,
    private storeHelper: CommonStoreHelper,
    public scopeService: ScopeService,
    private wizard: ConfigWizardService
  ) {
    this.scopeCheck();
    this.initEvents();
    this.getUserData();
  }
  scopeCheck() {
    const navScopes = this.scopeService.scopes.Navigation;
    if (this.getScope('integration')) {
      this.tabTitles.push({
        title: 'INTEGRATIONS',
        selected: false,
      });
    }
    if (this.getScope('userManagement')) {
      this.tabTitles.push({
        title: 'USER MANAGEMENT',
        selected: false,
      });
    }
  }
  refreshWallpaper(wallpaper = '') {
    this.wallpaper = this.viewService.getWallpaper();
    const tempBG = `${wallpaper || this.wallpaper}`;
    this.bg = `url(${tempBG})`;
    this.tempBG = tempBG;
  }
  initEvents() {
    this.subscribers.push(
      this.viewService.observables.bgChanged$.subscribe((wallpaper) => {
        this.refreshWallpaper();
      })
    );
    this.loadMyImages();
    this.refreshWallpaper();
  }
  ngOnDestroy() {
    this.subscribers.forEach((x) => {
      x.unsubscribe();
    });
  }

  getTempBG() {
    return {
      backgroundImage: this.bg
    };
  }

  getBG() {
    return {
      backgroundImage: `url(${this.wallpaper})`
    };
  }
  setTempBG(url) {
    this.refreshWallpaper(url);
  }
  goBack() {
    window.history.back();
  }
  openBGModal() {
    this.displayBGMOdal = true;
  }
  closeBGModal() {
    this.displayBGMOdal = false;
    this.refreshWallpaper();
  }
  loadMyImages() {
    this.api.get('/orgimagelist', {})
      .then((data: any) => {
        if (data && data.length) {
          this.imgListCustom = data.map(x => ({ url: x.filename, type: 'custom' }));
        }
      })
      .catch();
  }
  removeImage(image) {
    let imgId = image.imageid
    let url = image.url
    const message = 'Are you sure want to remove image?';
    this.wizard.confirm({
      condition: true,
      message
    }).then(() => {
      this.deleteOrgImage(url)
    }).catch((e) => {
    });
  }

  deleteOrgImage(url) {
    this.api.get('/removeorgimage', { imageurl: url })
      .then((data: any) => {
        if (data.Status) {
          this.util.notify(data.Message, '', 'success');
          this.imgListCustom.splice(this.imgListCustom.findIndex(x => x.url === url), 1)
        } else {
          this.util.notify(data.Message, '', 'warning');
        }
      })
      .catch(e => { this.util.notify('Somthing went wrong', '', 'error'); });
  }
  async saveUserBG() {
  let isOrgAdmin=this.getScope('bg');
    try {
      const wallpaper = this.tempBG;
      const filename = wallpaper.split('/').reverse()[0];
      try {
        const resp: any = await this.api.doPost(`updateorgbgimage`, { filename ,isOrgAdmin});
        if (resp && resp.Status === 1 && resp.Filename) {
          this.closeBGModal();
          this.viewService.setWallpaper(wallpaper);
          this.appService.user.activeOrg.Banner = wallpaper;
          this.util.notify('Changed Background Image!', '', 'success');
        }
      } catch (e) {

      }
    } catch (e) {
      this.util.notify('Error while saving Image!', '', 'info');
    }
  }
  getUserData() {
    this.loading = true;
    this.appService.getOrg().then((userData: any) => {
      // try {
      //   if (userData.dispOrg.isAdmin) {
      //     this.loading = false;
      //   } else {
      //     this.router.navigateByUrl('/marketplace');
      //     return false;
      //   }
      // } catch (e) {
      //   this.router.navigateByUrl('/marketplace');
      //   return false;
      // }
      if (userData && userData.Status === 1) {
        // this.router.navigateByUrl('/myprofile');
        this.userSignedIn = true;
        let user = userData.dispOrg;
        try {
          const orgData = userData.orgDetails.OrgList.find(org => org.OrgID === userData.orgDetails.ActiveOrg)

          this.isOrgOwner = orgData.IsAdmin

          this.mail = user.org_publicEmail;

          this.url = user.org_url;
          this.location = user.org_location;
          this.description = user.org_description;
          this.displayName = user.org_name;
          this.orgNameOld = user.org_name;
          this.profPicture = user.org_image || '/pages-aapi-services/assets/logos/user2.jpeg';
          this.bannerImage = user.org_bannerImage;

          this.orgID = orgData.OrgID;
          this.userFirstName = userData.orgDetails.FirstName;
          this.userLastName = userData.orgDetails.LastName;
          this.isAapiAdmin = user.org_name === 'aapi';
          if (this.isAapiAdmin) {
            this.tabTitles.push({
              title: 'ORGANIZATIONS',
              selected: false,
            });
          }
        } catch (e) {
        }
        this.loading = false
        // this.api
        //   .get('getUserOwnOrg', {})
        //   .then((res: any) => {
        //     this.loading = false;
        //     user = res;
        //     try {
        //       this.mail = user.email;

        //       this.url = user.url;
        //       this.location = user.location;
        //       this.description = user.description;
        //       this.displayName = user.orgname;
        //       this.orgNameOld = user.orgname;
        //       this.profPicture = user.logo || '/pages-aapi-services/assets/logos/user2.jpeg';
        //       this.bannerImage = user.banner;
        //       this.orgID = user.orgid;
        //       this.userFirstName = user.firstname;
        //       this.userLastName = user.lastname;
        //       this.isAapiAdmin = user.orgname === 'aapi';
        //       if (this.isAapiAdmin) {
        //         this.tabTitles.push({
        //           title: 'ORGANIZATIONS',
        //           selected: false,
        //         });
        //       }
        //     } catch (e) {
        //     }

        //   })
        //   .catch(err => {
        //     this.loading = false;
        //   });
      } else {
        this.userSignedIn = false;
        this.loading = false;
        // this.router.navigateByUrl('/');
      }
    });
  }

  switchTab(ind) {
    this.tabTitles.forEach(el => {
      el.selected = false;
    });
    this.tabTitles[ind].selected = true;
    this.tabSelected = this.tabTitles[ind].title.toLocaleLowerCase();
  }

  switchPopoverTab(ind) {
    this.popoverTitles.forEach(el => {
      el.selected = false;
    });
    this.popoverTitles[ind].selected = true;
    this.popoverTabSelected = this.popoverTitles[ind].title.toLocaleLowerCase();
  }
  uploadImage(imageType: string, file: File) {

    this.api.uploadUserImage(file, imageType, `${this.orgID}`).then((res: any) => {
      if (res) {
        if (res.Status === 1) {
          this.util.notify(res.Message, '', 'info');
          if (imageType === 'BANNER') {
            this.bannerImage = 'https://profiles.aapi.io/' + res.Filename;
          } else {
            this.profPicture = 'https://profiles.aapi.io/' + res.Filename;
            if (this.user) {
              this.user.org_image = this.profPicture;
            }
          }
        }
      }
    });
  }

  updateProfile() {
    // if (!this.displayName.match(/^[a-z0-9_]+$/i)) {
    //   this.util.notify('Organization name should be alpha numeric!');
    //   return false;
    // }
    const param = {
      orgid: `${this.orgID}`,
      org_description: this.description,
      org_location: this.location,
      org_url: this.url,
      org_publicEmail: this.mail,
      org_name: this.displayName,
      firstname: this.userFirstName,
      lastname: this.userLastName,
      org_update: `${(this.displayName !== this.orgNameOld)}`,
      visualization: ''
    };
    return new Promise((resolve, reject) => {
      this.api.post(`updateorgprofile`, param).then(
        (res: any) => {
          try {
            this.util.notify(res.Message, '', 'info');
            this.loadUserData();
            resolve(res);
          } catch (e) {
            reject(res);
          }
        },
        err => {
          reject(err);
        }
      );
    });
  }
  gotoPage() {
    this.router.navigateByUrl('/');
  }
  uploadImageFile(imageType: string, value) {
    const file = value.target.files[0];
    switch (imageType) {
      case 'LOGO':
        this.api.uploadUserImage(file, imageType, `${this.orgID}`).then((res: any) => {
          if (res && res.Status) {
            const url = `${this.imgRootPath}${res.Filename}`;
            this.profPicture = url;
            this.appService.user.activeOrg.Logo = url;
            this.util.notify('Profile photo has been changed!');
          }
        }).catch();
        break;
      case 'CUSTOM':
      case 'BANNER':
        this.api.uploadUserImage(file, 'custombg', `${this.orgID}`).then((res: any) => {
          if (res && res.Status) {
            const url = `${this.imgRootPath}${res.Filename}`;
            this.imgListCustom.push({
              type: 'custom',
              url
            });
            this.setTempBG(url);
          }
        }).catch();
        break;
    }
  }

  loadUserData() {
    const getUser = () => {
      return new Promise((resolve, reject) => {
        this.api
          .get('getUserOrg', {})
          .then((user: any) => {
            try {
              const OrgID = user.ActiveOrg;
              const orgList = user.OrgList || [];
              const activeOrg = orgList.find(x => x.OrgID === OrgID);
              const activeOrgName = activeOrg.Organization;
              Object.assign(user, {
                activeOrg,
                activeOrgName
              });
            } catch (e) {
              console.warn('Error updating org details:', e);
            }
            this.appService.user = user;
            resolve(user);
          })
          .catch(err => {
            const user = {
              Success: false
            };
            this.appService.user = user;
            reject(user);
          });
      });
    };
    getUser().then((user: any) => {
      const orgname = user.activeOrgName;
      this.api.get(`getUserDetails/${orgname}`, {}).then((org: any) => {
        this.appService.org = org;
        this.storeHelper.update(StoreKeys.apiConfigurations, org);
      }).catch(() => {
        this.appService.org = {
          Status: 0
        };
      });
    }).catch();

  }

  getSideEffectsMessage() {
    return `After changing your username, links to your previous profile page, such as https://${window.location.host}/${this.orgNameOld}/aapilets, will return a 404 error. We recommend updating any links to your Aapilets from elsewhere.`;
  }

  getScope(text: string) {
    const scopes = this.scopeService.scopes;
    if (text === 'integration') {
      return scopes.Navigation.OIDCIntegrationRead && scopes.Profile.IntegrationTabRead;
    }
    if (text === 'userManagement') {
      return scopes.Navigation.UserManagementRead && scopes.UserManagement.UserListRead;
    }
    if (text === 'bg') {
      return scopes.Profile.ChangeBackgroundRead;
    }
    if (text === 'addUser') {
      return scopes.UserManagement.AddUserModify;
    }
    return false;
  }
}
