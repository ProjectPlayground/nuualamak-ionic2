
export class UserModel {

  uid: string;
  username: string;
  email: string;
  avatar: string;
  hobbies: string;
  gender: string;
  location: string;
  country: string;
  age: number;
  nuuBits: number;
  consecutiveLogIn: number;
  lastLoggedDate: number;
  isAdmin: boolean;

  constructor() {
    this.uid = '';
    this.username = '';
    this.email = '';
    this.avatar = 'assets/default_avatar.png';
    this.hobbies = '';
    this.gender = '';
    this.location = '';
    this.country = '';
    this.nuuBits = 0;
    this.consecutiveLogIn = 0;
    this.lastLoggedDate = 0;
    this.isAdmin = false;
  }
}
