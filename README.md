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

- Fill the .env file to specify the number of minutes between 2 calls with the variable MINUTE_INTERVAL
- Fill the .env file to specify the number of result you want by Youtube call. The value should be between 5 and 50

/!\ Be careful. Each Google call use some points. You have 10 000 points each days.
Quick Math : 60*24 = 1440 minutes per day. 1440 / 100 ~= 15.
So if you want to consume all your points in one day without failed request, the best interval is 15 minutes.
You have to know an initial call of 7 points is made at the begining of the program.
**The number of result by Youtube call doesn't change the "price" of each call**
