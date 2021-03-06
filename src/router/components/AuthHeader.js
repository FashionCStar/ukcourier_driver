import React, { Component } from "react";
import { Body, Button, Header, Icon, Left, Right, Text } from "native-base";
import { Material } from "../../styles";

class AuthHeader extends Component {
  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onLogout = () => { }

  render() {
    const { navigation } = this.props;
    if (navigation.isFirstRouteInParent())
      return (
        <Header transparent iosBarStyle={Material.iosStatusbar}>
        </Header>
      );

    return (
      <Header transparent iosBarStyle={Material.iosStatusbar}>
        <Left>
          <Button transparent onPress={this.onBack}>
            <Icon name='chevron-back' style={{ color: Material.brandPrimary }} />
          </Button>
        </Left>
        <Body />
      </Header>
    );
  }
}

export default AuthHeader;