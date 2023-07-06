import React,{useEffect} from 'react';
import './App.scss';
import { Route,Routes,BrowserRouter as Router } from 'react-router-dom';
import GoogleMap from './pages/GoogleMap';
import MqttConnector from './components/MqttConnector';
import Root from './pages/Root';
import Register from './pages/Register';
import {setAuthToken} from './utils/setAuthToken';

function App() {

  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
  },[localStorage.token])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/google-map" element={<GoogleMap />} />
        <Route path="/mqtt" element={<MqttConnector />} />
      </Routes>
    </Router>
  );
}

export default App;
