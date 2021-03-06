import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { validateEmail } from '../../utils';
import { signInWithEmail } from '../../actions/auth';
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

  onSignIn = () => {
    const { email, password } = this.state;
    const isValidEmail = validateEmail(email);
    const isValidPwd = password.length >= MIN_PASSWORD_LEN;
    this.setState({ isValidEmail, isValidPwd });

    if (!isValidEmail || !isValidPwd) return;

    this.props.signInWithEmail({ email, password });
  }

  onTerms = () => { }

  render() {
    const { isValidEmail, isValidPwd } = this.state;

    return (
      <Container>
        <Content padder>
          <Center style={{ marginTop: screenSize.height * 0.1, marginBottom: 20 }}>
            <Text style={styles.pageTitle}>Sign In</Text>
          </Center>
          <Center>
            <Item rounded error={!isValidEmail}>
              <Input placeholder='Email' onChangeText={this.onChangeEmail} />
            </Item>
            <Item rounded error={!isValidPwd}>
              <Input placeholder='Password' onChangeText={this.onChangePwd} secureTextEntry />
            </Item>
          </Center>
        </Content>
        <Footer>
          <Col>
            <Button rounded block style={{ marginHorizontal: 10 }} onPress={this.onSignIn}>
              <Text>Sign In</Text>
            </Button>
          </Col>
        </Footer>
      </Container>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    auth,
  };
}

const bindActions = {
  signInWithEmail,
};

export default connect(mapStateToProps, bindActions)(SignUp);
