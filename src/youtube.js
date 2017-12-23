// require youtube-dl cli tool

const fse = require('fs-extra'),
  debug = require('debug'),
  { exec } = require('child-process-promise');

const logger = {
  log: debug('tube:yt:log'),
  error: debug('tube:yt:error'),
}

let urlToId = function(url) {
  const regex = /(?!youtube)(?!feature)[a-zA-Z0-9_-]{7,15}/
  if (url.match) {
    return url.match[0];
  } else {
    throw new Error('invalid youtube url');
  }
}

// clip is a youtube obj with name and id
let dl = function(clip, format='mp4', quality='mq') {
  const ASSETS_DIR = 'public/media',
    fName = `${clip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${quality}.${format}`,
    url = 'http://youtube.com/watch?v=' + clip.id,
    path = ASSETS_DIR + '/' + fName;

  let cmd;
  let fQuality = quality === 'hq' ? '22' : '18/5/36/worst';

  if (format === 'mp4') {
    cmd = `youtube-dl -f ${fQuality} --write-sub --sub-lang en --max-filesize 500m ${url} -o ${path}`
  }

  // TODO sanitize cmd (mostly id and name)
  return exec(cmd)
    .then(res => {
      logger.log(res.stdout);
      logger.log(res.stderr);
      return path;
    })
    .catch(logger.error);
}

module.exports = {
  urlToId,
  dl,
};
