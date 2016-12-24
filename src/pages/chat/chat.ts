import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Content } from 'ionic-angular';
import { ChatService } from './chat-service';
import { ChatMessage } from './chat-message';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [ChatService]
})
export class ChatPage {

  currentRoom: string;
  typedMsg: string;
  messageList: Array<ChatMessage>;
  isPaused = false;
  firstLoad = true;
  user: UserModel;

  @ViewChild(Content) content: Content;

  constructor(private navCtrl: NavController, private navParam: NavParams, private chatService: ChatService,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController,
              private userService: UserService) {

    this.currentRoom = this.navParam.data;
  }

  ionViewWillEnter() {
    this.messageList = null;
    this.isPaused = false;
    this.firstLoad = true;
    this.typedMsg = '';
    this.userService.getCurrent()
      .then(user => this.user = user);

    let loading = this.loadingCtrl.create({
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    });
    loading.present();
    this.subscribeToRoom(loading);
  }

  ionViewDidLoad() {
    this.content.scrollToBottom(500);
  }

  sendMsg() {
    this.chatService.send(this.currentRoom, this.typedMsg)
      .then(() => this.typedMsg = '')
      .catch(err => this.showToast('Fail sending message', 'toastStyleError'));
  }

  togglePauseChat() {
    if (this.isPaused) {
      this.subscribeToRoom();
    } else {
      this.chatService.getLastsEvent(this.currentRoom).off();
    }
    this.isPaused = !this.isPaused;
  }

  getFarCodeTimestamp(msg: ChatMessage) {
    const dayLength = 86400000;
    const hourLength = 3600000;
    let isNearFarCode = 0;
    if ((new Date().getTime() - msg.timestamp) >= dayLength) {
      isNearFarCode = 2;
    } else if ((new Date().getTime() - msg.timestamp) >= hourLength) {
      isNearFarCode = 1;
    }
    return isNearFarCode;
  }

  getTimePassed(msg) {
    return new Date().getTime() - msg.timestamp
  }

  private subscribeToRoom(loading?) {
    this.chatService.getLastsEvent(this.currentRoom).on('value', (snapshot) => {
      let chatMessage = snapshot.val();
      this.firstLoad ? loading.dismissAll() : 0;
      this.messageList = Object.keys(chatMessage ? chatMessage : [])
        .map(key => chatMessage[key]);
      setTimeout(() => this.content ? this.content.scrollToBottom(500) : 0, 1000);
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
