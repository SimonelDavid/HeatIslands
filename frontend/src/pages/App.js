import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../pages/Navbar';
import Login from '../pages/Login';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/styles.css';
import '../styles/form.css';
import '../styles/navbar.css';
import { addMonths } from 'date-fns';
import { TailSpin } from 'react-loader-spinner';
import { AuthContext } from '../pages/AuthContext';

const fetchWithTimeout = (url, options, timeout = 180000) => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchPromise = fetch(url, { ...options, signal });

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    fetchPromise
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

function App() {
  const minDate = new Date(2013, 0, 1);

  const [formData, setFormData] = useState({
    cityName: '',
    startDate: minDate,
    endDate: null,
    type: 'city'
  });

  const [mapUrl, setMapUrl] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);
  const [showContactUsModal, setShowContactUsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [recommendation, setRecommendation] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [stats, setStats] = useState({});

  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: date,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { cityName, startDate, endDate } = formData;
    if (!cityName) {
      newErrors.cityName = 'Location is required.';
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required.';
    } else if (startDate.getFullYear() < 2013) {
      newErrors.startDate = 'Start date should not be before the year 2013.';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required.';
    } else if (endDate.getFullYear() > 2023) {
      newErrors.endDate = 'End date should not be after the year 2023.';
    } else if (startDate && endDate && endDate <= startDate) {
      newErrors.endDate = 'End date should be at least one month after the start date.';
    }
    if (startDate && ![3, 4, 5, 6, 7, 8].includes(startDate.getMonth())) {
      setRecommendation('It is recommended to select a summer-like month (April to September).');
    } else {
      setRecommendation('');
    }
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid) {
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
  
    setLoading(true); // Set loading to true before the request
  
    try {
      const response = await fetchWithTimeout('https://heat.island.aim-space.com/api/showMap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      }, 180000);
  
      if (response.ok) {
        const data = await response.json();
        setMapUrl(data.map_url);
        setStats(data.stats); // Set the stats state
        setResponseText(''); // Clear any previous error message
      } else {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.name === 'AbortError') {
        setResponseText('The request timed out. Please press the button again.');
      } else {
        setResponseText('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading to false after the request
    }
  };

  const toggleAboutUsModal = () => {
    setShowAboutUsModal(!showAboutUsModal);
  };

  const toggleContactUsModal = () => {
    setShowContactUsModal(!showContactUsModal);
  };

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="container">
      <Navbar 
        setShowLogin={toggleLogin} 
        toggleAboutUsModal={toggleAboutUsModal} 
        toggleContactUsModal={toggleContactUsModal}
      />
      <div>
        <header>
          <h1>Welcome to the Heat Island Analysis Tool</h1>
          <p>This tool allows you to analyze urban heat islands by selecting a specific location, type of location (city, county, or country), and a time range. Upon submission, you will receive a heat map displaying the heat island effect for your specified parameters.</p>
        </header>
      </div>
      {showLogin && (
        <div className="login-container">
          <Login />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label data-guideline="Enter the name of the city, county or country you want to analyze.">
          Location:
          <input
            type="text"
            name="cityName"
            value={formData.cityName}
            onChange={handleInputChange}
            placeholder="Type here..."
          />
          {errors.cityName && <div className="error-popup">{errors.cityName}</div>}
        </label>
        <br />
        <label data-guideline="Should not be before the year 2012;">
          Select start date: 
          <DatePicker
            selected={formData.startDate}
            name='startDate'
            onChange={(date) => handleDateChange('startDate', date)}
            placeholderText="Select start date"
            dateFormat="yyyy-MM-dd"
            minDate={minDate}
            maxDate={addMonths(new Date(), -1)}
          />
          {errors.startDate && <div className="error-popup">{errors.startDate}</div>}
        </label>
        <label data-guideline="Should not be after the year 2023 and must be greater than the start date by at least one month.">
          Select end date: 
          <DatePicker
            selected={formData.endDate}
            name='endDate'
            onChange={(date) => handleDateChange('endDate', date)}
            placeholderText="Select end date"
            dateFormat="yyyy-MM-dd"
            minDate={minDate}
            maxDate={addMonths(new Date(), -1)}
          />
          {errors.endDate && <div className="error-popup">{errors.endDate}</div>}
        </label>
        <br />
        <label data-guideline="Select the type of location (city, county, country, province, municipality, town).">
          Type:
          <select name="type" value={formData.type} onChange={handleInputChange}>
            <option value="city">City</option>
            <option value="country">Country</option>
            <option value="county">County</option>
            <option value="province">Province</option>
            <option value="municipality">Municipality</option>
            <option value="town">Town</option>
          </select>
        </label>
        <br />
        {recommendation && <div className="recommendation-popup">{recommendation}</div>}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button type="submit" disabled={!isFormValid}>Show the map</button>
          {loading && (
            <div style={{ marginLeft: '10px' }}>
              <TailSpin height="30" width="30" color="blue" ariaLabel="loading" />
            </div>
          )}
        </div>
      </form>
      {mapUrl && (
        <div>
          <iframe title="Map" src={mapUrl} width="800px" height="600px" frameBorder="0"></iframe>
          {stats && (
            <div className="stats">
              <h2>Statistics for {formData.cityName}</h2>
              <ul>
                {Object.entries(stats).map(([key, value]) => (
                  <li key={key}>
                    <span className="label">{key}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {showAboutUsModal && (
        <div className="about-us-modal">
          <button onClick={toggleAboutUsModal} className="close-button">X</button>
          <AboutUs />
        </div>
      )}
      {showContactUsModal && (
        <div className="contact-us-modal">
          <button onClick={toggleContactUsModal} className="close-button">X</button>
          <ContactUs />
        </div>
      )}
      <p>{responseText}</p>
      <div id="footer" className='footer'>
        <p>©DAVID Simonel-Olimpiu All rights reserved 2024</p>
      </div>
    </div>
  );
}

export default App;
