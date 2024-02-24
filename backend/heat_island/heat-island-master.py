import subprocess
import sys

def run_command(command):
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

def main(args):
    if len(args) != 7:
        print("Usage: python3 heat-island-master.py <city_name> <start_year> <end_year> <start_month> <end_month>")
        sys.exit(1)

    city_name, start_year, end_year, start_month, end_month, address_type = args[1:]

    # Executing gee_export.py
    gee_export_command = ["python3", "heat_island/gee_export.py", city_name, start_year, end_year, start_month, end_month, address_type]
    run_command(gee_export_command)

    # Executing land_cover.py
    land_cover_command = ["python3", "heat_island/land_cover.py", city_name, address_type]
    run_command(land_cover_command)

if __name__ == "__main__":
    main(sys.argv)
