// base layout
import { CardHeader, CardText, CardTitle } from 'material-ui/Card';
import {blue400, blue600} from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin  from 'react-mixin';
import React, { Component } from 'react';

import { Footer } from '/imports/ui/layouts/Footer';
import { GlassApp } from '/imports/ui/layouts/GlassApp';
import { GlassCard, VerticalCanvas, FullPageCanvas } from 'meteor/clinical:glass-ui';
import { Header } from '/imports/ui/layouts/Header';
import { DicomImage } from '/imports/ui/components/DicomImage';
import { SciFiOrbital } from '/imports/ui/components/SciFiOrbital';
import SidebarTray from '/imports/ui/layouts/SidebarTray';
import FlatButton from 'material-ui/FlatButton';

import { SecurityDialog } from './SecurityDialog';
import { Session } from 'meteor/session';

import { get, has } from 'lodash';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {Helmet} from "react-helmet";

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: blue400,
    primary2Color: blue600,
    pickerHeaderColor: blue600
  }
});



Session.setDefault('iFrameLocation', '');
Meteor.startup(function (){
  if(get(Meteor.user(), 'profile.consents.patientEducationReferences.status') === "active"){
    if (has(Meteor.settings, 'public.defaults.iFrameUrl')){
      Session.set('iFrameLocation', get(Meteor.settings, 'public.defaults.iFrameUrl'));
    }
    if (has(Meteor.settings, 'public.defaults.iFrameEnabled')){
      Session.set('secondPanelVisible', get(Meteor.settings, 'public.defaults.iFrameEnabled'));
    }  
  } else {
    // no consent to fetch patient materials
    // setting the iframe to nothing
    Session.set('iFrameLocation', '');
  }
});



export class App extends React.Component {
  constructor(props) {
    super(props);
  }
  getChildContext() {
    return {
      // muiTheme: getMuiTheme(baseTheme)
      muiTheme: muiTheme
    };
  }
  // componentWillMount() {
  //   injectTapEventPlugin();
  // }
  renderSecondaryPanel(){
    // RADIOLOGY
    if (Meteor.userId() && Session.equals('pathname', '/diagnostic-reports') && get(Meteor.settings, 'public.modules.fhir.DiagnosticReports')) {
      // the user is logged in as a normal user
      return (
        <GlassCard style={this.data.style.card} >
          <DicomImage />
        </GlassCard>
      );

      // Conditions (Zygote)
    } else if (Meteor.userId() && Session.equals('pathname', '/conditions') && get(Meteor, 'settings.public.apps.ZygoteAvatar')) {
      return (
        <GlassCard style={this.data.style.card} height='auto'>
          <CardText>
            <object id="iframe" type="text/html" data='https://www.zygotebody.com/' style={this.data.style.content}>
              <p>unable to load </p>
            </object>
          </CardText>
        </GlassCard>
      );

      // Website
    } else if (Meteor.userId() && Session.equals('pathname', '/videoconferencing')) {
      return (
        <GlassCard style={this.data.style.card} height='auto'>
          <CardText>
            Video!
          </CardText>
        </GlassCard>
      );

    // Website
    } else if (Meteor.userId() && get(Meteor.settings, 'public.defaults.iFrameEnabled') && get(Meteor.settings, 'public.defaults.iFrameUrl')) {
      return (
        <GlassCard style={this.data.style.card} height='auto'>
          <CardText>
            <object id="iframe" type="text/html" data={this.data.browserWindowLocation} style={this.data.style.content}>
              <p>unable to load </p>
            </object>
          </CardText>
        </GlassCard>
      );

    } else {
      // anything else
      return (
        <div></div>
      );

    }
  }
  getMeteorData() {
    let data = {
      style: {
        secondary: {
          position: 'absolute',
          top: ' 0px',
          width: '1024px',
          left: '0',
          transition: '1s'
        },
        card: {
          position: 'relative',
          //minHeight: '768px',
          width: '1024px'
          //height: Session.get('appHeight') - 240 + 'px'
        },
        content: {
          minHeight: '728px',
          width: '100%',
          height: Session.get('appHeight') - 280 + 'px'
        }
      },
      browserWindowLocation: 'https://www.ncbi.nlm.nih.gov',
      securityDialog: {
        open: Session.get('securityDialogOpen'),
        resourceType: Session.get('securityDialogResourceType'),
        resourceId: Session.get('securityDialogResourceId'),
        resourceJson: JSON.stringify(Session.get('securityDialogResourceJson'), null, 2)
      }
    };


    if (Session.get('iFrameLocation')) {
      data.browserWindowLocation = Session.get('iFrameLocation');
    }

    if (Session.get('secondPanelVisible')) {
      if (Session.get('appWidth') > 1200) {
        data.style.secondary.visibility = 'visible';
        data.style.secondary.left = '1280px';
        data.style.secondary.width = (Session.get('appWidth') - (1280 + 80)) + 'px';
        data.style.card.width = '100%';
      } else {
        data.style.secondary.visibility = 'hidden';
        data.style.secondary.left = '4048px';
      }
    } else {
      data.style.secondary.visibility = 'hidden';
      data.style.secondary.left = '4048px';
    }

    if(process.env.NODE_ENV === "test") console.log("App[data]", data);
    return data;
  }
  handleCloseSecurityDialog(){
    Session.set('securityDialogOpen', false);
  }
  handleTextareaUpdate(){

  }
  render(){
    var orbital;
    // if(get(Meteor, 'settings.public.defaults.nfcOrbital')){
    //   orbital = <SciFiPage />;
    // }

    // console.log('this.props.location.query', this.props.location.query)

    Session.set('window.location', this.props.location)
    Session.set('ehrLaunchContext', get(this, 'props.location.query.launch'))

    let socialmedia = {
      title: get(Meteor, 'settings.public.socialmedia.title', ''),
      type: get(Meteor, 'settings.public.socialmedia.type', ''),
      url: get(Meteor, 'settings.public.socialmedia.url', ''),
      image: get(Meteor, 'settings.public.socialmedia.image', ''),
      description: get(Meteor, 'settings.public.socialmedia.description', ''),
      site_name: get(Meteor, 'settings.public.socialmedia.site_name', ''),
  }

  let helmet;
  if(get(Meteor, 'settings.public.socialmedia')){
    helmet = <Helmet>
      <meta charSet="utf-8" />
      <title>{socialmedia.title}</title>
      <link rel="canonical" href={socialmedia.url} />

      <meta property="og:title" content={socialmedia.title} />
      <meta property="og:type" content={socialmedia.type} />
      <meta property="og:url" content={socialmedia.url} />
      <meta property="og:image" content={socialmedia.image} />
      <meta property="og:description" content={socialmedia.description} />
      <meta property="og:site_name" content={socialmedia.site_name} />
      
    </Helmet>
  }

    return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <GlassApp>
            { helmet }
            <SidebarTray>
              {orbital}
              <Header />
                <div id='primaryFlexPanel' className='primaryFlexPanel' >
                  { this.props.children }
                </div>
                <div id='secondaryFlexPanel' className='secondaryFlexPanel' style={this.data.style.secondary}>
                  <FullPageCanvas>
                    { this.renderSecondaryPanel() }
                  </FullPageCanvas>
                </div>
              <Footer />
            </SidebarTray>
            <SecurityDialog />
          </GlassApp>
        </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};
App.childContextTypes = {
  muiTheme: PropTypes.object.isRequired
};
App.defaultProps = {};

ReactMixin(App.prototype, ReactMeteorData);
// export default App;