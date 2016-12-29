import { Component } from '@angular/core';
import {
  NavController,
  ToastController,
  MenuController,
  LoadingController,
  AlertController,
  LoadingOptions
} from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as firebase from 'firebase';

import { UserModel } from '../shared/user/user.model';
import { RoomPage } from '../room/room';
import { UserService } from '../shared/user/user-service';
import { GlobalValidator } from '../shared/global.validator';
import { ValidationMessageService } from '../shared/validation-message.service';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  userModel: UserModel;
  password: string;
  confirmPassword: string;
  isOnLogin = true;
  loginForm: FormGroup;
  formErrors = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  private loadingOptions: LoadingOptions;

  constructor(private navCtrl: NavController, private menuCtr: MenuController, private alertCtrl: AlertController,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController,
              private userService: UserService, private formBuilder: FormBuilder,
              private messageService: ValidationMessageService) {

    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.userModel = new UserModel();
    this.loginForm = formBuilder.group({
      username: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthUsername),
        Validators.maxLength(this.messageService.maxLengthUsername)])],
      email: ['', Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required]
    });
    this.loginForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.loginForm, this.formErrors));
    this.messageService.onValueChanged(this.loginForm, this.formErrors);
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.isAuth()
      .then(isAuth => {
        loading.dismissAll();
        if (isAuth) {
          this.navCtrl.setRoot(RoomPage);
        } else {
          this.userModel = new UserModel();
          this.menuCtr.close();
          this.menuCtr.enable(false);
        }
      });
  }

  ionViewWillLeave() {
    this.menuCtr.enable(true);
  }

  login() {
    if (this.isOnLogin) {
      this.messageService.onValueChanged(this.loginForm, this.formErrors);
      let errInputLogin = Object.keys(this.formErrors)
        .filter(field => field === 'email' || field === 'password')
        .map(field => this.formErrors[field])
        .filter(value => value !== '');
      if (errInputLogin.length === 0 && this.userModel.email !== '' && this.password !== '') {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.userService.login(this.userModel, this.password)
          .then(() => {
            this.navCtrl.setRoot(RoomPage);
            this.showToast('Log in Success', 'toastStyle');
            if (this.userService.bonusNuuBits.got) {
              this.showToast(`Nice, you've got ${this.userService.bonusNuuBits.value} 
                after ${this.userService.bonusNuuBits.consecutiveLogIn} consecutive login !`, 'toastStyle', 5000);
            }
          })
          .catch((err: firebase.FirebaseError) => {
            loading.dismissAll();
            console.error(err);
            let errMsg = 'Log in Fail';
            switch (err.code) {
              case 'auth/invalid-email':
              case 'auth/user-not-found':
              case 'auth/wrong-password':
                errMsg = 'Incorrect email or password';
                break;
            }
            this.showToast(errMsg, 'toastStyleError')
          });
      } else {
        this.alertCtrl.create({
          title: 'Email and Password are is required.'
        }).present();
      }
    } else {
      GlobalValidator.endSamePassword(this.loginForm, 'login');
      this.isOnLogin = true;
    }
  }

  signUp() {
    if (this.isOnLogin) {
      this.isOnLogin = false;
      //TODO replace this with a promise may be ?
      setTimeout(GlobalValidator.samePassword(this.loginForm, 'login'), 2000);
    } else {
      let loading = this.loadingCtrl.create(this.loadingOptions);
      loading.present();
      this.userService.create(this.userModel, this.password)
        .then(() => {
          this.navCtrl.setRoot(RoomPage);
          this.showToast('Sign Up Success', 'toastStyle');
        })
        .catch((err: firebase.FirebaseError) => {
          loading.dismissAll();
          console.error(err);
          let errMsg = 'Sign Up Fail';
          switch (err.code) {
            case 'auth/email-already-in-use':
              errMsg = err.message;
              break;
            case 'auth/network-request-failed':
              errMsg = 'No internet connection';
              break;
          }
          this.showToast(errMsg, 'toastStyleError');
        });
    }
  }

  resetPassword() {
    this.userService.resetPassword(this.userModel).then(() => {
      this.showToast('Reset password email sent', 'toastStyle');
    }, (err) => {
      console.error(err);
      this.showToast('Could not reset your password, please contact admin', 'toastStyleError');
    });
  }

  private showToast(msg, style, duration: number = 2000) {
    this.toastCtrl.create({
      message: msg,
      duration: duration,
      cssClass: style
    }).present();
  }
}
