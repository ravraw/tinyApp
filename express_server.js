const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Encyrpts cookies
const bcrypt = require('bcrypt');

// Handles cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'SuperSecureSecret',
}));


//----------URL DATABASE ----------------//

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'a4a536',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'agdth7',
  },
};

// -------------USERS DATABASE --------------//
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
};

// ------------FUNCTION GENERATES  RANDOM ID-----------//

function generateRandomString() {
  let randomId = '';
  while (randomId.length < 6) {
    randomId += Math.floor(Math.random() * 9);
    randomId += String.fromCharCode(Math.floor(Math.random() * (122 - 97)) + 97);
  }
  randomId.toString();
  return randomId;
}

//-------------FUNCTION CHECKS USER STATUS -------------//

const checkUserStatus = (currentUser) => {
  for (const user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
};

//-------------FUNCTION IDENTIFYES USERS OWN URLS ---------//
function urlsForUser(id) {
  let usersUrls = {};
  for (url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      usersUrls[url] = urlDatabase[url];
    }
  }
  return usersUrls;
}

// ----------------- ALL GET REQUESTS ---------------------------//



app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//-----Loads the root or login - register page---//

app.get('/', (req, res) => {
   res.render('urls_register.ejs');
});

//-----Directs to register page ------//

app.get('/register', (req, res) => {
  res.render('urls_register');
});


//--------directs to login Page ------//
app.get('/login', (req, res) => {
  const templateVars = {
    users,
    urls: urlDatabase,
    user_id: req.session.user_id,
  };
  res.render('login', templateVars);
});

// ------Checksif user is logged-in before redering create a new tiny url page------//

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.status(401).send('Error: 401: Not autorized , Please <a href="/register"> Register </a>');
  }
  if (checkUserStatus(req.session.user_id)) {
    const templateVars = {
      users,
      urls: urlDatabase,
      user_id: req.session.user_id,
    };
    return res.render('urls_new', templateVars);
  }

  return res.status(401).send('Error: 401: Not autorized , Please <a href="/login"> Login </a>');
});

// -----Renders the URLs ofthe logged in user else send to login page ------//

app.get('/urls', (req, res) => {
  if (checkUserStatus(req.session.user_id)) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id),
      users,
      user_id: req.session.user_id,
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

//------Link to show the web page of short urls ------//

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// ----- shows the edit page if the user is owner of the short url -----//
app.get('/urls/:shortURL', (req, res) => {
  if (checkUserStatus(req.session.user_id)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.id],
      users,
    };
    shortURL = req.params.shortURL;

    if (req.session.user_id === urlDatabase[shortURL].userID) {
      res.render('urls_show', templateVars);
    }
  } else {
    res.status(403).send('403: Not authorised to edit ');
  }
});

//----------------------------------------------------------//

// -----------------POST REQUESTS ---------------------------//



// ---- registers a new user and checks the inputs are correct ----//
app.post('/register', (req, res) => {
  const randomId = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Error: Enter a valid Email and Password');
  }
  for (key in users) {
    if (users[key].email === `${req.body.email}`) {
      return res.status(400).send('Error: Email id already taken');
    }
  }
  users[randomId] = {
    id: `${randomId}`,
    email: `${req.body.email}`,
    password: bcrypt.hashSync(req.body.password, 10),
    loggedIn: false,

  };
  req.session.user_id = `${randomId}`;
  res.redirect('/login');
});


// ----------Checks the inputs for the user trying to login and show the urls of the owner -----//
app.post('/login', (req, res) => {
  let loggedin = false;

  for (const key in users) {
    if (users[key].email === req.body.email && bcrypt.compareSync(req.body.password, users[key].password)) {
      loggedin = true;
    }
  }
  if (loggedin) {
    const templateVars = {
    urls: urlsForUser(req.session.user_id),
    users,
    user_id: req.session.user_id,
  };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/register');
  }

});

// ------Logouts the user and end the session ----------//

app.post('/logout', (req, res) => {
  console.log('1');
  console.log(req);
  req.session = null;
  res.redirect('/');
});
//-------Adds a new tiny url to the owners list -------//
app.post('/urls/new', (req, res) => {
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    users,
    user_id: req.session.user_id,
  };
  res.render('urls_index', templateVars);
});


// ---------deletes the short url if belongs to the current user -----//

app.post('/urls/:shortURL/delete', (req, res) => {
  if (checkUserStatus(req.session.user_id)) {

    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
    }
    res.redirect('/urls');
    return;
  }
  res.status(403).send('403: Not authorised to delete ');
});


// --------edits the short url if belongs to the current user -------//

app.post('/urls/:shortURL', (req, res) => {

  if (checkUserStatus(req.session.user_id)) {
    if (req.session.user_id === urlDatabase[shortURL].userID) {
      urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
    }
    res.redirect('/urls');
  } else {
    res.status(403).send('403: Not authorised to edit ');
  }
});

//----------------------------------------------------------//

//----------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

