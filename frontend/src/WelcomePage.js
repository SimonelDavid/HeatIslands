import './styles.css';
import React, { useState } from 'react';
import './form.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { addMonths } from 'date-fns';

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
  
  return (
    
    <div className="container"> 
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
            minDate={new Date(2013, 0, 1)} // data minima
            maxDate={addMonths(new Date(), -1)} // data maxima
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
      {pdfUrl && (
        <div>
          <iframe title="PDF" src={pdfUrl} width="800px" height="600" frameBorder="0"></iframe>
        </div>
      )}
      <p>{responseText}</p>
    </div>
  );
}

export default WelcomePage;