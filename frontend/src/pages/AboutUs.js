import React from 'react';
import '../styles/aboutus.css';

function AboutUs() {
  return (
    <div className='about-us-container'>
      <p className='about-us-text'>
        This application was developed as a bachelor's degree project by David Simonel-Olimpiu. The goal of this project is to empower individuals to understand and analyze urban heat islands that may affect their comfort during the summer. The innovative application is designed to pinpoint heat islands within your desired locale—be it a town, city, county, or country. Simply input your location and select a time period, though it is suggested to opt for the summer months to get the most relevant data.

        For regional administrators looking to mitigate heat effects, this platform not only identifies heat islands but also offers strategic recommendations tailored to the region's specific land cover and heat conditions.

        Join in transforming how urban heat is experienced and adapted to. Embrace the summer with knowledge and confidence—enjoy the season to its fullest with this solution at your fingertips!
      </p>
    </div>
  );
}

export default AboutUs;
