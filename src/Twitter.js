const twitterClient = require('twitter')

class Twitter {
  constructor () {
    this.client = new twitterClient({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_TOKEN_SECRET
    })
  }

  tweetNotifs (notifs) {
    Promise.all(notifs.map((notif) => {
      return this.tweetNotif(notif)
    })).then(() => {
      // it's ok
    }).catch((err) => {
      console.log(err)
    })
  }

  async tweetNotif (notif) {
    return new Promise((resolve, reject) => {
      this.client.post('statuses/update', {
        status: `${notif.title}\n${notif.link}`
      }, function (error, tweet, response) {
        if (!error) {
          reject(error)
        }
        resolve({ tweet, response })
      })
    })
  }
}

module.exports = Twitter
