var express = require('express');

var app = express();

app.set("view engine", "ejs");

var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req,res)=>{
  res.end('hello!!');

})
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  if(urlDatabase.hasOwnProperty(req.params.id)){
    templateVars.fullUrl = urlDatabase[req.params.id];
  }else templateVars.fullUrl = "Url not in database."
  res.render("urls_show", templateVars);
  //console.log(urls_show);
  //console.log(req.params.id);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.listen(PORT,()=>{

  console.log(`Example app listening on port ${PORT}!`);

})

