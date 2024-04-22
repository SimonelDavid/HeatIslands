import React, { useState } from 'react';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import Login from './Login';
import AboutUs from './AboutUs';
import DatePicker from 'react-datepicker';
import logo from './assets/icon.png';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.css';
import './form.css';
import './navbar.css';
import { addMonths } from 'date-fns';

function App() {
  const [formData, setFormData] = useState({
    cityName: '',
    startDate: null,
    endDate: null,
    type: 'city'
  });

  const [mapUrl, setMapUrl] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);

  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.cityName === '' ||
      formData.type === '' ||
      formData.startDate === null ||
      formData.endDate === null
    ) {
      setResponseText('Please fill in all required fields.');
      return;
    }

    const bodyData = {
      cityName: formData.cityName,
      startYear: formData.startDate.getFullYear().toString(),
      endYear: formData.endDate.getFullYear().toString(),
      startMonth: (formData.startDate.getMonth() + 1).toString(),
      endMonth: (formData.endDate.getMonth() + 1).toString(),
      type: formData.type,
    };

    try {
      const response = await fetch('http://backend:8080/api/showMap', { // Use HTTPS
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        setMapUrl(data.map_url);
      } else {
        const errorData = await response.json();
        setResponseText(`Error: ${errorData.message}`);
        setMapUrl('');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseText('An unexpected error occurred.');
      setMapUrl('');
    }
  };

  const toggleAboutUsModal = () => {
    setShowAboutUsModal(!showAboutUsModal);
  };

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <AuthProvider> {/* Wrap your component hierarchy with AuthProvider */}
      <div className="container">
        <Navbar setShowLogin={toggleLogin} toggleAboutUsModal={toggleAboutUsModal} />
        <div>
          <header>
            <img src={logo} alt="logo" className="logo" />
            <h1>HeatScape</h1>
            <p>We know all the hotspots in town</p>
          </header>
        </div>
        {showLogin && (
          <div className="login-container">
            <Login />
          </div>
        )}
        {showAboutUsModal && (
          <div className="about-us-modal">
            <button onClick={toggleAboutUsModal} className="close-button">X</button>
            <AboutUs />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label>
            City:
            <input
              type="text"
              name="cityName"
              value={formData.cityName}
              onChange={handleInputChange}
              placeholder="Type here..."
            />
          </label>
          <br />
          <label>
            Select start date:
            <DatePicker
              selected={formData.startDate}
              name='startDate'
              onChange={(date) => handleInputChange({ target: { name: 'startDate', value: date } })}
              placeholderText="Select start date"
              dateFormat="yyyy-MM-dd"
              minDate={new Date(2013, 0, 1)}
              maxDate={addMonths(new Date(), -1)}
            />
          </label>
          <label>
            Select end date:
            <DatePicker
              selected={formData.endDate}
              name='endDate'
              onChange={(date) => handleInputChange({ target: { name: 'endDate', value: date } })}
              placeholderText="Select end date"
              dateFormat="yyyy-MM-dd"
              minDate={new Date(2013, 0, 1)}
              maxDate={addMonths(new Date(), -1)}
            />
          </label>
          <br />
          <label>
            Type:
            <select name="type" value={formData.type} onChange={handleInputChange}>
              <option value="city">City</option>
              <option value="country">Country</option>
              <option value="county">County</option>
            </select>
          </label>
          <br />
          <button type="submit">Show the map</button>
        </form>
        {mapUrl && (
          <div>
            <iframe title="Map" src={mapUrl} width="800px" height="600px" frameBorder="0"></iframe>
          </div>
        )}
        <p>{responseText}</p>
        <div id="footer" className='footer'>
          <p>Contact: +40 (734) 989 230</p>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
