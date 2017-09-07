require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
var jpeg = require('jpeg-js');
const fileUpload = require('express-fileupload');


var {
  mongoose
} = require('./db/mongoose');
var {
  Journey
} = require('./models/journey');
var {
  User
} = require('./models/user');
var {
  Image
} = require('./models/image');
var {
  authenticate
} = require('./middleware/authenticate');

const {
  ObjectID
} = require('mongodb');

const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'confirmation.herbalrun@gmail.com',
    pass: 'HerbsRunning6'
  }
});

var app = express();
const port = process.env.PORT || 3000;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, x-auth');
  res.setHeader('Access-Control-Expose-Headers', 'x-auth');
  next();
});

app.use(bodyParser.json());
app.use(fileUpload());

//-----------testing file upload-----------------
app.post('/upload', (req, res) => {
  console.log('---------1------------');
  console.log(req.files);
  console.log('----------2-----------');

  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  } else {
    let sampleFile = req.files.sampleFile;
    console.log(sampleFile);

    let image = new Image({
      name: "sampleFile",
      file: req.files.sampleFile.data
    });

    image.save().then(() => {
      res.send('Uploaded')
    }).catch((e) => {
      console.log(e);
      res.status(500).send(e);
    })
  }
});

app.get('/image', (req, res) => {
  Image.find().then((images) => {
    console.log(images[0].file);
    // var image = new Image();
    // image.src = `data:image/png;base64,${images[0].file}`;
    var decodedImage = new Buffer(images[0].file, 'base64');
    fs.writeFile(__dirname + '/image_decoded.jpg', decodedImage, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + '/image_decoded.jpg');
      }
    });
  }).catch((e) => {
    console.log(e);
  })
});


//----------------------------

app.post('/users', (req, res) => {
  //creates a user
  var body = _.pick(req.body, ['username', 'email', 'password']);
  var user = new User(body);
  user.itineraries = [];

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    console.log(e);
    res.status(400).send(e);
  })
});

//---------------------------------Upload stuff (for users)------------------------------

app.post('/users/upload/id/:userId', (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  } else {
    let idFile = req.files.file.data;

    User.findOneAndUpdate({
        _id: req.params.userId
      }, {
        $set: {
          idFile
        }
      }, {
        new: true
      })
      .then((user) => {
        res.send({
          user
        });
      }).catch((e) => {
        res.status(400).send();
      })
  }
});

app.get('/users/files/id/:id', (req, res) => {
  User.findOne({
    _id: req.params.id
  }).then((user) => {
    var decodedImage = new Buffer(user.idFile, 'base64');
    fs.writeFile(__dirname + `userId_user=${req.params.id}.jpg`, decodedImage, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + `userId_user=${req.params.id}.jpg`)
      }
    })
  }).catch((e) => {
    console.log(e);
  })
});


//---------------------------------Upload stuff (for images)------------------------------

app.post('/upload/journey/:journeyId', (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  } else {
    let imageFile = req.files.file.data;

    journey.findOneAndUpdate({
        _id: req.params.journeyId
      }, {
        $set: {
          imageFile
        }
      }, {
        new: true
      })
      .then((journey) => {
        res.send({
          journey
        });
      }).catch((e) => {
        res.status(400).send();
      })
  }
});

app.get('/upload/journey/:journeyId', (req, res) => {
  journey.findOne({
    _id: req.params.journeyId
  }).then((user) => {
    var decodedImage = new Buffer(user.imageFile, 'base64');
    fs.writeFile(__dirname + `journeyId=${req.params.journeyId}.jpg`, decodedImage, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + `journeyId=${req.params.journeyId}.jpg`)
      }
    })
  }).catch((e) => {
    console.log(e);
  })
});

//---------------------------------Upload stuff------------------------------

