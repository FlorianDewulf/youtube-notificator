const moment = require('moment')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl']
const TOKEN_DIR = path.join(__dirname, '..', 'config')
const TOKEN_PATH = path.join(TOKEN_DIR, 'youtube-nodejs.json')

class Youtube {
  constructor() {
    this.auth = null
    this.channelId = null
    this.client_secret = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'client_secret.json')))
  }

  /**
   * Authentication method
   */
  async authorize () {
    const clientSecret = this.client_secret.installed.client_secret
    const clientId = this.client_secret.installed.client_id
    const redirectUrl = this.client_secret.installed.redirect_uris[0]
    let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl)

    return new Promise((resolve, reject) => {
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          this.getNewToken(oauth2Client).then(() => {
            this.setChannelId().then(() => {
              resolve(this)
            }).catch((e) => {
              reject(e)
            })
          }).catch((e) => {
            reject(e)
          })
        } else {
          oauth2Client.credentials = JSON.parse(token)
          this.auth = oauth2Client
          this.setChannelId().then(() => {
            resolve(this)
          }).catch((e) => {
            reject(e)
          })
        }
      })
    })
  }

  /**
   * Get a new token if the token file doesn't exist
   * @param {Object} oauth2Client The OAuth client object
   * @return {Promise<Object>}
   */
  async getNewToken (oauth2Client) {
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })
    console.log('Authorize this app by visiting this url: ', authUrl)
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    return new Promise((resolve, reject) => {
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            console.log('Error while trying to retrieve access token', err)
            reject(err)
            return
          }
          oauth2Client.credentials = token
          this.storeToken(token)
          this.auth = oauth2Client
          resolve(oauth2Client)
        })
      })
    })
  }

  /**
   * Store the token object in a file
   * @param {Object} token The google token
   */
  storeToken (token) {
    try {
      fs.mkdirSync(TOKEN_DIR)
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) throw err
      console.log('Token stored to ' + TOKEN_PATH)
    })
    console.log('Token stored to ' + TOKEN_PATH)
  }

  /**
   * Get the channel id
   * @return {Promise<Object>}
   */
  async setChannelId () {
    const service = google.youtube('v3');
    return new Promise((resolve, reject) => {
      service.channels.list({
        auth: this.auth,
        part: 'snippet,contentDetails,statistics',
        mine: true
      }, (err, response) => {
        if (err || !response.data.items.length) {
          reject(err)
          return
        }
        this.channelId = response.data.items[0].id
        resolve(response.data.items[0])
      });
    })
  }

  /**
   * Retrieve the videos
   * @param {Moment} lastCall The last time it has been called
   * @param {String} pageToken The last page token, useful for the pagination
   * @return {Promise<Object>}
   */
  getNewVideos (lastCall, pageToken = null) {
    let service = google.youtube({ version: 'v3', auth: this.auth })
    let param = {
      part: 'snippet,id',
      channelId: this.channelId,
      maxResults: process.env.YT_MAX_RESULT,
      type: 'video',
      order: 'date',
      // IT DOESN'T WORK, THANKS GOOGLE
      // publishedBefore: `${moment().format('YYYY-MM-DDTHH:mm:ss')}Z`
      // publishedAfter: `${lastCall.format('YYYY-MM-DDTHH:mm:ss')}Z`
    }
    if (pageToken) {
      param.pageToken = pageToken
    }
    return new Promise((resolve, reject) => {
      service.search.list(param, (err, response) => {
        if (err) {
          reject(err)
          return
        }
        let processResult = this.processItems(response.data.items, lastCall)

        resolve({
          items: processResult.items,
          shouldRecall: processResult.shouldRecall,
          nextToken: response.data.nextPageToken
        })
      })
    })
  }

  /**
   * Transform the items
   * @param {Array} items The videos items retrieved
   * @param {Moment} lastCall The last time the videos have been retrieved
   * @return {Array<Object>}
   */
  processItems (items, lastCall) {
    const now = moment().utc()
    const filterdItems = items.filter((item) => {
      return moment(item.snippet.publishedAt).isBetween(lastCall, now)
    })
    return {
      items: filterdItems.map((item) => {
        return {
          title: item.snippet.title,
          link: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }
      }),
      // utc to add somewhere ?
      shouldRecall: (items.length && moment(items[items.length - 1].snippet.publishedAt).isBetween(lastCall, now))
    }
  }
}

module.exports = Youtube
