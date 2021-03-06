import React, { Component } from 'react';
import { connect, createDispatchHook } from 'react-redux';
import { Alert, ScrollView, View, StyleSheet, TouchableOpacity, InteractionManager } from 'react-native';
import { Button, Container, Content, Text, Icon, Header, Right, Item, Input } from 'native-base';

import SQLite from 'react-native-sqlite-storage';

import { Center } from '../../components';
import { signOut } from '../../actions/auth';
import { APP_NAME } from '../../config';
import styles, { Material, screenSize } from '../../styles';

import { runQuery, getPostcodes } from '../../actions/areacodes';

// import { Setting } from '.';

class Setting extends Component {
  constructor(props) {
    super(props);
    SQLite.DEBUG = true;
    this.state = {
      searchKey: '',
      areaList: [],
      filteredList: [],
      downloadCount: 0
    };
  }

  // areaList = [
  // ];
  // filteredList = this.areaList;

  /**
  * Execute sql queries
  * 
  * @param sql
  * @param params
  * 
  * @returns {resolve} results
  */

  // executeQuery = (sql, params = []) => new Promise((resolve, reject) => {
  //   db.transaction((trans) => {
  //     trans.executeSql(sql, params, (trans, results) => {
  //       resolve(results);
  //     },
  //       (error) => {
  //         reject(error);
  //       });
  //   });
  // });


  getAreas = async () => {
    let params = {
      query: "select * from tb_areacodes order by is_download desc",
      queryParams: []
    };
    this.props.runQuery(params, (data) => {
      let areaResults = data.rows;
      let areaCodes = [];
      let count = 0;
      for (let i = 0; i < areaResults.length; i++) {
        areaCodes.push(areaResults.item(i));
        if (areaResults.item(i).is_download == 1 || areaResults.item(i) == "1") {
          count ++;
        }
      }
      this.setState({
        areaList: areaCodes,
        filteredList: areaCodes,
        downloadCount: count
      });
    });
  }

  downloadAreacodes = async (item, index) => {
    if (this.state.downloadCount >= 5) {
      Alert.alert(
        'Download Limitation',
        'You have downloaded 5 Area Codes. Please remove useless Area Codes',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ],
        { cancelable: false }
      );
      return null;
    }
    let params = {
      prefix: item.prefix,
      code: item.area_code
    };
    let areaCodes = [];
    await this.props.getPostcodes(params, (data) => {
      areaCodes = data.postcodes;
    })

    let createParams = {
      query: "CREATE TABLE IF NOT EXISTS pc_" + item.prefix.toLowerCase() + " (id	INTEGER PRIMARY KEY NOT NULL, postcode	varchar(10), address	varchar(191), latitude	varchar(30), longitude	varchar(30));",
      queryParams: []
    }
    await this.props.runQuery(createParams, (data) => { });

    let insertParams = {
      query: "",
      queryParams: []
    }
    insertParams.query = 'INSERT INTO pc_' + item.prefix.toLowerCase() + ' (postcode, address, latitude, longitude) VALUES ';
    for (let i = 0; i < areaCodes.length; i++) {
      insertParams.query += '("' + areaCodes[i].postcode + '", "' + areaCodes[i].address + '", "' + areaCodes[i].latitude + '", "' + areaCodes[i].longitude + '")';
      if (i != areaCodes.length - 1) {
        insertParams.query += ",";
      }
    }
    insertParams.query += ";";
    await this.props.runQuery(insertParams, (data) => { });

