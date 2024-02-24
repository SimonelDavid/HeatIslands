import requests

def get_bounding_boxes(city_name, type):
    url = f'https://nominatim.openstreetmap.org/search.php?q={city_name}&polygon_geojson=1&format=json'
    response = requests.get(url)
    data = response.json()

    if not data:
        print(f"No data found for {city_name}")
        return None

    # Initialize bounding_box to None
    bounding_box = None

    for city_data in data:
        if city_data.get('addresstype') == type:
            bounding_box = city_data.get('geojson').get('coordinates')
            break  # Exit the loop once the correct type is found

    if not bounding_box:
        print(f"No bounding box found for {city_name} with type '{type}'")
        return None

    # Handle the structure based on the type of geometry
    if city_data.get('geojson').get('type') == 'MultiPolygon':
        # For MultiPolygon, return the first polygon's first ring
        return bounding_box[0][0]
    elif city_data.get('geojson').get('type') == 'Polygon':
        # For Polygon, return the first ring
        return bounding_box[0]
    else:
        print(f"Unsupported geometry type for {city_name}")
        return None

