import { Component, ViewChild, Renderer } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, Content, LoadingOptions } from 'ionic-angular';
import { ChatService } from './chat-service';
import { ChatMessage } from './chat-message';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { ItemService } from '../shop/item/item.service';
import { ItemModel } from '../shop/item/item.model';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [ChatService]
})
export class ChatPage {

  currentRoom: string;
  typedMsg: string;
  user: UserModel;
  messageList: Array<ChatMessage>;
  itemsBought: Array<ItemModel>;

  fontName = 'inherit';
  fontColor = 'black';
  backgroundImage = '';
  isBold = false;
  isPaused = false;
  firstLoad = true;

  private loadingOptions: LoadingOptions;

  @ViewChild(Content) content: Content;

  constructor(private navCtrl: NavController, private navParam: NavParams, private chatService: ChatService,
              private toastCtrl: ToastController, private loadingCtrl: LoadingController, private renderer: Renderer,
              private userService: UserService, private itemService: ItemService) {

    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.itemsBought = new Array<ItemModel>();
    this.typedMsg = '';
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
        this.itemService .getActiveItemsBought(this.user)
          .then((itemsBought: Array<ItemModel>) => {
            this.itemsBought = itemsBought;
            this.applyItemsStyles();
          })
          .catch(err => console.log(err));
      });


    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.subscribeToRoom(loading);
  }

  ionViewDidLoad() {
    this.content.scrollToBottom(500);
  }

  ionViewWillLeave() {
    this.unSubscribeToRoom();
  }

  sendMsg() {
    this.chatService.send(this.currentRoom, this.typedMsg.trim())
      .then(() => this.typedMsg = '')
      .catch(err => {
        console.error(err);
        this.showToast('Fail sending message', 'toastStyleError');
      });
  }

  togglePauseChat() {
    if (this.isPaused) {
      this.subscribeToRoom();
    } else {
      this.unSubscribeToRoom();
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

  private applyItemsStyles() {
    this.itemsBought.map((itemBought: ItemModel) => {
      switch (itemBought.category) {
        case 'theme':
          this.backgroundImage = itemBought.background_image;
          break;
        case 'font':
          this.fontName = itemBought.font_name;
          break;
        case 'font_color':
          this.fontColor = itemBought.font_color;
          break;
        case 'emoticon':
          //TODO change emojis list
          break;
        case 'bold':
          this.isBold = true;
          break;

      }
    });
  }

  private subscribeToRoom(loading ?) {
    this.chatService.getLastsEvent(this.currentRoom).on('value', (snapshot) => {
      let chatMessage = snapshot.val();
      this.firstLoad ? loading.dismissAll() : 0;
      this.messageList = Object.keys(chatMessage ? chatMessage : [])
        .map(key => chatMessage[key]);
      setTimeout(() => this.content ? this.content.scrollToBottom(500) : 0, 1000);
      this.showToast('New messages received...', 'toastStyle');
    });
  }

  private unSubscribeToRoom() {
    this.chatService.getLastsEvent(this.currentRoom).off();
  }

  private showToast(msg, style) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000,
      cssClass: style
    }).present();
  }

}
