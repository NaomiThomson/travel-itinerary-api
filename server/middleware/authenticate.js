var {
    User
} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    console.log(req);
    console.log(token);

    User.findByToken(token).then((user) => {
        if (!user) {
            console.log('cant find user');
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send('error in authenticate');
    });
};

module.exports = {
    authenticate
};