



function Potter(name) {

    this.name = name;
    
    this.getSaludo = function (){
        console.log("viva gryfindor")}
    
}


  
  var Harry = new Potter('Harry');
  //var greet = Harry();

  console.log("hola " +Harry.name ," ",Harry.getSaludo  );
  Harry.getSaludo();