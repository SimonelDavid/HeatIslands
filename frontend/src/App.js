import './styles.css';
import React, { useState } from 'react';
import './form.css';
import logo from './assets/icon.png';
import Login from './Login';
import Navbar from './Navbar';
import './navbar.css';
import AboutUs from './AboutUs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
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

  //validations

  if (
    formData.cityName === '' ||
    formData.type === '' ||
    formData.startDate === null ||
    formData.endDate === null
  ) {
    setResponseText('Please fill in all required fields.');
    return;
  }
  

  // if (formData.startYear < 2013 || formData.endYear < 2013) {
  //     setResponseText('Year must be greater than or equal to 2013');
  //     return;
  // }

  // if (
  //     formData.startMonth < 1 ||
  //     formData.startMonth > 12 ||
  //     formData.endMonth < 1 ||
  //     formData.endMonth > 12
  //   ) {
  //     setResponseText('Month must be between 1 and 12');
  //     return;
  // }

  // if (formData.startYear === formData.endYear && formData.startMonth >= formData.endMonth) {
  //     setResponseText('Start month must be less than end month');
  //     return;
  // }

  // if (formData.startYear >= formData.endYear) {
  //     setResponseText('Start year must be less than end year');
  //     return;
  // }

  const bodyData = {
    cityName: formData.cityName,
    startYear: formData.startDate.getFullYear().toString(),
    endYear: formData.endDate.getFullYear().toString(),
    startMonth: (formData.startDate.getMonth() + 1).toString(),
    endMonth: (formData.endDate.getMonth() + 1).toString(),
    type: formData.type,
  };

  try {
      const response = await fetch('http://backend:8080/api/showMap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Map URL:", data.map_url);
        setMapUrl(data.map_url);
        // setResponseText(''); 
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch data', errorData);
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
          <input type="text" name="cityName" value={formData.cityName} onChange={handleInputChange} placeholder='Type here...'/>
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
              minDate={new Date(2013, 0, 1)} // Data minimă
              maxDate={addMonths(new Date(), -1)} // Data maximă (luna curentă - 1)
            />
          </label>
        <br />
        <label>
          Type:
          <select name="type" value={formData.type} onChange={handleInputChange}>
            <option value="city">city</option>
            <option value="country">country</option>
            <option value="county">county</option>
          </select>
        </label>
        <br />
        <button type="submit">Show the map</button>
      </form>
      {mapUrl && (
        <div>
          <iframe title="Map" src={mapUrl} target="_blank" width="800px" height="600" frameBorder="0"></iframe>
        </div>
      )}
      <p>{responseText}</p>
      <div id="footer" className='footer'>
        <p1>Contact: +40 (734) 989 230</p1>
      </div>
    </div>
  );
}

export default App;