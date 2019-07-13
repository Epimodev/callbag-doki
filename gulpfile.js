const { src, dest, series } = require('gulp');
const through2 = require('through2');
const terser = require('gulp-terser');
const shell = require('shelljs');

const constants = [
  { text: 'CALLBAG_START', by: '0' },
  { text: 'CALLBAG_RECEIVE', by: '1' },
  { text: 'CALLBAG_FINISHING', by: '2' },
];

const cleanJsFile = through2.obj(function(file, _, cb) {
  if (file.isBuffer()) {
    let code = file.contents.toString();

    // REMOVE `"use strict";`
    code = code.replace('"use strict";', '');

    // FOR ALL JS FILES EXCEPT `module/index.js` which contains constants to replace
    if (!file.path.includes('module/index.js')) {
      // REMOVE `./types` IMPORTS
      code = code.replace(/var.+require\("(..\/?)+index"\);?/, '');

      // REPLACE CONSTANTS BY THEIR VALUES
      constants.forEach(({ text, by }) => {
        const regex = new RegExp('([a-zA-Z0-9_]+.)?' + text, 'g');
        code = code.replace(regex, by);
      });
    }

    file.contents = Buffer.from(code);
  }

  cb(null, file);
});

function minify() {
  return (
    src('module/**/*.js')
      .pipe(cleanJsFile)
      .pipe(terser())
      .pipe(dest('./module'))
  );
}

function moveBuild(cb) {
  src('module/operators/**').pipe(dest('./operators'));
  src('module/sources/**').pipe(dest('./sources'));
  src('module/utils/**').pipe(dest('./utils'));
  src('module/index.*').pipe(dest('./'));

  cb();
}

function removePreviousBuild(cb) {
  shell.rm('-rf', './operators');
  shell.rm('-rf', './sources');
  shell.rm('-rf', './utils');
  shell.rm('./index.js');
  shell.rm('./index.d.ts');

  cb();
}

exports.default = series(removePreviousBuild, minify, moveBuild);