    let updateParams = {
      query: "update tb_areacodes set is_download = ? where id = ?;",
      queryParams: [1, item.id]
    }
    await this.props.runQuery(updateParams, (data) => {
      let areaCodes = this.state.areaList;
      let downloadCount = this.state.downloadCount;
      downloadCount ++;
      areaCodes[index].is_download = 1;
      areaCodes.sort(function(a, b) {
        return b.is_download - a.is_download;
      });
      this.setState({
        areaList: areaCodes,
        downloadCount: downloadCount
      })
    })
  }

  removeAreaInfo = async (item, index) => {
    console.log('remove area info', item)
    let deleteParams = {
      query: "delete from pc_" + item.prefix.toLowerCase() + " where address like '%" + item.area_code + " %';",
      queryParams: []
    }
    await this.props.runQuery(deleteParams, (data) => {
      console.log('remove all');
    })
    let updateParams = {
      query: "update tb_areacodes set is_download = ? where id = ?;",
      queryParams: [0, item.id]
    }
    await this.props.runQuery(updateParams, (data) => {
      let areaCodes = this.state.areaList;
      let downloadCount = this.state.downloadCount;
      downloadCount --;
      areaCodes[index].is_download = 0;
      areaCodes.sort(function(a, b) {
        return b.is_download - a.is_download;
      });
      this.setState({
        areaList: areaCodes,
        downloadCount: downloadCount
      })
    })
  }

  // after = (x) => {
  //   return new Promise (function(resolve, reject) {
  //     reject();
  //   });
  // }

  async componentDidMount() {
    await this.getAreas();
  }

  onChangeSearch = (searchKey) => {
    this.setState({ searchKey });
    if (searchKey) {
      this.setState({
        filteredList: this.state.areaList.filter(item => {
          return item.area_code.toLowerCase().includes(searchKey.toLowerCase())
        })
      });
    } else {
      this.setState({ filteredList: this.state.areaList });
    }
  }

  onCancelSearch = () => {
    this.onChangeSearch('');
  }

  // downloadAreaInfo = (item) => {
  //   console.log('download area info', item)
  // }

  render() {
    const { searchKey } = this.state;
    return (
      <>
        <Header iosBarStyle={Material.iosStatusbar} searchBar rounded>
          <Item style={{ marginTop: 10 }}>
            <Input placeholder="Area Code Search" onChangeText={this.onChangeSearch} value={searchKey} />
            {searchKey ?
              <Button transparent rounded icon onPress={this.onCancelSearch}>
                <Icon name="close" />
              </Button> : null}
          </Item>
        </Header>
        <Container>
          <ScrollView style={{ marginTop: 5 }}>
            {this.state.filteredList.map((item, index) => {
              return (
                <View style={settingStyles.areaContainer} key={item.id}>
                  <Icon name='location' style={{ opacity: 0.5, marginRight: 30 }} />
                  {/* <Text>{index+1}</Text> */}
                  <Text>{item.area_code}</Text>
                  <TouchableOpacity style={[settingStyles.downloadContainer, item.is_download == '0' ? settingStyles.downloadEnable : settingStyles.downloadDisable]} onPress={() => { item.is_download == '0' ? this.downloadAreacodes(item, index) : this.removeAreaInfo(item, index) }}>
                    {
                      item.is_download == '0' ?
                        <>
                          <Icon name='cloud-download' style={{ opacity: 0.5, color: 'blue' }} />
                          <Text> &nbsp;Download</Text>
                        </> :
                        <>
                          <Icon name='trash' style={{ opacity: 0.5, color: 'black' }} />
                          <Text> &nbsp;Remove</Text>
                        </>
                    }
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
        </Container>
      </>
    );
  }
}

const settingStyles = StyleSheet.create({
  areaContainer: {
    marginVertical: 5,
    paddingHorizontal: 30,
    height: 50,
    // flexDirection: 'column',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'black',
    borderBottomWidth: 1
  },
  downloadContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 30
  },
  downloadEnable: {
    // backgroundColor: 'blue',
  },
  downloadDisable: {
    // backgroundColor: 'green',
  }
});

function mapStateToProps({ auth }) {
  return {
    auth
  };
}

const bindActions = {
  runQuery,
  getPostcodes
};


export default connect(mapStateToProps, bindActions)(Setting);
