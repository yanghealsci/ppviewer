import { Table, Icon, Input, Modal, Row, Col, message, Checkbox, Popover } from 'antd'
import data from './pp.json'
import scZone from './school_zone.json'
import fetch from 'utils/myfetch'
import * as styles from './style.scss'
import columns from './columns'

const { TextArea } = Input

const schools = _.keyBy(scZone, 'id')

// console.log(data)
// console.log(scZone)

async function getList () {
  const resp = await fetch({
    url: '/dr/data?offset=0&limit=1000',
    method: 'GET'
  })

  if (resp.status === 'succeeded') {
    return _.result(resp, 'data.properties') || []
  } else {
    message.error('Failed to load the list')
    throw Error()
  }
}

async function updateItem (data) {
  const resp = await fetch({
    url: '/dr/review',
    method: 'PUT',
    data,
    dataType: 'json'
  })

  if (resp.status === 'succeeded') {
    return true
  } else {
    message.error('Failed to update review')
    throw Error()
  }
}

export default class PPViewer extends React.Component {
  constructor (props) {
    super(props)
    this.columns = [...columns.slice(0, 2), {
      title: 'Review',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center',
      width: 50,
      sorter: (a, b) => parseInt(a.rating) - parseInt(b.rating),
      filters: [{
        text: 'Reviewed',
        value: 'done'
      }, {
        text: 'Non-reviewed',
        value: 'none'
      }],
      onFilter (value, record) {
        return value === 'done' ? record.rating !== -1 : record.rating === -1
      },
      render: (text, record) => {
        return <span>
          <Popover trigger='click' content={record.comment}>{text}</Popover>
          <a style={{ marginLeft: 5 }} onClick={this.handleItemEdit.bind(this, record)}>
            <Icon type='edit' />
          </a>
          <a style={{ marginLeft: 5 }} onClick={this.handleItemIgnore.bind(this, record)}>
            <Icon type='delete' />
          </a>
          <br />
          {record.price && record.price !== -1 ? record.price : `${record.ask_price_low}-${record.ask_price_high}`}
        </span>
      }
    }, ...columns.slice(2)]
    console.log(this.columns)
    this.state = {
      data: [],
      keyword: '',
      currItem: {},
      showPopup: false,
      showIgnoreItems: false
    }
  }
  handleItemEdit (record) {
    this.setState({
      currItem: record,
      showPopup: true
    })
  }
  async handleItemEditConfirm () {
    const {
      currItem: {
        RS_INDEX,
        rating,
        ask_price_low,
        ask_price_high,
        final_price,
        bid_price,
        comment
      }
    } = this.state

    const res = await updateItem({
      RS_INDEX,
      rating,
      ask_price_low,
      ask_price_high,
      final_price,
      bid_price,
      comment
    })

    if (res) {
      const index = _.findIndex(this.state.data, d => d.RS_INDEX === this.state.currItem.RS_INDEX)
      this.setState({
        data: [
          ...this.state.data.slice(0, index),
          this.state.currItem,
          ...this.state.data.slice(index + 1)
        ]
      })
      message.success('update succeeded')
    }

    this.setState({
      showPopup: false
    })
  }

  async handleItemIgnore (record) {
    const res = await updateItem({
      rating: 0,
      RS_INDEX: record.RS_INDEX,
      ask_price_low: record.ask_price_low,
      ask_price_high: record.ask_price_high,
      final_price: record.final_price,
      bid_price: record.bid_price,
      comment: record.comment
    })

    if (res) {
      const index = _.findIndex(this.state.data, d => d.RS_INDEX === record.RS_INDEX)
      this.setState({
        data: [
          ...this.state.data.slice(0, index),
          {
            ...record,
            rating: 0
          },
          ...this.state.data.slice(index + 1)
        ]
      })
      message.success('ignored')
    }
  }

  procData (source) {
    console.log(source)
    const addres = []
    const data = []
    for (const d of source) {
      if (!_.includes(addres, d.addr) || !d.addr) {
        data.push(d)
        addres.push(d.addr)
      }
    }

    for (const d of data) {
      // add schools
      const ss = _.chain(d.school_ids)
        .map(id => schools[parseInt(id)])
        .sortBy('score')
        .value()
      d.otherSchool = []

      for (const s of ss) {
        if (!s) {
          continue
        }
        if (s.type === 'Primary') {
          if (d.primaryName) {
            d.otherSchool.push(s.name + '(' + s.score + ')')
          } else {
            d.primaryName = s.name
            d.primaryScore = s.score
          }
        } else {
          if (d.secondName) {
            d.otherSchool.push(s.name + '(' + s.score + ')')
          } else {
            d.secondName = s.name
            d.secondScore = s.score
          }
        }
      }
    }

    return data
  }
  async componentDidMount () {
    const resp = await getList()
    this.setState({
      data: this.procData(resp)
    })
  }
  render () {
    const { keyword, showPopup, currItem, showIgnoreItems } = this.state
    // let list = this.procData(data)
    let list = this.state.data

    console.log(list)

    keyword && (list = _.filter(list, l => _.startsWith(l.addr, keyword)) || [])
    !showIgnoreItems && (list = _.filter(list, l => l.rating !== 0) || [])

    const formFileds = [{
      label: 'Ask Price Low',
      key: 'ask_price_low',
      type: 'number'
    }, {
      label: 'Ask Price High',
      key: 'ask_price_high',
      type: 'number'
    }, {
      label: 'Price',
      key: 'final_price',
      type: 'number'
    }, {
      label: 'Bid Price',
      key: 'bid_price',
      type: 'number'
    }, {
      label: 'Rating',
      key: 'rating',
      type: 'number'
    }, {
      label: 'Comment',
      key: 'comment',
      type: 'text'
    }]

    return <div style={{ overflow: 'scroll', padding: 20 }}>
      <div>
        <label style={{marginRight: 20}}>Address</label>
        <Input
          value={keyword} onChange={(e) => this.setState({ keyword: e.target.value })}
          style={{ width: 400, marginBottom: 20 }} />
        <Checkbox checked={showIgnoreItems} onChange={e => this.setState({showIgnoreItems: e.target.checked})}>Show Ignored Items</Checkbox>
      </div>
      <Table
        columns={this.columns}
        bordered
        // scroll={{ y: 240 }}
        dataSource={keyword ? _.filter(list, l => _.startsWith(l.addr, keyword)) || [] : list}
        style={{overflow: 'scroll'}}
        pagination={{pageSize: 30}} />
      <Modal
        onCancel={() => this.setState({showPopup: false, currItem: {}})}
        onOk={this.handleItemEditConfirm.bind(this)}
        visible={showPopup}
        title={currItem.addr}
        width={600}>
        {
          _.map(formFileds, ({label, key, type}) => {
            let inputCmp = null
            switch (type) {
              case 'number':
                inputCmp = <Input value={currItem[key]} type={type} onChange={e => this.setState({
                  currItem: {
                    ...currItem,
                    [key]: parseInt(e.target.value)
                  }
                })} />
                break
              default:
                inputCmp = <TextArea value={currItem[key]} onChange={e => this.setState({
                  currItem: {
                    ...currItem,
                    [key]: e.target.value
                  }
                })} />
            }
            return <Row gutter={20} style={{marginBottom: 10}}>
              <Col span={6}>
                <label>{label}</label>
              </Col>
              <Col span={18}>
                {inputCmp}
              </Col>
            </Row>
          })
        }
      </Modal>
    </div>
  }
}
