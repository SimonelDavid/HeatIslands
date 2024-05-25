import ee
import sys
import csv
import os
from retreive_boundary import get_bounding_boxes
import json

# Authenticate to Earth Engine
service_account = 'api-call-simonel@ee-simoneldavid.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, 'heat_island/ee-simoneldavid-99bb414586e9.json')
ee.Initialize(credentials)

# Ensure that the city name and years are provided as command-line arguments
if len(sys.argv) != 7:
    print("Usage: python3 land_cover.py <city_name> <start_year> <end_year> <start_month> <end_month> <address_type>")
    sys.exit(1)

# Get the city name, start year, and end year from the command-line arguments
city_name = sys.argv[1]
start_year = int(sys.argv[2])
end_year = int(sys.argv[3])
start_month = int(sys.argv[4])
end_month = int(sys.argv[5])
address_type = sys.argv[6]

# Define the path to the CSV file containing the boundary
boundary_csv_file = f'heat_island/csv_export/boundary/{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}_heat_island_contours.csv'

# Function to read the boundary from the CSV file
def read_boundary_from_csv(file_path):
    with open(file_path, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Assuming the boundary is in the 'coordinates' column and is a JSON string
            coordinates = json.loads(row['coordinates'])
            return coordinates
    return None

# Get the AOI coordinates from the CSV file
aoi_coordinates = read_boundary_from_csv(boundary_csv_file)

if not aoi_coordinates:
    print("Failed to retrieve AOI from the CSV file.")
    sys.exit(1)

# Create an AOI using the coordinates from the CSV file
aoi = ee.Geometry.Polygon(aoi_coordinates)

# Load a land cover dataset (MODIS Land Cover Type Yearly Global 500m)
landcover = ee.Image('MODIS/006/MCD12Q1/2019_01_01').select('LC_Type1')

# Mask and clip to the area of interest
landcover_cluj = landcover.clip(aoi)

# Calculate the area of each land cover type
areaImage = ee.Image.pixelArea().addBands(landcover_cluj)
areaReducer = ee.Reducer.sum().group(1, 'landcover_type')

# Compute the area for each land cover type in square meters
landcoverArea = areaImage.reduceRegion(
    reducer=areaReducer, 
    geometry=aoi, 
    scale=500, 
    maxPixels=1e8
)

# Calculate total area for normalization
totalArea = ee.Number(aoi.area())

# Function to calculate percentage
def calculate_percentage(dict_item):
    landcoverType = ee.Dictionary(dict_item)
    area = landcoverType.getNumber('sum')
    percentage = ee.Number(area).divide(totalArea).multiply(100)
    return landcoverType.set('percentage', percentage)

# Calculate percentages
percentageResults = ee.List(landcoverArea.get('groups')).map(calculate_percentage)

# Mapping from land cover type number to name
landcover_names = {
    1: 'Evergreen Needleleaf forest',
    2: 'Evergreen Broadleaf forest',
    3: 'Deciduous Needleleaf forest',
    4: 'Deciduous Broadleaf forest',
    5: 'Mixed forest',
    6: 'Closed shrublands',
    7: 'Open shrublands',
    8: 'Woody savannas',
    9: 'Savannas',
    10: 'Grasslands',
    11: 'Permanent wetlands',
    12: 'Croplands',
    13: 'Urban and built-up',
    14: 'Cropland/Natural vegetation mosaic',
    15: 'Snow and ice',
    16: 'Barren or sparsely vegetated',
    17: 'Water Bodies',
}

# Mapping of land cover types to broader categories
category_mapping = {
    'Dense green area': [1, 2, 3, 4, 5, 6, 7, 8, 9],
    'Water Area': [11, 17],
    'Urban built-up area': [13],
    'Agriculture area': [12, 14],
    'Mixed green, water and built-up area': [10, 15, 16]
}

# Calculate percentages and get information
percentageResultsInfo = percentageResults.getInfo()

# Initialize a dictionary to hold grouped category percentages
grouped_percentages = {
    'Dense green area': 0,
    'Water Area': 0,
    'Urban built-up area': 0,
    'Agriculture area': 0,
    'Mixed green, water and built-up area': 0
}

# Loop through the results and group percentages into categories
for result in percentageResultsInfo:
    landcover_type = result['landcover_type']
    percentage = result['percentage']
    
    # Find the corresponding category for the landcover type
    for category, types in category_mapping.items():
        if landcover_type in types:
            grouped_percentages[category] += percentage
            break

# Create a list for CSV data
csv_data = [{'category': category, 'percentage': percentage} for category, percentage in grouped_percentages.items()]

download_dir_csv = 'heat_island/csv_export/landcover'
if not os.path.exists(download_dir_csv):
    os.makedirs(download_dir_csv)

csv_file = os.path.join(download_dir_csv, f'{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}.csv')

# Write data to CSV
with open(csv_file, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['category', 'percentage'])
    writer.writeheader()
    writer.writerows(csv_data)

print(f"Data exported successfully to {csv_file}")
