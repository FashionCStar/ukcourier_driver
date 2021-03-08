import React, { Component } from 'react';
import { Body, Button, Container, Content, Footer, Header, Left, Right, Root, Text, Title, Toast, Icon, H1, Subtitle, H3, Row, Input, Item } from 'native-base';
import { Dimensions, StyleSheet, View, TouchableOpacity, Platform, PermissionsAndroid, Image } from 'react-native';
// import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE, UrlTile, Region } from 'react-native-maps';
import haversine from "haversine";
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import MapboxGL, { Logger } from "@react-native-mapbox-gl/maps";
import geoViewport from '@mapbox/geo-viewport';

MapboxGL.setAccessToken("pk.eyJ1IjoiZmFzaGlvbmRldjEiLCJhIjoiY2tscjlmM3diMTNkaTJvbnc1OXBpbzVwNiJ9.yJIaRGA7FoRXjQCSPj3WEA");


import styles, { Material, screenSize } from '../../styles';
import { showProgress, hideProgress } from '../../actions/loading';
import { connect } from 'react-redux';

// const { width, height } = Dimensions.get("window")

// const LATITUDE_DELTA = 0.009;
// const LONGITUDE_DELTA = 0.009;
// const LATITUDE = 37.78825;
// const LONGITUDE = -122.4324;
const MAP_TYPE = Platform.OS == 'android' ? 'none' : 'standard'
const MAPBOX_VECTOR_TILE_SIZE = 512;

Logger.setLogCallback(log => {
  const { message } = log;

  // expected warnings - see https://github.com/mapbox/mapbox-gl-native/issues/15341#issuecomment-522889062
  if (
    message.match('Request failed due to a permanent error: Canceled') ||
    message.match('Request failed due to a permanent error: Socket Closed')
  ) {
    return true;
  }
  return false;
});

