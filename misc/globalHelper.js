export default class globalHelper {
  
  //return current date time.
  static currentDateTime() {
    let ct_ = new Date();
    let dd = String(ct_.getDate()).padStart(2, "0");
    let mm = String(ct_.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = ct_.getFullYear();
    let hrs = ct_.getHours();
    let min = ct_.getMinutes();

    if(min.length == 1){
      min = "0" + min;
    }
    if(hrs.length == 1){
      hrs = "0" + hrs;
    }
    var str = "";    
    ct_ = str.concat(dd, '/', mm, '/', yyyy, " ", hrs, ":", min);
    return ct_;
  }
}
