import React, { Component } from "react";
import { Body, Button, Header, Icon, Left, Right, Text, Drawer } from "native-base";
import { StatusBar } from "react-native";

import { Material } from "../../styles";
class AuthHeader extends Component {
  constructor(props) {
    super(props);
  }

  openDrawer = () => {
    this.props.navigation.navigate("DrawerOpen");
  }

  onLogout = () => { }

  render() {
    const { navigation } = this.props;
    if (navigation.isFirstRouteInParent()) return null;

    const routeIndex = navigation.state.index;
    if (routeIndex == 3 || routeIndex == 4) {
      return (<StatusBar translucent={false}/>)
    }

    // return (
    //   <Header transparent iosBarStyle={Material.iosStatusbar}>
    //   </Header>
    // );

    return (
      <Header transparent iosBarStyle={Material.iosStatusbar}>
        <Left>
          <Button transparent onPress={this.openDrawer}>
            <Icon name='menu-outline' style={{ color: Material.brandPrimary }} />
          </Button>
        </Left>
        <Body />
      </Header>
    );
  }
}

export default AuthHeader;