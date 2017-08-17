const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate:{
            validator: (value)=>{
                return validator.isEmail(value);
            },
        message:'{VALUE} is not a valid Email'
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    DLNumber: {
      type: String,
      required: true
    },
    address: {
        type: String,
        required: false
    },
    idFile :{
        type: Buffer
    },
    recFile: {
        type: Buffer
    },
    cart: [{
        itemId: {
        type: mongoose.Schema.Types.ObjectId,
        requied: true
        },
        name: {
            type: String,
        },
        units: {
            //i.e. grams, items
            type: String
        },
        quantity: {
            type: Number
        },
        ppe: {
            type: Number
        },
        ppq: {
          type: Number
        },
        pph: {
          type: Number
        },
        ppo: {
          type: Number
        },
        pphg_extract: {
          type: Number
        },
        ppg_extract: {
          type: Number
        },
        ppi: {
          type: Number
        }
    }],
    deliveries: [{
      tranId: {
        type: mongoose.Schema.Types.ObjectId,
      }
    }],
    admin: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    termsAccepted: {
      type: Boolean,
      default: false
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    //we do this so sensitive info like token/password dont get sent back.
    //we have to convert from mongoose to normal object so we can pick
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email', 'firstName', 'lastName', 'DLNumber', 'phoneNumber', 'address', 'cart', 'admin', 'deliveries', 'verified', 'termsAccepted']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
}

//why do we call user.save in server and user .js?

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        // return new Promise((resolve,reject) => {
        //     reject();
        // });
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });

};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if(!user){
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            })
        });
    });
};

UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
