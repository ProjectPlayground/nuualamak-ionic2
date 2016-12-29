import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { RoomPage } from '../pages/room/room';
import { ChatPage } from '../pages/chat/chat';
import { ProfilePage } from '../pages/profile/profile';
import { ShopPage } from '../pages/shop/shop';
import { SettingPage } from '../pages/setting/setting';
import { UserService } from '../pages/shared/user/user-service';
import { ChangePasswordPage } from '../pages/profile/change-password/change-password';
import { FirebaseService } from '../pages/shared/firebase-service';
import { ItemService } from '../pages/shop/item/item.service';
import { AddItemPage } from '../pages/shop/add-item/add-item';
import { ValidationMessageService } from '../pages/shared/validation-message.service';
import { EmojiModule } from '../vendor/angular2-emoji/module';
import { UserReady } from '../pages/shared/user/user-notifier';
import { UserItemsService } from '../pages/shared/user/user-items-service';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RoomPage,
    ChatPage,
    ProfilePage,
    SettingPage,
    ShopPage,
    ChangePasswordPage,
    AddItemPage,
  ],
  imports: [
    EmojiModule,
    IonicModule.forRoot(MyApp, {
      list: {
        margin: 0
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RoomPage,
    ChatPage,
    ProfilePage,
    SettingPage,
    ShopPage,
    ChangePasswordPage,
    AddItemPage
  ],
  providers: [
    UserService,
    ItemService,
    ValidationMessageService,
    FirebaseService,
    UserItemsService,
    UserReady,
    {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {
}
