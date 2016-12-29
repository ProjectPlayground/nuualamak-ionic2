import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController, LoadingOptions } from 'ionic-angular';

import { RoomService } from './room.service';
import { ChatPage } from '../chat/chat';
import { ValidationMessageService } from '../shared/validation-message.service';

@Component({
  selector: 'page-room',
  templateUrl: 'room.html',
  providers: [RoomService]
})
export class RoomPage {

  firstLoad = true;
  rooms: Array<string>;

  private loadingOptions: LoadingOptions = {
    content: 'Loading',
    spinner: 'crescent',
    showBackdrop: false
  };

  constructor(private navCtrl: NavController, private roomService: RoomService,
              private alertCtrl: AlertController, private toastCtrl: ToastController,
              private loadingCtrl: LoadingController, private messageService: ValidationMessageService) {
    this.rooms = new Array();
  }

  ionViewWillEnter() {
    this.firstLoad = true;
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.roomService.getAll()
      .then(rooms => {
        this.rooms = rooms;
        loading.dismissAll();
        this.firstLoad = false;
      })
      .catch(err => {
        loading.dismissAll();
        this.firstLoad = false;
        this.showToast('Fail loading rooms messages', 'toastStyleError');
      });
  }

  addRoom() {
    this.alertCtrl.create({
      title: 'Creating a new Room',
      message: 'Enter a name for this new room',
      inputs: [
        {
          name: 'newRoomName',
          placeholder: 'room name'
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Add',
          handler: data => {
            if (!data.newRoomName) {
              this.alertCtrl.create({
                title: this.messageService.validationMessages['roomName']['required']
              }).present();
            } else if (data.newRoomName.length > this.messageService.maxLengthRoomName) {
              this.alertCtrl.create({
                title: this.messageService.validationMessages['roomName']['maxlength']
              }).present();
            } else if (data.newRoomName.length < this.messageService.minLengthRoomName) {
              this.alertCtrl.create({
                title: this.messageService.validationMessages['roomName']['minlength']
              }).present();
            } else {
              let loading = this.loadingCtrl.create(this.loadingOptions);
              loading.present();
              this.roomService.add(data.newRoomName)
                .then(() => {
                  loading.dismissAll();
                  //this.showToast('Room added', 'toastStyle');
                  this.navCtrl.push(ChatPage, data.newRoomName);
                })
                .catch(err => {
                  loading.dismissAll();
                  this.showToast('Fail adding chat room', 'toastStyleError');
                });
            }
          }
        }
      ]
    }).present();
  }

  pickRoom(pickedRoom) {
    this.navCtrl.push(ChatPage, pickedRoom);
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
