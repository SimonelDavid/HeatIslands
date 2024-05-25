# Import necessary modules
import ee
import datetime
import geemap.foliumap as geemap
from IPython.display import Image
import os
import sys
import time
import csv
from retreive_boundary import get_bounding_boxes
from sklearn.cluster import KMeans
import numpy as np

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
        return ee.Geometry.Polygon([bounding_box])
    else:
        return None

aoi = get_aoi(city_name, address_type)

if aoi is None:
    print("Failed to retrieve AOI for the given city and address type.")
    sys.exit(1)

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

# Compute statistics: mean and standard deviation of the temperature within the AOI
stats = clip_mean_ST.reduceRegion(
    reducer=ee.Reducer.mean().combine(
        reducer2=ee.Reducer.stdDev(),
        sharedInputs=True
    ),
    geometry=aoi,
    scale=30,
    maxPixels=1e9
)

mean_temp = stats.get('ST_B10_mean').getInfo()
std_dev_temp = stats.get('ST_B10_stdDev').getInfo()

# Define dynamic thresholds
heat_island_threshold_temp = mean_temp + 1 * std_dev_temp
hot_spot_threshold_temp = mean_temp + 2 * std_dev_temp
cold_spot_threshold_temp = mean_temp - 1 * std_dev_temp

def detect_heat_island_contours(image, threshold_temp):
    mask = image.gt(threshold_temp).selfMask()
    connected = mask.focal_max(kernel=ee.Kernel.circle(radius=7), iterations=8)
    vectors = connected.reduceToVectors(
        geometryType='polygon',
        reducer=ee.Reducer.countEvery(),
        scale=30,
        maxPixels=1e8,
        geometry=aoi
    )
    return vectors

def detect_hot_spot_contours(image, threshold_temp):
    mask = image.gt(threshold_temp).selfMask()
    connected = mask.focal_max(kernel=ee.Kernel.circle(radius=1), iterations=1)
    vectors = connected.reduceToVectors(
        geometryType='polygon',
        reducer=ee.Reducer.countEvery(),
        scale=30,
        maxPixels=1e8,
        geometry=aoi
    )
    return vectors

def detect_cold_spot_contours(image, threshold_temp):
    mask = image.lt(threshold_temp).selfMask()
    connected = mask.focal_min(kernel=ee.Kernel.circle(radius=2), iterations=3)
    vectors = connected.reduceToVectors(
        geometryType='polygon',
        reducer=ee.Reducer.countEvery(),
        scale=30,
        maxPixels=1e8,
        geometry=aoi
    )
    return vectors

# Detect contours using dynamic thresholds
heat_island_contours = detect_heat_island_contours(clip_mean_ST.select('ST_B10'), heat_island_threshold_temp)
hot_spot_contours = detect_hot_spot_contours(clip_mean_ST.select('ST_B10'), hot_spot_threshold_temp)
cold_spot_contours = detect_cold_spot_contours(clip_mean_ST.select('ST_B10'), cold_spot_threshold_temp)

# Add the contours to the map window
Map.addLayer(heat_island_contours, {'color': 'yellow'}, "Heat Island", DISPLAY)
Map.addLayer(hot_spot_contours, {'color': 'red'}, "Hot Spots", DISPLAY)
Map.addLayer(cold_spot_contours, {'color': 'blue'}, "Cold Spots", DISPLAY)

# Get the list of coordinates and areas of the heat island contours
heat_island_features = heat_island_contours.getInfo()['features']
hot_spot_features = hot_spot_contours.getInfo()['features']
cold_spot_features = cold_spot_contours.getInfo()['features']

# Prepare data for CSV
boundary_csv_data = []
for feature in heat_island_features:
    geometry = feature['geometry']
    coordinates = geometry['coordinates']
    area = ee.Geometry(geometry).area(maxError=1).getInfo()  # Specify an error margin
    boundary_csv_data.append({
        'type': geometry['type'],
        'coordinates': coordinates,
        'area': area
    })

# Calculate the total area for heat islands, hot spots, and cold spots
total_heat_island_area = sum([ee.Geometry(feature['geometry']).area(maxError=1).getInfo() for feature in heat_island_features])
total_hot_spot_area = sum([ee.Geometry(feature['geometry']).area(maxError=1).getInfo() for feature in hot_spot_features])
total_cold_spot_area = sum([ee.Geometry(feature['geometry']).area(maxError=1).getInfo() for feature in cold_spot_features])

# Prepare stats data for the CSV file
stats_csv_data = [
    {'category': 'Total Heat Island Area(m^2)', 'value': total_heat_island_area},
    {'category': 'Number of Hot Spots', 'value': len(hot_spot_features)},
    {'category': 'Total Hot Spot Area(m^2)', 'value': total_hot_spot_area},
    {'category': 'Number of Cold Spots', 'value': len(cold_spot_features)},
    {'category': 'Total Cold Spot Area(m^2)', 'value': total_cold_spot_area},
    {'category': 'Total Area Surface(m^2)', 'value': ee.Geometry(aoi).area(maxError=1).getInfo()}
]

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
            return True
        time.sleep(2)
    return False

# Call the function after generating the HTML file
if is_file_written(html_file):
    print("HTML file written successfully.")
else:
    print("HTML file writing timed out.")

# Directory structure
boundary_dir = 'heat_island/csv_export/boundary'
stats_dir = 'heat_island/csv_export/stats'
landcover_dir = 'heat_island/csv_export/landcover'

for directory in [boundary_dir, stats_dir, landcover_dir]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# Define the CSV output paths
boundary_csv_output_path = os.path.join(boundary_dir, f'{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}_heat_island_contours.csv')
stats_csv_output_path = os.path.join(stats_dir, f'{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}_heat_island_stats.csv')

# Write the heat island contours to a CSV file
with open(boundary_csv_output_path, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['type', 'coordinates', 'area'])
    writer.writeheader()
    writer.writerows(boundary_csv_data)

print(f"Heat island contours exported successfully to {boundary_csv_output_path}")

# Write the heat island stats to a CSV file
with open(stats_csv_output_path, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['category', 'value'])
    writer.writeheader()
    writer.writerows(stats_csv_data)

print(f"Heat island stats exported successfully to {stats_csv_output_path}")
