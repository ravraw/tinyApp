var express = require('express');
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())


app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}



function generateRandomString() {
  var randomId = '' ;
 //var  randomId = Math.random().toString(36).substring(2,5) + Math.random().toString(36).substring(2,5);;
 while(randomId.length < 6){
  randomId += Math.floor(Math.random()*9);
  randomId += String.fromCharCode(Math.floor(Math.random() * (122 - 97) ) + 97);
  }
  randomId.toString();
  console.log(randomId);
  return randomId ;
}

// document.getElementsByTagName('a').onClick((event)=>{
// console.log(event.target.innerHTML);

// })

//generateRandomString();

app.get('/', (req,res)=>{
  res.end('hello!!');

})
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
  urls: urlDatabase,
  username:req.cookies.username,
};
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/u/${shortURL}`);
  console.log(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  console.log('working');
  var shortURL = req.params.shortURL;
  console.log(shortURL);
  var longURL = urlDatabase[shortURL];
  res.redirect(urlDatabase[shortURL]);
  res.status(301).send({ error: 'temporary redirect"' });
});


app.get("/urls/:id", (req, res) => {
  console.log('/urls/:id');

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username:req.cookies.username,
  };

  res.render("urls_show", templateVars);

});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username:req.cookies.username,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {

  var shortURL = req.params.shortURL;
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {

  urlDatabase[req.params.shortURL] = req.body.updatedURL;

  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
 res.clearCookie('username');
 //console.log(req.body);

 res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    //username:req.cookies.username,
  };
 res.cookie("username", req.body.username);
 //console.log(req.body.username);

 res.redirect("/urls");
});

app.listen(PORT,()=>{

  console.log(`Example app listening on port ${PORT}!`);

})

