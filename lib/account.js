'use strict';

const {SHA1} = require("crypto-js");
const randomstring = require("randomstring");

class Account {

  constructor() {
  }

  initialize(username, password) {
    this.username = username;
    this.salt = randomstring.generate(32);
    this.password = SHA1(password + this.salt).toString();
    return this
  }

  fromDb(params) {
    this.username = params.username;
    this.password = params.password;
    this.salt = params.salt;
    return this
  }

  passwordMatches(password) {
    return SHA1(password + this.salt).toString() === this.password
  }
}

module.exports = Account;
