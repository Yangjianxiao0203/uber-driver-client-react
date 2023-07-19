import React from 'react';
import './App.scss';
import { Route,Routes,BrowserRouter as Router } from 'react-router-dom';
import Root from './pages/Root';
import Register from './pages/Register';
import Login from './pages/Login';
import Driver from './pages/Driver';
import Passenger from './pages/Passenger';
import AuthProvider from './utils/AuthProvider';
import DriverTracking from './pages/DriverTracking';
import PassengerTracking from './pages/PassengerTracking';
import PassengerTrackOnRide from './pages/PassengerTrackOnRide';
import SelectableMap from './components/SelectableMap';
import SearchBox from './components/SelectableMap/components/SearchBox';
import PassengerCallCar from './pages/PassengerCallCar';
import PassengerWaitingPage from './pages/PassengerWaitingPage';
import PaymentPopUp from './components/PaymentPopUp';
import PassengerReview from './pages/PassengerReview';
import PassengerHistory from './pages/PassengerHistory';

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path='/login' element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/driver' element={<Driver />}/>
          <Route path='/driver/:rid/:channelName' element={<DriverTracking />} />
          
          <Route path='/passenger' element={<Passenger />}/>
          <Route path='/passenger/createRide' element={<PassengerCallCar />} />
          <Route path='/passenger/waiting' element={<PassengerWaitingPage />} />

          <Route path='/passenger/:rid/:channelName' element={<PassengerTracking />} />
          <Route path='/passenger/track/onRide/:rid/:channelName' element={<PassengerTrackOnRide />} />

          <Route path='/passenger/payment/:rid' element={<PaymentPopUp />} />

          <Route path='/passenger/review/:rid' element={<PassengerReview />} />

          <Route path = '/passenger/history' element={<PassengerHistory />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
