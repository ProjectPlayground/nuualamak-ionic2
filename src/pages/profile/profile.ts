import { Component } from '@angular/core';
import { LoadingController, ToastController, ModalController } from 'ionic-angular';
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
  isLoadingAvatar = false;
  profileForm: FormGroup;
  formErrors = {
    email: '',
    username: '',
  };

  constructor(private userService: UserService, private messageService: ValidationMessageService,
              private loadingCtrl: LoadingController, private modalCtrl: ModalController,
              private toastCtrl: ToastController, private formBuilder: FormBuilder) {

    this.profileForm = formBuilder.group({
      username: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthUsername),
        Validators.maxLength(this.messageService.maxLengthUsername)])],
      email: ['', Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])]
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);

  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    });
    loading.present();
    this.isLoadingAvatar = true;
    this.userService.getCurrent()
      .then(user => {
        this.user = user;
        this.userAvatar = user.avatar;
        loading.dismissAll();
        this.isLoadingAvatar = false;
      })
      .catch(err => {
        loading.dismissAll();
        this.isLoadingAvatar = false;
        this.showToast('Fail to get your profile data', 'toastStyleError');
      });
  }

  changeAvatar() {
    ImagePicker.getPictures(<ImagePickerOptions>{
      maximumImagesCount: 1,
      outputType: 0
    }).then((results) => {
      this.userAvatar = results[0];
    }, (err) => {
      this.showToast('Fail to get picture', 'toastStyleError');
    });
  }

  changePassword() {
    let chgPasswor = this.modalCtrl.create(ChangePasswordPage);
    chgPasswor.onDidDismiss((newPassword: string) => {
      if (newPassword) {
        this.userService.updatePassword(newPassword)
          .then(() => {
            this.showToast('Password has been successfully updated', 'toastStyle');
          })
          .catch(err => {
            this.showToast('Fail to update your password', 'toastStyleError');
          });
      }
    });
    chgPasswor.present();
  }

  save() {
    let loading = this.loadingCtrl.create({
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    });
    loading.present();
    this.userService.updateUser(this.user, this.userAvatar)
      .then(() => {
        loading.dismissAll();
        this.showToast('Profile has been successfully updated', 'toastStyle');
      })
      .catch(err => {
        loading.dismissAll();
        this.showToast('Fail to update your profile', 'toastStyleError');
      });
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
