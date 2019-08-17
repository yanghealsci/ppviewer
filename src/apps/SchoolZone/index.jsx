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

async function getNearbyX ({ lat, lng, type, map, dist = 1000, drawMarkers = true}) {
  return new Propmise(function (resolve, reject) {
    const coord = new google.maps.LatLng(lat, lng)

    const request = {
      location: coord,
      radius: `${dist}`,
      type: [type]
    }

    const service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (drawMarkers) {
          for (var i = 0; i < results.length; i++) {
            var place = results[i]
            const marker = new google.maps.Marker({
              position: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
              map: this.mapHandler,
              // icon: place.icon,
              icon: 'http://maps.google.com/mapfiles/kml/pal3/icon18.png',
              scale: 5
            })
            this.drawings.push(marker)
          }
        }
        resolve(results)
      } else {
        resolve([])
      }
    })
  })
}

async function getDist (origs, dests, tMode = 'WALKING') {
  return new Propmise(function (resolve, reject) {
    const service = new google.maps.DistanceMatrixService
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
  }
  componentDidMount () {
    this.initMap()
  }
  initMap () {
    this.mapHandler = new google.maps.Map(this.map, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 15
    })
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
    const {lat, lng} = _.result(loc, `[0].geometry.location`)
    this.mapHandler && this.mapHandler.setCenter({lat, lng})
    const propMarker = new google.maps.Marker({
      position: {lat, lng},
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

    this.setState({
      trainSts: results
    })
  }
  async getNearestStore (lat, lng, map) {
    var coord = new google.maps.LatLng(lat, lng)

    var request = {
      location: coord,
      radius: '1000',
      type: ['supermarket']
    }

    const service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, (results, status) => {
      console.log(status)
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i]
          const marker = new google.maps.Marker({
            position: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
            map: this.mapHandler,
            // icon: place.icon,
            icon: 'http://maps.google.com/mapfiles/kml/pal3/icon18.png',
            scale: 5
          })
          this.drawings.push(marker)
        }
        this.getTrainDist(
          [coord],
          _.map(results, place => new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()))
        )
        console.log(results)
        this.setState({
          superMarkets: results
        })
      } else {
        this.setState({
          superMarkets: []
        })
      }
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

      const pos = new google.maps.LatLng({lat, lng})

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
    return <div style={{padding: 50}}>
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
          <Card title='Nearest train station(1km)' style={{ width: '100%' }} headStyle={cartStyles}>
            {
              _.isEmpty(this.state.trainSts)
                ? <Empty />
                : <ul>
                  <li>{nearestTrainSt.addr}</li>
                  <li>Walking distance: {nearestTrainSt.dist} {nearestTrainSt.dur}</li>
                </ul>
            }
          </Card>
          <Card title={`Supermarkets withi(1km): ${this.state.superMarkets.length}`} style={{ width: '100%' }} headStyle={cartStyles}>
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
