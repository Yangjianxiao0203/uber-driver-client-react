import React from 'react';
import './App.scss';
import { Route,Routes,BrowserRouter as Router } from 'react-router-dom';
import GoogleMap from './pages/GoogleMap';
import MqttConnector from './components/MqttConnector';
import Root from './pages/Root';
import Register from './pages/Register';
import Login from './pages/Login';
import Driver from './pages/Driver';
import Passenger from './pages/Passenger';
import AuthProvider from './utils/AuthProvider';

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path='/login' element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/google-map" element={<GoogleMap />} /> 
          <Route path='/driver' element={<Driver />}/>
          <Route path='/passenger' element={<Passenger />}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
