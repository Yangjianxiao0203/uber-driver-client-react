// interface UserInterface {
//     uid: string;
//     phoneNumber: string;
//     identity: string;
//     secretKey: string;
//     userName: string;
//     carNumber: string;
//     carType: string;
//     totalRideLength: number;
//     province: string;
//     city: string;
// }

class User {
    uid: string;
    phoneNumber: string;
    identity: string;
    secretKey: string;
    userName: string;
    carNumber: string;
    carType: string;
    totalRideLength: number;
    province: string;
    city: string;

    constructor(data: any) {
      this.uid = data.uid;
      this.phoneNumber = data.phoneNumber;
      this.identity = data.identity;
      this.secretKey = data.secretKey;
      this.userName = data.userName;
      this.carNumber = data.carNumber;
      this.carType = data.carType;
      this.totalRideLength = data.totalRideLength;
      this.province = data.province;
      this.city = data.city;
    }
  }
  
  export default User;
  