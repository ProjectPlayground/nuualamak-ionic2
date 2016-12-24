import { Component } from '@angular/core';
import { NavController, ToastController, MenuController, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { UserModel } from '../shared/user/user.model';
import { RoomPage } from '../room/room';
import { UserService } from '../shared/user/user-service';
import { GlobalValidator } from '../shared/global.validator';
import { SideMenuService } from '../shared/toolbar.service';
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

  constructor(private navCtrl: NavController, private menuCtr: MenuController, private alertCtrl: AlertController,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController,
              private userService: UserService, private formBuilder: FormBuilder,
              private sideMenuService: SideMenuService, private messageService: ValidationMessageService) {

    this.userModel = new UserModel();
    this.loginForm = formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(20)])],
      email: ['', Validators.compose([GlobalValidator.mailFormat, Validators.required, Validators.maxLength(40)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
      confirmPassword: ['', Validators.required]
    });
    this.loginForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.loginForm, this.formErrors));
    this.messageService.onValueChanged(this.loginForm, this.formErrors);
  }

  ionViewWillEnter() {
    if (this.userService.isAuth()) {
      this.navCtrl.setRoot(RoomPage);
    } else {
      this.userModel = new UserModel();
      this.menuCtr.close();
      this.menuCtr.enable(false);
    }
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
        let loading = this.loadingCtrl.create({
          content: 'Loading',
          spinner: 'crescent',
          showBackdrop: false
        });
        loading.present();
        this.userService.login(this.userModel, this.password)
          .then(() => {
            this.navCtrl.setRoot(RoomPage);
            this.sideMenuService.init(true);
            this.showToast('Log in Success', 'toastStyle');
          })
          .catch(err => {
            loading.dismissAll();
            //TODO login err msgs
            console.log(err);
            this.showToast('Log in Fail', 'toastStyleError')
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
      //TODO replace this with a promise
      setTimeout(GlobalValidator.samePassword(this.loginForm, 'login'), 2000);
      //setTimeout(GlobalValidator.samePassword(this.loginForm, 'login'), 2000);
    } else {
      let loading = this.loadingCtrl.create({
        content: 'Loading',
        spinner: 'crescent',
        showBackdrop: false
      });
      loading.present();
      this.userService.create(this.userModel, this.password)
        .then(() => {
          this.navCtrl.setRoot(RoomPage);
          this.sideMenuService.init(true);
          this.showToast('Sign Up Success', 'toastStyle');
        })
        .catch(err => {
          loading.dismissAll();
          console.log(err);
          this.showToast('Sign up Fail', 'toastStyleError');
        });
    }
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