class Locator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offLinePackName: `ukcourier-${Date.now()}`,
      offlineRegion: null,
      offlineRegionStatus: null,
      searchKey: '',
      centerCoords: [0, 0],
      userCurPos: [0, 0],
      mapType: MapboxGL.StyleURL.Street,
      isGetLocation: false,
      zoomLevel: 15
    };
  }

  componentDidMount = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
        'title': 'Location Access Required',
        'message': 'This App needs to Access your location'
      }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('permission granted', granted)
        await this.goToMyLocation();
        // console.log('current user position', this.state.userCurPos)
        // this.setState({
        //   centerCoords: [this.state.userCurPos[0], this.state.userCurPos[1]]
        // })
        //To Check, If Permission is granted
        // this.watchPosition();
      } else {
        alert("Permission Denied");
      }
    } catch (err) {
      alert("err", err);
    }
  }

  goToMyLocation = () => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        // console.log('current coordinates', coords.longitude)
        this.setState({
          isGetLocation: true,
          userCurPos: [coords.longitude, coords.latitude],
          centerCoords: [coords.longitude, coords.latitude]
        });
      },
      (error) => alert('Error: Are location services on?'),
      { enableHighAccuracy: true }
    )
  }

  watchPosition = () => {
    this.watchID = Geolocation.watchPosition(
      position => {
        const { coordinate, routeCoordinates } = this.state;
        const { latitude, longitude } = position.coords;
        // console.log({ latitude, longitude });

        const newCoordinate = {
          latitude,
          longitude
        };
        if (Platform.OS === "android") {
          if (this.marker) {
            this.coordinate = newCoordinate;
          }
        } else {
          // coordinate.timing(newCoordinate).start();
        }
        this.setState({
          latitude,
          longitude,
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 500, distanceFilter: 1 }
    );
  }

  componentWillUnmount() {
    // avoid setState warnings if we back out before we finishing downloading
    // Geolocation.clearWatch(this.watchID);
    MapboxGL.offlineManager.deletePack(this.state.offLinePackName);
    MapboxGL.offlineManager.unsubscribe(this.state.offLinePackName);
  }

  onChangeSearch = (searchKey) => {
    this.setState({ searchKey });
  }

  onCheck = () => {
    console.log('ddddddddddddddddddd', this.state.searchKey);
  }

  onCancelSearch = () => { }

  changeMapType = () => {
    console.log('map type', this.state.mapType)
    this.setState({
      mapType: this.state.mapType == MapboxGL.StyleURL.Street ? MapboxGL.StyleURL.Satellite : MapboxGL.StyleURL.Street
    })
  }

  downloadMapRegion = async () => {
    const { width, height } = Dimensions.get('window');
    const bounds = geoViewport.bounds(
      this.state.centerCoords,
      4,
      [width * 6, height * 6],
      MAPBOX_VECTOR_TILE_SIZE,
    );

    const options = {
      name: `ukcourier-${Date.now()}`,
      styleURL: this.state.mapType,
      bounds: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      minZoom: 5,
      maxZoom: this.state.zoomLevel,
    };
    this.props.showProgress();
    MapboxGL.offlineManager.createPack(options, this.onDownloadProgress);
  }
  onDownloadProgress = (offlineRegion, offlineRegionStatus) => {
    if (offlineRegionStatus.state == 2) {
      this.props.hideProgress();
      // console.log('offline progress', offlineRegionStatus);
    }
    this.setState({
      offLinePackName: offlineRegion.name,
      offlineRegion,
      offlineRegionStatus,
    });
  }

  render() {
    const { searchKey, isGetLocation, zoomLevel, centerCoords, userCurPos, mapType } = this.state;

    // console.log('center coordinates', centerCoords);
    return (
      <>
        <Container>
          <View style={{zIndex: 999, backgroundColor: Material.whiteColor, margin: 5, borderRadius: 50, flexDirection: 'row', shadowColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
            <Button transparent rounded>
              <Icon name="location" style={{ color: '#fa0' }}/>
            </Button>
            <Input placeholder="Search post code or address" onChangeText={this.onChangeSearch} value={searchKey} style={{ height: 40 }}/>
            <Button transparent onPress={this.onCancelSearch} rounded>
              <Icon name="search" style={{ color: '#333' }}/>
            </Button>
          </View>
          {isGetLocation ? <MapboxGL.MapView
            ref={map => { this.map = map; }}
            style={mapStyles.map}
            styleURL={mapType}
          >
            <MapboxGL.Camera
              zoomLevel={zoomLevel}
              centerCoordinate={centerCoords}
              animationMode={'moveTo'}
              // followUserLocation={true}
              // followUserMode={"normal"}
            />
            <MapboxGL.UserLocation
              showsUserHeadingIndicator={true}
              renderMode={'normal'}
            />
          </MapboxGL.MapView> : null}

          <TouchableOpacity onPress={this.changeMapType} rounded style={[mapStyles.mapTypeBtnContainerPosition, mapStyles.myLocationBtnContainer]}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require('../../../assets/images/icons/maplayers.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.goToMyLocation} rounded style={[mapStyles.myLocationBtnContainerPosition, mapStyles.myLocationBtnContainer]}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require('../../../assets/images/icons/mylocation1.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.downloadMapRegion} rounded style={[mapStyles.mapDownloadBtnContainerPosition, mapStyles.myLocationBtnContainer]}>
            {/* <Image
              style={{ width: 30, height: 30 }}
              source={require('../../../assets/images/icons/maplayers.png')}
            /> */}
            <Icon name='cloud-download' />
          </TouchableOpacity>
        </Container>
      </>
    );
  }
}

const mapStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 15,
    paddingTop: 100,
    zIndex: 999,
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 100,
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  },
  mapTypeBtnContainerPosition: {
    right: 10,
    top: 70,
  },
  myLocationBtnContainerPosition: {
    right: 10,
    top: 130,
  },
  mapDownloadBtnContainerPosition: {
    right: 10,
    top: 190,
  },
  myLocationBtnContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center'
  }
});

function mapStateToProps({ }) {
  return {};
}

const bindActions = {
  showProgress,
  hideProgress
};

export default connect(mapStateToProps, bindActions)(Locator);
