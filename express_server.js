var express = require('express');

var app = express();

app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

function generateRandomString() {
 var  randomId = '';
 while(randomId.length < 6){
  randomId += Math.floor(Math.random()*9);
  randomId += String.fromCharCode(Math.floor(Math.random() * (122 - 97) ) + 97);
  }
  randomId.toString();
  console.log(randomId);
}

generateRandomString();

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
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  if(urlDatabase.hasOwnProperty(req.params.id)){
    templateVars.fullUrl = urlDatabase[req.params.id];
  }else {templateVars.fullUrl = "Url not found."
  res.render("urls_show", templateVars);}
  //console.log(urls_show);
  //console.log(req.params.id);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// app.get("/urls/new", (req, res) => {
//   res.render("urls_new");
// });

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // debug statement to see POST parameters
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });


app.listen(PORT,()=>{

  console.log(`Example app listening on port ${PORT}!`);

})

