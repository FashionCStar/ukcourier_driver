import RNFS from 'react-native-fs';

export const APP_NAME = 'UKDriverDEPOT';

// export const SERVER_URL = "http://192.168.48.1:5001/just-checking-in-bitrupt/us-central1";
// export const SERVER_URL = "http://192.168.108.165:8000/api";
export const SERVER_URL = "https://ukcourier.a2hosted.com/api";
export const MIN_PASSWORD_LEN = 6;
export const PHONE_CODE_COUNT = 6;


export const TileConstants = {
  TILE_FOLDER: `${RNFS.DocumentDirectoryPath}/tiles`,
  MAP_URL: 'http://a.tile.openstreetmap.org',
}
