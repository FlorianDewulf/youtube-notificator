const path = require('path')
const Youtube = require('./Youtube.js')
const Twitter = require('./Twitter.js')
const logger = require('./logger')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
let lastId = { value: null }
let twitter = new Twitter()

let hourBegin = null
let hourEnd = null

if (process.env.HOUR_BEGIN.length && process.env.HOUR_END.length) {
  hourBegin = parseInt(process.env.HOUR_BEGIN)
  hourEnd = parseInt(process.env.HOUR_END)

  if (!isNaN(hourBegin) && !isNaN(hourEnd) && hourBegin >= 0 && hourBegin < hourEnd && hourEnd <= 24) {
    console.log(`Will call between ${hourBegin}h and ${hourEnd}h`)
  } else {
    hourBegin = null
    hourEnd = null
  }
}

/**
 * Retrieve the videos and notify thanks to Twitter
 */
function notify () {
  callAPI(null).then((result) => {
    if (result.items.length) {
      logger.getLogger().info('POST TWITTER')
      logger.getLogger().info(result.items)
      // Tweet the new videos
      twitter.tweetNotifs(result.items)
      lastId.value = result.items[0].id
      logger.getLogger().info(`New last id : ${lastId.value}`)
    }
  }).catch((e) => {
    logger.getLogger().error(e)
  })
}

/**
 * Call the google API recursively to retrieve the videos
 * @param {string} pageToken The token used for the pagination
 * @return {Array<Object>}
 */
async function callAPI (pageToken) {
  let apiResult = await yt.getNewVideos(lastId, pageToken)

  if (apiResult.shouldRecall) {
    let additionnalItems = await callAPI(apiResult.nextToken)
    return {
      items: apiResult.items.concat(additionnalItems.items),
      nextToken: additionnalItems.nextToken
    }
  } else {
    return { items: apiResult.items }
  }
}

let yt = new Youtube()
yt.authorize().then(() => {
  // Initial call
  notify()
  // The calls made every x minutes
  setInterval(function () {
    const now = new Date()

    if ((!hourBegin && !hourEnd) || (now.getHours() >= hourBegin && now.getHours() < hourEnd)) {
      notify()
    }
  }, 1000 * 60 * process.env.MINUTE_INTERVAL)
}).catch((e) => {
  logger.getLogger().error(e)
})
