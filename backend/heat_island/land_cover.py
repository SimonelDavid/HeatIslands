import ee
import sys
import csv
import os
from retreive_boundary import get_bounding_boxes

# Authenticate to Earth Engine
service_account = 'api-call-simonel@ee-simoneldavid.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, 'heat_island/ee-simoneldavid-99bb414586e9.json')
ee.Initialize(credentials)

# Ensure that the city name and years are provided as command-line arguments
if len(sys.argv) != 7:
    print("Usage: python3 land_cover.py <city_name> <address_type>")
    sys.exit(1)

# Get the city name, start year, and end year from the command-line arguments
city_name = sys.argv[1]
start_year = int(sys.argv[2])
end_year = int(sys.argv[3])
start_month = int(sys.argv[4])
end_month = int(sys.argv[5])
address_type = sys.argv[6]

def get_aoi(city_name, address_type):
    bounding_box = get_bounding_boxes(city_name, address_type)
    print(bounding_box)
    
    if bounding_box:
        # Here, make sure you are iterating over the correct structure
        # Assuming bounding_box is a list of coordinate pairs
        return ee.Geometry.Polygon([bounding_box])
    else:
        return None

cluj_napoca = get_aoi(city_name, address_type)

# Load a land cover dataset (MODIS Land Cover Type Yearly Global 500m)
landcover = ee.Image('MODIS/006/MCD12Q1/2019_01_01') \
    .select('LC_Type1')

# Mask and clip to the area of interest
landcover_cluj = landcover.clip(cluj_napoca)

# Calculate the area of each land cover type
areaImage = ee.Image.pixelArea().addBands(landcover_cluj)
areaReducer = ee.Reducer.sum().group(1, 'landcover_type')

# Compute the area for each land cover type in square meters
landcoverArea = areaImage.reduceRegion(
    reducer=areaReducer, 
    geometry=cluj_napoca, 
    scale=500, 
    maxPixels=1e8
)

# Calculate total area for normalization
totalArea = ee.Number(cluj_napoca.area())

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

# Calculate percentages and get information
percentageResultsInfo = percentageResults.getInfo()

# Create a list for CSV data
csv_data = []

# Loop through the results and match land cover types with names
for result in percentageResultsInfo:
    landcover_type = result['landcover_type']
    percentage = result['percentage']
    landcover_name = landcover_names.get(landcover_type, "Unknown")

    # Add to CSV data list
    csv_data.append({
        'landcover_name': landcover_name,
        'percentage': percentage
    })

download_dir_csv = 'heat_island/csv_export'
if not os.path.exists(download_dir_csv):
    os.makedirs(download_dir_csv)

csv_file = os.path.join(download_dir_csv, f'{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}.csv')


# Write data to CSV
with open(csv_file, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['landcover_name', 'percentage'])
    writer.writeheader()
    writer.writerows(csv_data)

print(f"Data exported successfully to {csv_file}")