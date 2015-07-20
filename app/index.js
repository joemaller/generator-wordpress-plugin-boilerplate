'use strict';

var path = require('path');
var _ = require('lodash');
var request = require('request');
var unzip = require('unzip');
var concat = require('concat-stream')

var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    this.defaults = this.fs.readJSON(path.join(__dirname, 'defaults.json'));
  },

  prompting: function() {
    var done = this.async();
    this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Name of the Plugin',
      default: this.defaults.name
    }, {
      type: 'input',
      name: 'slug',
      message: 'Plugin slug (folder/file name)',
      default: function(answers) {
        return _.kebabCase(answers.name);
      }
    }], function(answers) {
      this.settings = answers;
      done();
    }.bind(this));
  },

  configuring: function() {
    var _this = this;
    this.log(this.destinationRoot());

    request('https://github.com/DevinVinson/WordPress-Plugin-Boilerplate/archive/master.zip')
      .pipe(unzip.Parse())
      .on('entry', function(entry) {

        entry.path = entry.path.replace(/(?:WordPress-Plugin-Boilerplate-master\/)?plugin-name/g, this.settings.slug);
        var writeFile = function(file) {
          // file = file.toString().replace(/[aeiou]/g, '☃');
          _this.fs.write(entry.path, file.toString());
        };
        var concatStream = concat(writeFile);
        if (entry.type == 'File' && entry.path.indexOf(this.settings.slug) > -1) {
          entry.pipe(concatStream);
        } else {
          entry.autodrain();
        }
      }.bind(this));
  },

  install: function() {
    // this.spawnCommand('composer', ['install']);
  }
});