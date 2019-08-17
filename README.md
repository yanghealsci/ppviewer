# ppviewer

## Install
```
npm install #node version 7x
```
## Before you start
### Change backend ip
1. open wp.cfg/webpack.config.debug.babel
2. Change proxy ip
```
proxy: {
        '/dr/*': {
          target: 'http://10.0.0.57:5000', // change this line
          secure: false,
          changeOrigin: true
        }
      }
```

### use your own google API key
1. go to https://developers.google.com/maps/documentation/javascript/libraries, click 'YOURKEY' to get a KEY
2. search "APIKEY" in the source code and replace all search results with your key

## Run in dev mode
```
npm start
```
localhost:8089



