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
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //console.log(shortURL);
  //console.log(req.body);  // debug statement to see POST parameters
  //res.send("Ok");
  //console.log(shortURl);
  res.redirect(`/u/${shortURL}`);
  console.log(urlDatabase);        // Respond with 'Ok' (we will replace this)
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

  let templateVars = { shortURL: req.params.id };
  if(urlDatabase.hasOwnProperty(req.params.id)){
    templateVars.fullUrl = urlDatabase[req.params.id];
  }
  else {
    templateVars.fullUrl = "Url not found."
  }
  res.render("urls_show", templateVars);
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
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  var shortURL = req.params.shortURL;
  console.log(urlDatabase[shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");

});

app.listen(PORT,()=>{

  console.log(`Example app listening on port ${PORT}!`);

})

