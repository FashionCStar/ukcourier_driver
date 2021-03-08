import React from 'react';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Home, Profile, Locator, Setting } from '../screens/main';
import { Welcome } from '../screens/auth';
import MainHeader from './components/MainHeader';
import { Material } from '../styles';
import TabBar from './components/TabBar';

const tabBarConfig = {
  tabBarPosition: 'bottom',
  lazy: true,
  swipeEnabled: true,
  tabBarComponent: props => <TabBar {...props} />,
  initialRouteName: 'Notification',
  style: {
  }
};

const MainDrawerNavigator = createDrawerNavigator({
  Locator: Locator,
  Notification: Home,
  Setting: Setting,
}, {
  initialRouteName: 'Notification',
  contentOptions: {
    activeTintColor: '#e91e63',
  },
});

const RootNavigator = createStackNavigator({
  Welcome: {
    screen: Welcome,
    navigationBarStyle: { navBarHidden: true },
    navigationOptions: {
      headerShown: false,
    }
  },
  Home: {
    screen: MainDrawerNavigator,
    navigationBarStyle: { navBarHidden: true },
    navigationOptions: {
      headerShown: true,
    }
  },
},
  {
    defaultNavigationOptions: {
      header: (props) => (<MainHeader {...props} />)
    }
  });
export default createAppContainer(RootNavigator);
// const Main = createStackNavigator({
//   Home: createMaterialTopTabNavigator(
//     {
//       Locator: {
//         screen: Locator,
//       },
//       Notification: {
//         screen: Home,
//       },
//       Profile: {
//         screen: Profile
//       },
//       Setting: {
//         screen: Setting
//       },
//     },
//     tabBarConfig,
//   ),
//   Welcome: {
//     screen: Welcome
//   },
// }, {
//   initialRouteName: 'Welcome',
//   defaultNavigationOptions: {
//     header: (props) => (<MainHeader {...props} />),
//     cardStyle: { backgroundColor: Material.containerBgColor }
//   }
// });

// export default createAppContainer(Main);
