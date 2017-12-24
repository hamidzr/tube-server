// require youtube-dl cli tool

const fse = require('fs-extra'),
  axios = require('axios'),
  debug = require('debug'),
  { exec } = require('child-process-promise');

const logger = {
  log: debug('tube:yt:log'),
  error: debug('tube:yt:error'),
}
const YT_KEY = process.env['YT_KEY'];

const categories = {1: "Film & Animation",  2: "Autos & Vehicles",  10: "Music",  15: "Pets & Animals",  17: "Sports",  18: "Short Movies",  19: "Travel & Events",  20: "Gaming",  21: "Videoblogging",  22: "People & Blogs",  23: "Comedy",  24: "Entertainment",  25: "News & Politics",  26: "Howto & Style",  27: "Education",  28: "Science & Tech",  29: "Nonprofits",  30: "Movies",  31: "Animation",  32: "Action/Adventure",  33: "Classics",  34: "Comedy",  35: "Documentary",  36: "Drama",  37: "Family",  38: "Foreign",  39: "Horror",  40: "Sci-Fi/Fantasy",  41: "Thriller",  42: "Shorts",  43: "Shows",  44: "Trailers"};

let urlToId = function(url) {
  const regex = /(?!youtube)(?!feature)[a-zA-Z0-9_-]{7,15}/
  if (url.match(regex)) {
    return url.match(regex)[0];
  } else {
    throw new Error('invalid youtube url');
  }
}

let details = function(id) {
  logger.log('requesting details for', id);
  let url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${YT_KEY}&part=snippet,contentDetails,statistics`;
  return axios.get(url)
    .then( ({ data }) => {
      if (!data.pageInfo.totalResults > 0) throw new Error('invalid id.');
      let res = data.items[0];
      let details = {
        title: res.snippet.title,
        description: res.snippet.description,
        tags: res.snippet.tags,
        thumbnails: res.snippet.thumbnails,
        id: id,
        producer: res.snippet.channelTitle,
        duration: res.contentDetails.duration,
        category: categories[res.snippet.categoryId],
        views: res.statistics.viewCount,
        likes: res.statistics.likeCount,
        language: res.snippet.defaultAudioLanguage,
        publishedAt: res.snippet.publishedAt
      };
      return details;
    })
};


// clip is a youtube obj with name and id
let dl = function(clip, format='mp4', quality='mq') {
  const ASSETS_DIR = 'public/media',
    fName = `${clip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${quality}.${format}`,
    url = 'http://youtube.com/watch?v=' + clip.id,
    path = ASSETS_DIR + '/' + fName;

  let cmd;
  let fQuality = quality === 'hq' ? '22' : '18/5/36/worst';

  // TODO trim title
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
  details,
  dl,
};
