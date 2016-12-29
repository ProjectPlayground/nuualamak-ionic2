import { Component } from '@angular/core';
import { LoadingController, ToastController, ModalController, LoadingOptions } from 'ionic-angular';
import { ImagePicker, ImagePickerOptions } from 'ionic-native';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { ChangePasswordPage } from './change-password/change-password';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { GlobalValidator } from '../shared/global.validator';
import { ValidationMessageService } from '../shared/validation-message.service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  user = new UserModel();
  userAvatar: string;
  userGender: string;
  editMode = false;
  isLoadingAvatar = false;
  profileForm: FormGroup;
  formErrors = {
    email: '',
    username: '',
    age: '',
    country: '',
    location: '',
    hobbies: ''
  };

  private loadingOptions: LoadingOptions = {
    content: 'Loading',
    spinner: 'crescent',
    showBackdrop: false
  };

  constructor(private userService: UserService, private messageService: ValidationMessageService,
              private loadingCtrl: LoadingController, private modalCtrl: ModalController,
              private toastCtrl: ToastController, private formBuilder: FormBuilder) {

    this.buildProfileForm();
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.isLoadingAvatar = true;
    this.userService.getCurrent()
      .then(user => {
        this.user = user;
        this.userGender = user.gender;
        this.userAvatar = user.avatar;
        loading.dismissAll();
        this.isLoadingAvatar = false;
      })
      .catch(err => {
        loading.dismissAll();
        this.isLoadingAvatar = false;
        console.error(err);
        this.showToast('Fail to get your profile data', 'toastStyleError');
      });
  }

  editItems(editMode: boolean) {
    this.editMode = editMode;
    if (!editMode) {
      this.buildProfileForm();
    }
  }

  changeAvatar() {
    ImagePicker.getPictures(<ImagePickerOptions>{
      maximumImagesCount: 1,
      outputType: 0
    }).then((results) => {
      this.userAvatar = results[0];
    }, (err) => {
      console.error(err);
      this.showToast('Fail to get picture', 'toastStyleError');
    });
  }

  changePassword() {
    let changePasswordPage = this.modalCtrl.create(ChangePasswordPage);
    changePasswordPage.onDidDismiss((newPassword: string) => {
      if (newPassword) {
        this.userService.updatePassword(newPassword)
          .then(() => {
            this.showToast('Password has been successfully updated', 'toastStyle');
          })
          .catch(err => {
            console.error(err);
            this.showToast('Fail to update your password', 'toastStyleError');
          });
      }
    });
    changePasswordPage.present();
  }

  save() {
    this.user.email = this.profileForm.value.email;
    this.user.username = this.user.username;
    this.user.gender = this.userGender;
    this.user.age = this.profileForm.value.age;
    this.user.country = this.profileForm.value.country;
    this.user.location = this.profileForm.value.location;
    this.user.hobbies = this.profileForm.value.hobbies;
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.updateUser(this.user, this.userAvatar)
      .then(() => {
        this.editMode = false;
        loading.dismissAll();
        this.showToast('Profile has been successfully updated', 'toastStyle');
      })
      .catch(err => {
        this.editMode = false;
        loading.dismissAll();
        console.error(err);
        this.showToast('Fail to update your profile', 'toastStyleError');
      });
  }

  private buildProfileForm() {
    this.userGender = this.user.gender;
    this.userAvatar = this.user.avatar;
    this.profileForm = this.formBuilder.group({
      username: [{value: this.user.username, disabled: false}, Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthUsername),
        Validators.maxLength(this.messageService.maxLengthUsername)])],
      email: [{value: this.user.email, disabled: false}, Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      age: [{value: this.user.age, disabled: false},
        Validators.pattern('^[0-9]?[0-9]?$|^1[0-4]?[0-9]?$')],
      country: [{value: this.user.country, disabled: false},
        Validators.maxLength(this.messageService.maxLengthCountry)],
      location: [{value: this.user.location, disabled: false},
        Validators.maxLength(this.messageService.maxLengthLocation)],
      hobbies: [{value: this.user.hobbies, disabled: false},
        Validators.maxLength(this.messageService.maxLengthHobbies)]
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
