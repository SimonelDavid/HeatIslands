import '../styles/styles.css';
import React, { useState } from 'react';
import '../styles/form.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths } from 'date-fns';
import Navbar from '../pages/Navbar';
import Login from '../pages/Login';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import { AuthProvider } from '../pages/AuthContext';

function WelcomePage() {
  const [formData, setFormData] = useState({
    cityName: '',
    startDate: null,
    endDate: null,
    type: 'city'
  });

  const [mapUrl, setMapUrl] = useState('');
  const [pdfUrl, setPDFUrl] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);
  const [showContactUsModal, setShowContactUsModal] = useState(false);

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
      const response = await fetch('https://heat.island.aim-space.com/api/showMap', {
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
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseText(error.message);
    }

    try {
      const response = await fetch('https://heat.island.aim-space.com/api/generatePDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("PDF URL:", data.pdf_url);
        setPDFUrl(data.pdf_url);
        setResponseText('');
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch data', errorData);
        setResponseText(`Error: ${errorData.message}`);
        setPDFUrl('');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseText('An unexpected error occurred.');
      setPDFUrl('');
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
    <AuthProvider> {/* Wrap your component hierarchy with AuthProvider */}
      <div className="container">
        <Navbar 
          setShowLogin={toggleLogin} 
          toggleAboutUsModal={toggleAboutUsModal} 
          toggleContactUsModal={toggleContactUsModal}
        />
        <div>
          <header>
            <h1>You logged in!</h1>
            <p>In addition of the maps of the heat islands, here you will receive a land cover on the choosed location and a recomandation on how to mitigate that heat island and to have less hotspots.</p>
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
          </label>
          <br />
          <label data-guideline="Should not be before the year 2012;">
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
          <label data-guideline="Should not be after the year 2023 and must be greater than the start date by at least one month.">
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
          <label data-guideline="Select the type of location (city, county, or country).">
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
          <button type="submit">Show the map</button>
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
    </AuthProvider>
  );
}

export default WelcomePage;
