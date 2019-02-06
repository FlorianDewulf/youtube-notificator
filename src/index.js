const path = require('path')
const Youtube = require('./Youtube.js')
const Twitter = require('./Twitter.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
let lastId = { value: null }
let twitter = new Twitter()

console.log('LAST ID', lastId)
/**
 * Retrieve the videos and notify thanks to Twitter
 */
function notify () {
  callAPI(null).then((result) => {
    if (result.items.length) {
      console.log('POST TWITTER')
      console.log(result.items)
      // Tweet the new videos
      twitter.tweetNotifs(result.items)
      lastId.value = result.items[0].id
      console.log('new id : ', lastId.value)
    }
  }).catch((e) => {
    console.log(e)
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
    notify()
  }, 1000 * 60 * process.env.MINUTE_INTERVAL)
}).catch((e) => {
  console.log(e)
})
