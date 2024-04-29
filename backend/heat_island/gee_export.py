import ee
import datetime
import geemap.foliumap as geemap
from IPython.display import Image
import os
import sys
import time
from retreive_boundary import get_bounding_boxes
from sklearn.cluster import KMeans
import numpy as np

#geemap.update_package()

# Authenticate to Earth Engine
service_account = 'api-call-simonel@ee-simoneldavid.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, 'heat_island/ee-simoneldavid-99bb414586e9.json')
ee.Initialize(credentials)

# Ensure that the city name and years are provided as command-line arguments
if len(sys.argv) != 7:
    print("Usage: python3 gee_export.py <city_name> <start_year> <end_year> <start_month> <end_month> <address_type>")
    sys.exit(1)

# Get the city name, start year, and end year from the command-line arguments
city_name = sys.argv[1]
start_year = int(sys.argv[2])
end_year = int(sys.argv[3])
start_month = int(sys.argv[4])
end_month = int(sys.argv[5])
address_type = sys.argv[6]

# Check if start year is greater than 2012
if start_year < 2012:
    print("Error: Start year must be greater than 2012.")
    sys.exit(1)

# Check if end year is greater than or equal to start year
if end_year < start_year:
    print("Error: End year must be greater than or equal to start year.")
    sys.exit(1)

if end_month < start_month:
    print("Error: End month must be greater than or equal to start month.")
    sys.exit(1)

# Check if start month and end month are valid
if not (1 <= start_month <= 12) or not (1 <= end_month <= 12):
    print("Error: Invalid start or end month.")
    sys.exit(1)

# Calculate the day of year range taking into account leap years
days_in_start_month = (datetime.datetime(start_year, start_month, 1) - datetime.datetime(start_year, 1, 1)).days + 1
days_in_end_month = (datetime.datetime(end_year, end_month, 1) - datetime.datetime(end_year, 1, 1)).days + 1
start_day_of_year = days_in_start_month
end_day_of_year = days_in_end_month

# Define the cloudMask function
def cloudMask(image):
    qa = image.select('QA_PIXEL')
    mask = qa.bitwiseAnd(1 << 3).Or(qa.bitwiseAnd(1 << 4))
    return image.updateMask(mask.Not())

def get_aoi(city_name, address_type):
    bounding_box = get_bounding_boxes(city_name, address_type)
    print(bounding_box)
    
    if bounding_box:
        # Here, make sure you are iterating over the correct structure
        # Assuming bounding_box is a list of coordinate pairs
        return ee.Geometry.Polygon([bounding_box])
    else:
        return None

aoi = get_aoi(city_name, address_type)

# Create a Map
Map = geemap.Map()
Map.centerObject(aoi, zoom=10)

print(start_day_of_year)
print(end_day_of_year)

# Assign a variable to filter the day of year from July 1 to August 31.
DATE_RANGE = ee.Filter.dayOfYear(start_day_of_year, end_day_of_year)

# Assign a variable to filter years from 2013 – 2022.
YEAR_RANGE = ee.Filter.calendarRange(start_year, end_year, 'year')

# Assign a variable to display images in the map window
DISPLAY = True

# Set the basemap to display as satellite.
Map.setOptions('SATELLITE')

# Define a variable to filter the Landsat Collection 2, Tier 1, Level 2 image collections.
L8 = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .select(['ST_B10', 'QA_PIXEL'])
      .filterBounds(aoi)
      .filter(DATE_RANGE)
      .filter(YEAR_RANGE)
      .map(cloudMask))

# Filter the collections by the CLOUD_COVER property.
filtered_L8 = L8.filter(ee.Filter.lt('CLOUD_COVER', 20))

# Create a function using Landsat scale factors for deriving ST in Kelvin and Celsius.
def applyScaleFactors(image):
    thermalBands = image.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15)
    return image.addBands(thermalBands, None, True)

# Apply scale factors to the image collection.
landsatST = filtered_L8.map(applyScaleFactors)

# Compute mean ST for each pixel throughout the filtered image collection.
mean_LandsatST = landsatST.mean()

# Subset the imagery to the aoi.
clip_mean_ST = mean_LandsatST.clip(aoi)

# Add the image to the map window.
Map.addLayer(clip_mean_ST, {
    'bands': 'ST_B10',
    'min': 28,
    'max': 47,
    'palette': ['blue', 'white', 'red']
}, "ST", DISPLAY)


# Display the map
Map

download_dir = 'heat_island/html_export'
if not os.path.exists(download_dir):
    os.makedirs(download_dir)

html_file = os.path.join(download_dir, f'{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}.html')

Map.to_html(filename=html_file, title='My Map', width='100%', height='700px')

# Function to check if file is fully written
def is_file_written(file_path, timeout=120):
    start_time = time.time()
    while time.time() - start_time < timeout:
        if os.path.exists(file_path):
            # Optionally, check file size or modification time here
            return True
        time.sleep(2)
    return False

# Call the function after generating the HTML file
if is_file_written(html_file):
    print("File written successfully.")
else:
    print("File writing timed out.")