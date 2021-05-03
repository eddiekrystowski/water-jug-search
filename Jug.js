
//simple Jug class 
class Jug {
  constructor(size) {
    this.level = 0;
    this.size = size;
  }
  

  
  //returns shallow copy of itself
  copy(){
    let c = new Jug(this.size);
    c.level = this.level;
    return c;
  }
}