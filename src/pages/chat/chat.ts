import { Component, ViewChild, Renderer, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Content } from 'ionic-angular';
import { ChatService } from './chat-service';
import { ChatMessage } from './chat-message';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { ItemService } from '../shop/item/item.service';
import { ItemModel } from '../shop/item/item.model';

@Component({
  selector   : 'page-chat',
  templateUrl: 'chat.html',
  providers  : [ChatService]
})
export class ChatPage {

  currentRoom: string;
  typedMsg: string;
  messageList: Array<ChatMessage>;
  isPaused = false;
  firstLoad = true;
  user: UserModel;
  itemsBought: Array<ItemModel>;

  @ViewChild(Content) content: Content;
  @ViewChildren('chatContent') chatContentList: QueryList<ElementRef>;

  constructor(private navCtrl: NavController, private navParam: NavParams, private chatService: ChatService,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController, private renderer: Renderer,
              private userService: UserService, private itemService: ItemService) {

    this.itemsBought = new Array<ItemModel>();
    this.currentRoom = this.navParam.data;
  }

  ionViewWillEnter() {
    this.messageList = null;
    this.isPaused = false;
    this.firstLoad = true;
    this.typedMsg = '';
    this.userService.getCurrent()
      .then(user => {
        this.user = user;
        this.itemService .getItemsBought(this.user, true)
          .then((itemsBought: Array<ItemModel>) => {
            this.itemsBought = itemsBought;
            itemsBought.map((itemBought: ItemModel) => {
              switch (itemBought.category) {
                case 'background_image':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementStyle(chatContent.nativeElement, 'background-image', itemBought.background_image));
                  break;
                case 'font':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementStyle(chatContent.nativeElement, 'font-family', itemBought.font_name));
                  break;
                case 'font_color':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementStyle(chatContent.nativeElement, 'color', itemBought.font_color));
                  break;
                case 'emoticon':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementClass(chatContent.nativeElement, 'bold', true));
                  break;
                case 'bold':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementClass(chatContent.nativeElement, 'bold', true));
                  break;

              }
            });
          })
          .catch(err => console.log(err));
      });


    let loading = this.loadingCtrl.create({
      content     : 'Loading',
      spinner     : 'crescent',
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

  private subscribeToRoom(loading ?) {
    this.chatService.getLastsEvent(this.currentRoom).on('value', (snapshot) => {
      let chatMessage = snapshot.val();
      this.firstLoad ? loading.dismissAll() : 0;
      this.messageList = Object.keys(chatMessage ? chatMessage : [])
        .map(key => chatMessage[key]);
      setTimeout(() => this.content ? this.content.scrollToBottom(500) : 0, 1000);
    });
  }

  private
  showToast(msg, style) {
    this.toastCtrl.create({
      message : msg,
      duration: 2000,
      cssClass: style
    }).present();
  }
}
