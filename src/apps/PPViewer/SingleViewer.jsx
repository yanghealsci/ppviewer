import szData from './school_zone.json'
import 'whatwg-fetch'
import { Row, Col, Card, Empty } from 'antd'
// TODO: ADD YOUR KEY
const APIKEY = ''

const typeToColor = {
  'Primary': 'red',
  'Secondary': 'blue',
  'Combined': 'yellow'
}

const DIST = 1500

async function getNearbyX ({ lat, lng, type, map, dist = DIST }) {
  return new Promise(function (resolve, reject) {
    const coord = new google.maps.LatLng(lat, lng)

    const request = {
      location: coord,
      radius: `${dist}`,
      type: [type]
    }

    const service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results)
      } else {
        resolve([])
      }
    })
  })
}

async function getDist (origs, dests, tMode = 'WALKING') {
  return new Promise(function (resolve, reject) {
    const service = new google.maps.DistanceMatrixService()
    service.getDistanceMatrix({
      origins: origs,
      destinations: dests,
      travelMode: tMode
    }, (result, status) => {
      if (status === 'OK') {
        resolve(result)
      } else {
        resolve([])
      }
    })
  })
}

async function getRoute (orig, dest, map, tMode = 'TRANSIT') {
  return new Promise(function (resolve, reject) {
    var directionsService = new google.maps.DirectionsService()
    var directionsDisplay = new google.maps.DirectionsRenderer()
    directionsDisplay.setMap(map)

    var request = {
      origin: orig,
      destination: dest,
      travelMode: google.maps.TravelMode[tMode],
      transitOptions: {
        departureTime: new Date('2019-06-20 12:00')
      }
    }
    directionsService.route(request, function (response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response)
        resolve(response)
      } else {
        resolve({})
      }
    })
  })
}

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      address: '',
      formattedAdr: '',
      schoolZone: [],
      trainSts: [],
      nearestTrainSt: {},
      superMarkets: []
    }
    this.mapHandler = null
    this.drawings = []
    google.maps.geometry
    console.log('1:', google.maps.geometry)
  }
  componentDidMount () {
    this.initMap()
  }
  initMap () {
    this.mapHandler = new google.maps.Map(this.map, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 15
    })
    console.log(this.mapHandler)
  }
  drawMarkers (locs, type) {
    const icons = {
      'supermarket': 'http://maps.google.com/mapfiles/kml/pal3/icon18.png'
    }
    for (var i = 0; i < locs.length; i++) {
      var place = locs[i]
      const marker = new google.maps.Marker({
        position: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
        map: this.mapHandler,
        icon: icons[type] || place.icon,
        scale: 5
      })
      this.drawings.push(marker)
    }
  }
  async search () {
    // clear markers
    _.forEach(this.drawings, d => {
      d.setMap(null)
    })
    this.drawings = []

    const loc = await this.getLoc()
    this.setState({
      formattedAdr: _.result(loc, '[0].formatted_address')
    })
    const { lat, lng } = _.result(loc, `[0].geometry.location`)
    console.log('yy', lat, lng)
    this.mapHandler && this.mapHandler.setCenter({ lat, lng })
    const propMarker = new google.maps.Marker({
      position: { lat, lng },
      map: this.mapHandler,
      icon: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png',
      scale: 10
    })
    this.drawings.push(propMarker)
    const szs = this.getSchoolZone(lat, lng)
    await this.getNearbyTrain(lat, lng, this.mapHandler)
    await this.getNearestStore(lat, lng, this.mapHandler)
    this.setState({
      schoolZone: szs
    })
    _.forEach(szs, sz => {
      sz.poly.setMap(this.mapHandler)
    })
  }
  async getNearbyTrain (lat, lng, map) {
    const results = await getNearbyX({ lat, lng, map, type: 'train_station' })
    const coord = new google.maps.LatLng(lat, lng)
    this.getTrainDist(
      [coord],
      _.map(results, place => new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()))
    )
    this.getDistToCity(
      coord,
      new google.maps.LatLng(-37.8182711, 144.9670618),
      map
    )
    this.drawMarkers(results, 'train_station')
    this.setState({
      trainSts: results
    })
  }
  async getNearestStore (lat, lng, map) {
    const results = await getNearbyX({ lat, lng, map, type: 'supermarket', dist: DIST })
    this.drawMarkers(results, 'supermarket')
    this.setState({
      superMarkets: results
    })
  }
  async getTrainDist (origs, dests) {
    const result = await getDist(origs, dests)
    const ts = _.chain(result)
      .result('rows[0].elements')
      .map((e, i) => ({
        dist: e.distance.text,
        distVal: e.distance.value,
        dur: e.duration.text,
        durVal: e.duration.value,
        addr: _.result(result, `destinationAddresses[${i}]`)
      }))
      .minBy('durVal')
      .value()
    this.setState({
      nearestTrainSt: ts
    })
  }
  async getDistToCity (origs, dests, map) {
    const result = await getRoute(origs, dests, map, 'TRANSIT')
    console.log('to flinders st', result)
    const ts = _.chain(result)
      .result('routes')
      .map((e, i) => e.legs)
      .value()
    this.setState({
      toCity: ts
    })
  }

  getSchoolZone (lat, lng) {
    const result = []

    _.forEach(szData, sz => {
      const lats = sz.zone_lat.split('_')
      const lngs = sz.zone_lng.split('_')
      const coords = _.map(lats, (la, i) => {
        return {
          lat: parseFloat(la),
          lng: parseFloat(lngs[i])
        }
      })
      const szPolygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: typeToColor[sz.type],
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: typeToColor[sz.type],
        fillOpacity: 0.35
      })

      const pos = new google.maps.LatLng({ lat, lng })

      console.log('2:', google.maps.geometry)

      if (google.maps.geometry.poly.containsLocation(pos, szPolygon)) {
        result.push({
          ...sz,
          poly: szPolygon
        })
        const scMarker = new google.maps.Marker({
          position: { lat: sz.lat, lng: sz.lng },
          map: this.mapHandler
        })
        this.drawings.push(szPolygon)
        this.drawings.push(scMarker)
      }
    })
    return result
  }
  async getLoc (address) {
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.address}&key=${APIKEY}`)
      .then(res => res.json())
      .then(res => res.results)
      .catch(e => {
        window.alert('failed to get cordinates')
      })
  }
  render () {
    const inputStyle = {
      width: 500,
      height: 30,
      marginRight: 20
    }
    const buttonStyle = {
      width: 80,
      height: 30
    }

    const cartStyles = {
      background: '#efefef'
    }
    const { nearestTrainSt } = this.state
    return <div style={{ padding: 50 }}>
      <Row>
        <div>
          <label>Property Address: </label>
          <input
            style={inputStyle}
            onChange={e => this.setState({ address: e.target.value })}
            value={this.state.address} />
          <button style={buttonStyle} onClick={() => this.search()}>Search</button>
        </div>
      </Row>
      <p>{this.state.formattedAdr}</p>
      <Row gutter={50}>
        <Col span={14}>
          <div ref={ele => { this.map = ele }} style={{ width: '100%', height: 600 }} />
        </Col>
        <Col span={10}>
          <Card title='School zone' style={{ width: '100%' }} headStyle={cartStyles}>
            {
              _.isEmpty(this.state.schoolZone)
                ? <Empty />
                : <ul>
                  {
                    _.map(this.state.schoolZone, sz => {
                      return <li>{sz.name}, {sz.type}, {sz.gender}, {sz.score}</li>
                    })
                  }
                </ul>
            }
          </Card>
          <Card title={`Nearest train station(${DIST}m)`} style={{ width: '100%' }} headStyle={cartStyles}>
            {
              _.isEmpty(this.state.trainSts)
                ? <Empty />
                : <ul>
                  <li>{nearestTrainSt.addr}</li>
                  <li>Walking distance: {nearestTrainSt.dist} {nearestTrainSt.dur}</li>
                </ul>
            }
          </Card>
          <Card title={`Route to Flinders`} style={{ width: '100%' }} headStyle={cartStyles}>
            {
              _.isEmpty(this.state.toCity)
                ? <Empty />
                : _.map(this.state.toCity, r => <ul>
                  {
                    _.map(r, leg => <li>
                      {leg.duration.text}, {leg.distance.text}
                    </li>)
                  }
                </ul>)
            }
          </Card>
          <Card title={`Supermarkets withi(${DIST}m): ${this.state.superMarkets.length}`} style={{ width: '100%' }} headStyle={cartStyles}>
            {
              _.isEmpty(this.state.superMarkets)
                ? <Empty />
                : <ul>
                  {_.map(this.state.superMarkets, d => <li>{d.name}</li>)}
                </ul>
            }
          </Card>
        </Col>
      </Row>
    </div>
  }
}
