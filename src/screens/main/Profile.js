import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { Button, Container, Content, Text, Icon, Header, Right } from 'native-base';

import { Center } from '../../components';
import { signOut } from '../../actions/auth';
import { APP_NAME } from '../../config';
import styles, { Material, screenSize } from '../../styles';

class Profile extends Component {
  onLogout = () => {
    Alert.alert(
      APP_NAME,
      'Do you wanna sign out?',
      [
        {
          text: 'Yes',
          onPress: () => this.props.signOut()
        },
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel'
        },
      ],
      { cancelable: true }
    );
  }

  render() {
    return (
      <>
      <Header transparent iosBarStyle={Material.iosStatusbar}>
        <Right>
          <Button transparent onPress={this.onLogout} hasText>
            <Text style={{ color: Material.brandPrimary }} uppercase={false}>Logout</Text>
          </Button>
        </Right>
      </Header>
        <Container>
          <Content padder>
            <Center style={{ marginVertical: screenSize.height * 0.3 }}>
              <Text style={styles.logoTitle}>Profile</Text>
            </Center>
          </Content>
        </Container>
      </>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    auth
  };
}

const bindActions = {
  signOut
};

export default connect(mapStateToProps, bindActions)(Profile);
