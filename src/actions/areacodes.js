import { sendGetRequest, sendPostRequest, executeQuery } from "../utils/api";
import { HIDE_PROGRESS, SET_AREAS, SHOW_PROGRESS } from "./types";


export function getPostcodes(params, callback) {
    return async(dispatch, getState) => {
        const { prefix, code } = params;
        dispatch({ type: SHOW_PROGRESS });
        const data = await sendPostRequest('/getAreaData', params);
        dispatch({ type: HIDE_PROGRESS });
        callback(data);
    }
}

export function runQuery(params, callback) {
    return async(dispatch, getState) => {
        const { query, queryParams } = params;
        dispatch({ type: SHOW_PROGRESS });
        const data = await executeQuery(query, queryParams);
        dispatch({ type: HIDE_PROGRESS });
        callback(data);
    }
}

// export function putPostcodes(params, callback) {
//   return async (dispatch, getState) => {
//     const { query, queryParams } = params;
//     dispatch({ type: SHOW_PROGRESS });
//     const data = await executeQuery(query, queryParams);
//     dispatch({ type: HIDE_PROGRESS });
//     callback(data);
//   }
// }