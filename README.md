# Coffee Counter

This is a little WebApp which has been created due to demands in our office:
- how can we easily track the coffee consume of every employee?,
- how can we track the individual purchases like coffee beans, milk etc.?,
- how can we fairly bill every drinker and pay every buyer?,
- how can we make the life easier for those who administer the whole stuff?

The coffee counter does some great job for us, and hopefully will do for you.

**Warning:** The whole texts on the UI frontend are in German, due to lack of time for translation. So these have to be adopted to your language first.

## Using the project

The coffee counter webapp runs under [node.js](https://nodejs.dev/en/) on [Docker](https://www.docker.com/).
So a little `docker-compose up` command should do the work. But before that some preparation has to be done:

### 1. Prepare the .env file

An `.env` file in the root folder holds some of the variables like a secret string, account information, API keys etc. which should be kept secret.

The app uses [MongoDB](https://www.mongodb.com/atlas/database) as a Database backend (more specifically I use [MongoDB Atlas](https://www.mongodb.com/atlas)) as a backend.
Furthermore [Sendgrid](https://sendgrid.com/) is used as a service for sending emails securely and performantly. 

**Create an file named `.env` in the root folder and prepare the following variables:**

```shell
SENDGRID_API_KEY='Your Sendgrid API Key' # get the key here: https://docs.sendgrid.com/ui/account-and-settings/api-keys

MONGO_TESTDB_URI='the url/connection string to mongodb for development' # used in app.js
MONGODB_URI='the url/connection string to mongodb or mongodb atlas for production' # used in app.js

SESSION_SECRET='a long and random string' # used in app.js

BASE_URL='the url where your app is running' # used in util/constants.js

FROM_EMAIL='email address mails are sent from' # used in util/constants.js

PAYPAL_LINK='https://paypal.me/yourpaypalhandle' # used in util/constants.js

# more stuff you like to keep secret
```

### 2. Install docker and docker-compose on your Server

All the instructions you should find [here](https://docs.docker.com/engine/install/) and [here](https://docs.docker.com/compose/install/).

### 3. run docker-compose and build the container

On your Server run: `sudo docker-compose up -d`. This should build a container,
install all required modules via `npm install` and starts the app via `node app.js` in the background.

If you change stuff after initially built the container:
- stop the container with: `sudo docker-compose down`
- rebuild the container with: `sudo docker-compose up --build -d`

## Resources used
- [Material Color Palette](https://material.io/resources/color/#!/?view.left=0&view.right=0&primary.color=1A237E&secondary.color=E91E63) 
- [Material Symbols and Icons](https://fonts.google.com/icons)
- [Icons8](https://icons8.com/icons)