import '../styles/styles.css';
import React, { useState, useEffect, useContext } from 'react';
import '../styles/form.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths } from 'date-fns';
import Navbar from '../pages/Navbar';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import { AuthContext } from '../pages/AuthContext';
import { TailSpin } from 'react-loader-spinner';

const fetchWithTimeout = (url, options, timeout = 120000) => {
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

function WelcomePage() {
  const { logout } = useContext(AuthContext);

  const minDate = new Date(2013, 0, 1);

  const [formData, setFormData] = useState({
    cityName: '',
    startDate: minDate,
    endDate: null,
    type: 'city'
  });

  const [mapUrl, setMapUrl] = useState('');
  const [pdfUrl, setPDFUrl] = useState('');
  const [responseText, setResponseText] = useState('');
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
      }, 120000);

      if (response.ok) {
        const data = await response.json();
        setMapUrl(data.map_url);
        setStats(data.stats); // Set the stats state
        // Make the request to generatePDF after the showMap request is successful
        try {
          const pdfResponse = await fetchWithTimeout('https://heat.island.aim-space.com/api/generatePDF', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
          }, 120000);

          if (pdfResponse.ok) {
            const pdfData = await pdfResponse.json();
            setPDFUrl(pdfData.pdf_url);
            setResponseText('');
          } else {
            const errorData = await pdfResponse.text();
            console.error('Failed to fetch data', errorData);
            setResponseText(`Error: ${errorData.message}`);
            setPDFUrl('');
          }
        } catch (error) {
          console.error('Error:', error);
          setResponseText('An unexpected error occurred.');
          setPDFUrl('');
        }

      } else {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseText(error.message);
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

  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="container">
      <Navbar 
        goToHome={goToHome} 
        toggleAboutUsModal={toggleAboutUsModal} 
        toggleContactUsModal={toggleContactUsModal}
      />
      <div>
        <header>
          <h1>You logged in!</h1>
          <p>In addition to the maps of the heat islands, here you will receive a land cover on the chosen location and a recommendation on how to mitigate that heat island and to have fewer hotspots.</p>
          <button onClick={logout}>Logout</button> {/* Logout Button */}
        </header>
      </div>
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
        </div>
      )}
      {pdfUrl && (
        <div>
          <iframe title="PDF" src={pdfUrl} width="800px" height="600px" frameBorder="0"></iframe>
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

export default WelcomePage;
