# youtube-notificator
Notify social network of new videos
Because Youtube has disabled the notification on Twitter because.... we don't know why, I made this project to check if a new video is published and tweet it

# Configuration

## For Google :

- Follow the Step 1 available [here](https://developers.google.com/youtube/v3/quickstart/nodejs).
- Put your downloaded file in : config/client_secret.json

## For Twitter :

- Create an app [here](https://developer.twitter.com/en/apps)
- In the app, click in "Keys and tokens" and get your keys to fill the .env file

## For the notificator :

- Fill the .env file to specify the number of minutes between 2 calls
- Fill the .env file to specify the number of result you want by google call (it will change your API consommation, depending on your call interval)
