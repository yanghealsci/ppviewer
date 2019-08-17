import { Popover, Icon } from 'antd'

const suburbs = {
  'Glen Waverley, Vic 3150': 'GlenW',
  'Kew, Vic 3101': 'Kew',
  'Armadale, Vic 3143': 'Arm',
  'Box Hill, Vic 3128': 'BxH',
  'Box Hill South, Vic 3128': 'BxHS',
  'Mitcham, Vic 3132': 'MitC',
  'Mount Waverley, Vic 3149': 'MontW',
  'Hawthorn, Vic 3122': 'HawT',
  'Camberwell, Vic 3124': 'CamW',
  'Hawthorn East, Vic 3123': 'HawTE',
  'Malvern, Vic 3144': 'MalV',
  'Box Hill North, Vic 3129': 'BxHN',
  'Kew East, Vic 3102': 'KewE',
  'Doncaster, Vic 3108': 'DonC',
  'Blackburn North, Vic 3130': 'BbN',
  'Burwood, Vic 3125': 'BurW',
  'Malvern East, Vic 3145': 'MalE',
  'Surrey Hills, Vic 3127': 'SH',
  'Chadstone, Vic 3148': 'Chad',
  'Mont Albert, Vic 3127': 'MontA',
  'Glen Iris, Vic 3146': 'GlenI',
  'Ashburton, Vic 3147': 'Ashb'
}
const columns = [{
  title: 'Thumbnail',
  key: 'thumbnail',
  dataIndex: 'thumbnail',
  render (text, record) {
    const src = _.replace(record.thumbnail, '{size}', '100x100')
    return <Popover
      trigger='click'
      placement='right'
      content={
        <div style={{ height: 550, width: 550, overflow: 'scroll', padding: 25 }}>
          {
            _.map(record.image_info, ii => <div style={{ heigth: 500, width: 500, marginBottom: 10 }}>
              <img
                src={_.replace(ii.templatedUrl, '{size}', '500x500')}
                style={{ width: 500, height: 500 }} />
            </div>)
          }
        </div>
      }
    // content={<img src={_.replace(record.thumbnail, '{size}', '500x500')} style={{width: 500, height: 500}} />}
    >
      <img src={src} />
    </Popover>
  }
},
{
  title: 'Floorplan',
  key: 'floorplans_info',
  dataIndex: 'floorplans_info',
  render (text, record) {
    const src = _.replace(_.result(record, 'floorplans_info[0].templatedUrl') || '', '{size}', '100x100')
    return <Popover
      trigger='click'
      placement='right'
      content={<div>
        {
          _.map(record.floorplans_info, fp => <img
            src={_.replace(fp.templatedUrl, '{size}', '500x500')}
            style={{ width: 500, height: 500, marginRight: 20 }} />)
        }
      </div>}>
      <img src={src} />
    </Popover>
  }
},
{
  title: 'Property',
  children: [{
    title: 'Address',
    key: 'addr',
    dataIndex: 'addr',
    render (text, record) {
      return <a href={record.link} target='_blank' >{text && text.split(',')[0]}<Icon type='rocket' /></a>
    }
  }, {
    title: 'History',
    key: 'hist',
    align: 'center',
    width: 50,
    render (text, record) {
      // https://www.realestate.com.au/property/2-shirley-ave-glen-waverley-vic-3150
      let {street: addr, suburb} = record
      addr = _.chain(addr)
              .lowerCase()
              .replace('road', 'rd')
              .replace('street', 'st')
              .replace('avenue', 'ave')
              .replace('/', '-')
              .split(' ')
              .join('-')
              .replace(' ', '')
              .value()
      suburb = _.chain(suburb)
                .lowerCase()
                .replace(',', '')
                .split(' ')
                .join('-')
                .replace(' ', '')
                .value()
      return <a href={`https://www.realestate.com.au/property/${_.lowerCase(record.type)}-${addr}-${suburb}`} target='_blank'><Icon type='clock-circle' /></a>
    }
  }, {
    title: 'PDF',
    key: 'pdf_link',
    dataIndex: 'pdf_link',
    align: 'center',
    width: 50,
    render (text, record) {
      return <a href={record.pdf_link} target='_blank'><Icon type='file-pdf' /></a>
    }
  }, {
    title: 'Type',
    key: 'ptype',
    dataIndex: 'ptype',
    filters: _.map(['House', 'Townhouse', 'Unit', 'Apartment'], d => ({
      text: d,
      value: d
    })),
    align: 'center',
    width: 50,
    render (text) {
      return text && text[0]
    },
    onFilter (value, record) {
      return _.camelCase(value) === _.camelCase(record.ptype)
    }
  },
  // {
  //   title: 'Price',
  //   key: 'price',
  //   dataIndex: 'price'
  // }
  {
    title: <Icon type='home' />,
    key: 'beds',
    dataIndex: 'beds',
    align: 'center',
    width: 70,
    sorter: (a, b) => a.beds - b.beds,
    onFilter: (value, record) => `${record.beds}` === `${value}`,
    filters: _.map([1, 2, 3, 4, 5, 6], i => ({
      text: i,
      value: i
    }))
  }, {
    title: <span><Icon type='man' /><Icon type='woman' /></span>,
    key: 'baths',
    dataIndex: 'baths',
    align: 'center',
    width: 70,
    sorter: (a, b) => a.baths - b.baths,
    onFilter: (value, record) => `${record.baths}` === `${value}`,
    filters: _.map([1, 2, 3], i => ({
      text: i,
      value: i
    }))
  }, {
    title: <Icon type='car' />,
    key: 'cars',
    dataIndex: 'cars',
    align: 'center',
    width: 70,
    sorter: (a, b) => a.cars - b.cars,
    onFilter: (value, record) => `${record.cars}` === `${value}`,
    filters: _.map([1, 2, 3, 4, 5, 6], i => ({
      text: i,
      value: i
    }))
  }
    // {
    //   title: 'Year Built',
    //   key: 'yearBuilt',
    //   dataIndex: 'yearBuilt'
    // }
  ]
}, {
  title: 'Suburb',
  key: 'suburb',
  dataIndex: 'suburb',
  align: 'center',
  width: 120,
  render (text) {
    return suburbs[text] || (text && text.split(',')[0])
  },
  sorter: (a, b) => a.suburb > b.suburb,
  onFilter: (value, record) => record.suburb === value,
  filters: _.map(suburbs, (sub, key) => ({
    text: sub,
    value: key
  }))
}, {
  title: 'PS',
  key: 'primaryName',
  dataIndex: 'primrayName',
  align: 'center',
  width: 70,
  render (text, record) {
    return <Popover trigger='click' content={record.primaryName}><div>{record.primaryScore || 'Nan'}</div></Popover>
  },
  sorter: (a, b) => a.primaryScore - b.primaryScore
}, {
  title: 'SS',
  key: 'secondName',
  dataIndex: 'secondName',
  align: 'center',
  width: 70,
  render (text, record) {
    return <Popover trigger='click' content={record.secondName}><div>{record.secondScore || 'Nan'}</div></Popover>
  },
  sorter: (a, b) => a.secondScore - b.secondScore
}, {
  title: 'Train',
  dataIndex: 'train_names',
  key: 'train_names',
  render: (text, record) => {
    return <ul style={{ padding: `0 0 0 15px` }}>
      {
        _.map(record.train_names, n => {
          return <li>{n.split(' ')[0]}</li>
        })
      }
    </ul>
  },
  sorter: (a, b) => a.train_names.length - b.train_names.length
}, {
  title: 'Shop',
  dataIndex: 'shop_names',
  key: 'shop_names',
  render: (text, record) => {
    return <ul style={{ padding: `0 0 0 15px` }}>
      {
        _.map(record.shop_names, n => {
          const temp = (_.lowerCase(n) || '').split(' ')
          if (_.indexOf(temp, 'woolworths') !== -1) {
            return <li>WW</li>
          } else if (_.indexOf(temp, 'coles') !== -1) {
            return <li>Coles</li>
          } else if (_.indexOf(temp, 'aldi') !== -1) {
            return <li>Aldi</li>
          } else if (_.indexOf(temp, 'asian') !== -1) {
            return <li>Asian</li>
          }
          return <li>{temp.slice(0, 2).join(' ')}</li>
        })
      }
    </ul>
  },
  sorter: (a, b) => a.shop_names.length - b.shop_names.length
}, {
  title: 'Tran2Flinders',
  key: 'transit_time',
  dataIndex: 'transit_time',
  render (text, record) {
    return <div>
      <p>{record.transit_time}, {record.transit_dist}</p>
      <p>{_.join(record.route_detail, '->')}</p>
    </div>
  },
  filters: [{
    text: 'No Bus',
    value: 'nb'
  }, {
    text: 'Train',
    value: 'train'
  }, {
    text: 'Tram',
    value: 'tram'
  }],
  onFilter (value, record) {
    if (value === 'nb') {
      return !_.includes(record.route_detail, 'Bus')
    } else if (value === 'train') {
      return _.includes(record.route_detail, 'Train')
    } else if (value === 'tram') {
      return _.includes(record.route_detail, 'Tram')
    }
  },
  sorter: (a, b) => parseFloat(a.transit_time) - parseFloat(b.transit_time)
}, {
  title: 'Drive2Boxhill',
  children: [{
    title: 'Time',
    key: 'drive_time_to_boxh',
    dataIndex: 'drive_time_to_boxh'
  }, {
    title: 'Dist',
    key: 'drive_dist_to_boxh',
    dataIndex: 'drive_dist_to_boxh',
    sorter: (a, b) => parseFloat(a.drive_dist_to_boxh) - parseFloat(b.drive_dist_to_boxh)
  }]
}]

export default columns
