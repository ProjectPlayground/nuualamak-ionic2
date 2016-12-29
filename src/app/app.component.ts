import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { LoginPage } from '../pages/login/login';
import { RoomPage } from '../pages/room/room';
import { ProfilePage } from '../pages/profile/profile';
import { SettingPage } from '../pages/setting/setting';
import { ShopPage } from '../pages/shop/shop';
import { UserModel } from '../pages/shared/user/user.model';
import { UserService } from '../pages/shared/user/user-service';
import { FirebaseService } from '../pages/shared/firebase-service';
import { UserReady } from '../pages/shared/user/user-notifier';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  pages: Array<{title: string, component: any}>;
  currentUser: UserModel;

  constructor(private platform: Platform, private firebaseService: FirebaseService,
              private userReady: UserReady, private userService: UserService) {

    this.initializeApp();

    this.pages = [
      {title: 'Chat Rooms', component: RoomPage},
      {title: 'Profile', component: ProfilePage},
      {title: 'Setting', component: SettingPage},
      {title: 'NUU-BITS SHOP', component: ShopPage},
      {title: 'Disconnect', component: LoginPage}
    ];

    this.userReady.notifySource$.subscribe(() =>
      this.userService.getCurrent()
        .then(currentUser => this.currentUser = currentUser));
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to init in this scenario
    if (page.title == this.pages[this.pages.length - 1].title) {
      this.userService.logOut()
        .then(() => this.nav.setRoot(page.component));
    } else {
      this.nav.setRoot(page.component);
    }
  }
}
