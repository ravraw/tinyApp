var express = require('express');
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())


app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2":{
      longURL:"http://www.lighthouselabs.ca",
      userID:"a4a536"
  },
  "9sm5xK":{
      longURL:"http://www.google.com",
      userID:"agdth7"
  },
}


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



function generateRandomString() {
  var randomId = '' ;
 //var  randomId = Math.random().toString(36).substring(2,5) + Math.random().toString(36).substring(2,5);;
 while(randomId.length < 6){
  randomId += Math.floor(Math.random()*9);
  randomId += String.fromCharCode(Math.floor(Math.random() * (122 - 97) ) + 97);
  }
  randomId.toString();
  return randomId ;
}

//--------------CHECK IF USER IS REGISTERED OR LOGGED IN -----//
const checkUserRegistration = (email, password) => {
  if (password === undefined) {
    for (user in users) {
      if (users[user].email === email){
        return true;
      }
    } return false;
  }
};

const checkUserStatus = (currentUser) => {

  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;

};



//-------------- REGISTER PAGE -------------//


app.get("/register", (req, res) => {

  res.render("urls_register");
});


app.post("/register", (req, res) => {
  let randomId = generateRandomString();
  if(req.body.email === '' || req.body.password === '' ){
    res.status(400).send("Error: Enter a valid Email and Password")
  }

  for(key in users){
    if (users[key].email === `${req.body.email}`){
      return res.status(400).send("Error: Email id already taken");
    }
  }
      //res.cookie("user_id",`${randomId}`);
      users[randomId]={
        id: `${randomId}`,
        email: `${req.body.email}`,
        password: `${req.body.password}`,
        loggedIn: false,

    }

      res.cookie("user_id",`${randomId}`);
      res.render("urls_register");
});

// -------LOGIN PAGES--------------///

app.get("/login", (req, res) => {

  res.render("login");
});

app.post("/login", (req, res) => {
  for(let key in users){
    if (users[key].email === req.body.email && users[key].password === req.body.password){
        users[key].loggedin = true ;
        res.cookie("user_id",users[key]);
        return res.redirect("/");
    }
  }
  return res.status(403).send("Error: Please enter a registered Email or Password");
});


//-------------------------------------//
// ----------- LOGOUT -----------------//

app.post("/logout",(req, res) => {

  req.session.user_id = null;
  res.redirect('/');
});

// -------------------------------------//

//---------------ROOT ---------------//

app.get('/', (req,res)=>{
  if(checkUserStatus)
  res.end('hello!!');

})

//--------------JSON -------------//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//------------------HELL0------------//

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


//------------LINK TO NEW --------------//

// app.post('/urls/new', (req, res) => {

//     let templateVars = {
//       users: users,
//       urls: urlDatabase,
//       user_id:req.cookies.user_id,
//       }

//    res.render("/urls");

// });



app.get("/urls/new", (req, res) => {
  if(req.cookies.user_id === undefined){
    return res.status(401).send('Error: 401: Not autorized , Please <a href="/register"> Register </a>');
  }
    if(checkUserStatus(req.cookies.user_id.id)) {
      let templateVars = {
      users: users,
      urls: urlDatabase,
      user_id:req.cookies.user_id,
      }
    return res.render("urls_new",templateVars);

    }

      return res.status(401).send('Error: 401: Not autorized , Please <a href="/login"> Login </a>');

});




// -------------------URLS --------------//

app.get("/urls", (req, res) => {
   let templateVars = {
    urls: urlDatabase,
    users: users,
    urls: urlDatabase,
    user_id:req.cookies.user_id,
  };
  res.render("urls_index",templateVars);
});


app.post("/urls", (req, res) => {
  //if (checkUserStatus(req.cookies.user_id.id)) {
    let newID = generateRandomString();
     urlDatabase[newID] = {
      longURL: req.body["longURL"],
      userID: req.cookies.user_id.id
     }
  res.redirect(req.body["longURL"]);
});


//-----------------

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  var longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// -------------------------------

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    users: users,
  };

  res.render("urls_show", templateVars);

});

//-------------------DELETE ------------------//

app.post("/urls/:shortURL/delete", (req, res) => {
  if(checkUserStatus(req.cookies.user_id.id)){
     //console.log(req.cookies.user_id);
    //console.log(req.cookies.user_id.id);
   // console.log(req.params);
    var shortURL = req.params.shortURL;
    if(req.cookies.user_id['id'] === urlDatabase[shortURL]['userID']){
    delete urlDatabase[req.params.shortURL];
    }
    res.redirect("/urls");
  }
    res.status(403).send('403: Not authorised to delete ');

});

//--------------------EDIT -------------------//

app.get("/urls/:shortURL/edit",(req,res)=>{
   if(checkUserStatus(req.cookies.user_id.id)){

    let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.id],
    users: users,
  };
  shortURL = req.params.shortURL;
  //console.log(req);
  if(req.cookies.user_id['id'] === urlDatabase[shortURL]['userID']){

      res.render("urls_show", templateVars);
    }
}else {
    res.status(403).send('403: Not authorised to edit ');
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(req);
    if(checkUserStatus(req.cookies.user_id.id)){
     if(req.cookies.user_id['id'] === urlDatabase[shortURL]['userID']){
  urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
      }
  res.redirect("/urls");
}
   //res.status(403).send('403: Not authorised to edit ');
});


//----------------------------------------------
app.listen(PORT,()=>{

  console.log(`Example app listening on port ${PORT}!`);

});

