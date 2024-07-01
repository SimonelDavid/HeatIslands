import subprocess
import json
import time

def get_bounding_boxes(city_name, address_type):
    url = f"https://nominatim.openstreetmap.org/search.php?q={city_name}&polygon_geojson=1&format=json"
    
    for attempt in range(5):  # Retry up to 5 times
        try:
            result = subprocess.run(
                ["curl", "-s", url],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.returncode != 0:
                print(f"Error running curl command: {result.stderr}. Retrying in {2 ** attempt} seconds...")
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            
            data = json.loads(result.stdout)
            
            if not data:
                print(f"No data found for {city_name}")
                return None

            bounding_box = None

            for city_data in data:
                if city_data.get('type') == 'administrative' and city_data.get('addresstype') == address_type:
                    bounding_box = city_data.get('geojson').get('coordinates')
                    break  # Exit the loop once the correct type is found

            if not bounding_box:
                print(f"No bounding box found for {city_name} with type '{address_type}'")
                return None

            # Handle the structure based on the type of geometry
            if city_data.get('geojson').get('type') == 'MultiPolygon':
                return bounding_box[0][0]
            elif city_data.get('geojson').get('type') == 'Polygon':
                return bounding_box[0]
            else:
                print(f"Unsupported geometry type for {city_name}")
                return None
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}. Retrying in {2 ** attempt} seconds...")
            time.sleep(2 ** attempt)  # Exponential backoff

    print("Failed to retrieve data after multiple attempts.")
    return None