import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { validateEmail } from '../../utils';
import { signUp } from '../../actions/auth';
import { MIN_PASSWORD_LEN } from '../../config';

class SignUp extends Component {
  state = {
    email: '',
    isValidEmail: true,
    password: '',
    isValidPwd: true
  };

  onChangeEmail = (email) => {
    this.setState({
      email,
      isValidEmail: true
    });
  }

  onChangePwd = (password) => {
    this.setState({
      password,
      isValidPwd: true
    });
  }

  onSignUp = () => {
    const { email, password } = this.state;
    const isValidEmail = validateEmail(email);
    const isValidPwd = password.length >= MIN_PASSWORD_LEN;
    this.setState({ isValidEmail, isValidPwd });

    if (!isValidEmail || !isValidPwd) return;

    this.props.signUp({ email, password });
  }

  onTerms = () => { }

  render() {
    const { isValidEmail, isValidPwd } = this.state;

    return (
      <Container>
        <Content padder>
          <Center style={{ marginTop: screenSize.height * 0.1, marginBottom: 20 }}>
            <Text style={styles.pageTitle}>Sign Up</Text>
          </Center>
          <Center>
            <Item rounded error={!isValidEmail}>
              <Input placeholder='Email' onChangeText={this.onChangeEmail} />
            </Item>
            <Item rounded error={!isValidPwd}>
              <Input placeholder='Password' onChangeText={this.onChangePwd} secureTextEntry />
            </Item>
            <Center>
              <Row>
                <Text style={{ paddingVertical: 10, color: Material.blackColor }}>By signing up you agree with the </Text>
                <Button transparent onPress={this.onTerms} style={{ padding: 0 }}>
                  <Text uppercase={false}>Terms and Policy</Text>
                </Button>
              </Row>
            </Center>
          </Center>
        </Content>
        <Footer>
          <Col>
            <Button rounded block style={{ marginHorizontal: 10 }} onPress={this.onSignUp}>
              <Text>Create Account</Text>
            </Button>
          </Col>
        </Footer>
      </Container>
    );
  }
}

function mapStateToProps({ auth, state }) {
  return {
    auth,
    state
  };
}

const bindActions = {
  signUp,
};

export default connect(mapStateToProps, bindActions)(SignUp);
