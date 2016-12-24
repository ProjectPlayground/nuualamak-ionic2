import * as firebase from 'firebase';

export class FirebaseService {

  constructor() {
    // Initialize Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyCKkm-ygpIBE8N_6dxnuRAB2162f9PCDcs",
      authDomain: "nualamak-69388.firebaseapp.com",
      databaseURL: "https://nualamak-69388.firebaseio.com",
      storageBucket: "nualamak-69388.appspot.com",
      messagingSenderId: "553310806258"
    });
  }
}