app.patch('/users/:id', authenticate, (req, res) => {
  //edit user info
  //needs testing. Not used in project so far.
  var id = req.user._id;
  var body = _.pick(req.body, ['email', 'password', 'address', 'firstName', 'lastName', 'phoneNumber', 'DLNumber']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  User.findOneAndUpdate({
      _id: id
    }, {
      $set: body
    }, {
      new: true
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({
        user
      });
    }).catch((e) => {
      res.status(400).send();
    });
});


app.post('/journey', authenticate, (req, res) => {

  var journey = new Journey({
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    destination: req.body.destination,
    title: req.body.title,
    imageFileName: req.body.imageFileName,
    _creator: req.user._id
  });

  journey.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send('Unable to save');
  });
});

app.patch('/journey/addentry/:id', authenticate, (req, res) => {

  var newEntry = {
    entryText: req.body.entries
  }

  Journey.findOneAndUpdate({
      _id: req.params.id
    }, {
      $push: {
        entries: newEntry
      }
    }, {
      new: true
    })
    .then((doc) => {
      res.send(doc)
    }).catch((e) => {
      res.status(400).send('Unable to update')
    });
});

app.get('/journey', (req, res) => {

  Journey.find().then((journey) => {
    res.send({
      journey
    });
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/journey/me', authenticate, (req, res) => {

  Journey.find({
    _creator: req.user._id
  }).then((journey) => {
    res.send({
      journey
    });
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/journey/:id', (req, res) => {
  //returns journey by id

  Journey.findOne({
    _id: req.params.id
  }).then((journey) => {
    if (!journey) {
      return res.status(404).send();
    }
    res.send({
      journey
    })
  });
});

app.delete('/journey/:id', authenticate, (req, res) => {
  //deletes journey by id

  var id = req.params.id;

  Journey.findOneAndRemove({
    _id: id
    // _creator: req.user._id //this makes sure its right person
  }).then((journey) => {
    res.send({
      journey
    });
  }).catch((e) => {
    res.status(400).send('delete route not working');
  });
});

app.patch('/journey/:id', authenticate, (req, res) => {

  var id = req.params.id;

  Journey.findOneAndUpdate({
    _id: id
  }, {
    $set: req.body
  }, {
    new: true
  }).then((journey) => {
    if (!journey) {
      return res.status(404).send();
    }
    res.send({
      journey
    });
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/users/me', (req, res) => {
  //returns the user
  res.send(req.user);
});

app.get('/users', (req, res) => {
  //returns all the users

  if (req.user.admin == false) {
    return res.send(401);
  }

  User.find().then((user) => {
    res.send({
      user
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/users/:id', (req, res) => {

  if (req.user.admin == false) {
    return res.send(401);
  }

  User.findOne({
    _id: req.params.id
  }).then((user) => {
    if (!user) {
      return res.status(404).send();
    };
    res.send({
      user
    });
  })
})


app.get('/users/itineraries/:id', (req, res) => {
  //returns a the itineraries by user id

  User.findOne({
    _id: req.params.id
  }).then((user) => {
    if (!user) {
      return res.status(404).send();
    };
    var itineraries = user.itineraries;
    res.send({
      itineraries
    });
  }).catch((e) => {
    res.status(400).send();
  })
})

app.post('/users/login', (req, res) => {
  //login

  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  //logout

  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.patch('/itineraries', (req, res) => {
  var body = _.pick(req.body, ['journeyId']);

  User.findOneAndUpdate({
      _id: req.user._id
    }, {
      $push: {
        itineraries: body
      }
    }, {
      new: true
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({
        user
      });
    }).catch((e) => {
      console.log(e);
      res.status(400).send();
    });
});;

app.delete('/users/itineraries/:id', authenticate, (req, res) => {
  // removes journey from itineraries

  User.findOneAndUpdate({
      _id: req.user._id
    }, {
      $pull: {
        itineraries: {
          _id: req.params.id
        }
      }
    }, {
      new: true
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({
        user
      });
    }).catch((e) => {
      res.status(400).send();
    })
});





app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {
  app
};