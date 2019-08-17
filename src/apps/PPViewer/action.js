import 'whatwg-fetch'
import * as api from 'api'
import { createAction } from 'redux-actions'

export const updateBBoxes = createAction('UPDATE_BBOXES', bboxes => bboxes)


// async funtion 

export const getNearByStations = ({lat, lng}) => {
  return {
    types: [
      'GET_NEARBY_STATIONS_REQUEST',
      'GET_NEARBY_STATIONS_SUCCESS',
      'GET_NEARBY_STATIONS_ERROR'
    ],
    callAPI: async store => {
      const resp = await api.getPos(imgFile, param)
      const jsonObj = await JSON.parse(resp)

      return jsonObj && jsonObj.bboxes
    }
  }
}

export const pushImgRequest = ({ file, bbox = [], fileName, param, bzId }) => {
  return {
    types: [
      'PUSH_IMG_REQUEST',
      'PUSH_IMG_SUCCESS',
      'PUSH_IMG_ERROR'
    ],
    callAPI: async store => {
      const resp = await api.pushImg({ file, bbox, fileName, param, bzId })
      const jsonObj = await JSON.parse(resp)

      return jsonObj && jsonObj.bboxes
    }
  }
}
