import React, { Component } from "react";
import { Body, Button, Header, Icon, Left, Right, Text, Drawer, View } from "native-base";
import { StatusBar } from "react-native";

import { Material } from "../../styles";
class AuthHeader extends Component {
  constructor(props) {
    super(props);
  }

  openDrawer = () => {
    this.props.navigation.openDrawer(); 
  }

  onLogout = () => { }

  render() {
    const { navigation } = this.props;
    const routeIndex = navigation.state.index;

    return (
      <View transparent style={{flexDirection: 'row', backgroundColor: '#333'}}>
        <Button transparent onPress={this.openDrawer}>
          <Icon name='menu' fontSize={30} style={{ color: Material.whiteColor, fontSize: 30 }} />
        </Button>
        <Body style={{alignItems: 'center'}}>
          <Text style={{color: Material.whiteColor}}>{navigation.state.routes[routeIndex].routeName}</Text>
        </Body>
        <Button transparent>
          <Icon name='menu' style={{ color: 'transparent', fontSize: 30 }} />
        </Button>
      </View>
    );
  }
}

export default AuthHeader;