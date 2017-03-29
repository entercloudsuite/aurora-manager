var request = require("request");
var config = require('dotenv').config({path: '.env.ci'})

var app = require("../../build/app/app.js")

var base_url = "http://localhost:3001/"

describe("gateway", function() {
  describe("GET default route /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });

    });
  });
});