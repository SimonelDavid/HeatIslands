import csv
import sys
import os
import subprocess
import textwrap

from openai import OpenAI
from PIL import Image, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from fpdf import FPDF

# Ensure that the city name and years are provided as command-line arguments
if len(sys.argv) != 7:
    print("Usage: python3 gpt_query.py <city_name> <start_year> <end_year> <start_month> <end_month> <address_type> ")
    sys.exit(1)

# Get the city name, start year, and end year from the command-line arguments
city_name = sys.argv[1]
start_year = int(sys.argv[2])
end_year = int(sys.argv[3])
start_month = int(sys.argv[4])
end_month = int(sys.argv[5])
address_type = sys.argv[6]


api_key = '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'
# api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

download_dir_csv = 'heat_island/csv_export'
if not os.path.exists(download_dir_csv):
    os.makedirs(download_dir_csv)

csv_file = os.path.join(download_dir_csv, f'{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}.csv')

# Check if the CSV file exists
if not os.path.exists(csv_file):
    # Convert all arguments to string
    args = [
        "python3",
        "heat_island/land_cover.py",
        str(city_name),  # Assuming city_name is already a string
        str(start_year),
        str(end_year),
        str(start_month),
        str(end_month),
        str(address_type)
    ]

    # Run the Python script if the file does not exist
    try:
        subprocess.run(args, check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running the script: {e}")
        # Handle the error appropriately

# Read the landcover percentage csv file and store the data in a dictionary
landcover_dict = {}
landcover_pdf = ""
with open(csv_file, mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        landcover_dict[row['landcover_name']] = "{:.2f}".format(float(row['percentage']))
        percentage = "{:.2f}%".format(float(row['percentage']))
        landcover_pdf += f"{row['landcover_name']}: {percentage}\n"

landcover_str = ", ".join([key + ": " + value for key, value in landcover_dict.items()])

prompt = city_name + "has the following land cover percentage is the following:" + landcover_str + ". Create a list " \
         "of possible solutions for reducing the temperature in" + city_name + ". Give some advices to the citizens" \
         " and also some ideas for the administrative council to help reducing and preventing the urban heat island."
completion = client.chat.completions.create(
    model="gpt-3.5-turbo-1106",
    messages=[
        {"role": "system", "content": "You are a helpful assistant, tasked with helping the administrative council "
                                      "and potentially citizens find a solution for urban heat islands. Given the "
                                      "city's land cover percentage, try to come up with suggestions for how to "
                                      "potentially reduce the urban heat island effect."
                                      "Your response should be structured for analysis by the administrative council, "
                                      "as it will be considered a study reference for future research and city "
                                      "development."},
        {"role": "user", "content": prompt}
    ],
    max_tokens=256,
    temperature=0.7,
    top_p=0.9
)
response = completion.choices[0].message.content


# Convert hex colors to RGB
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))


# Define your colors
colors_hex = ["845EC2", "D65DB1", "FF6F91", "FF9671", "FFAF68", "FFC75F", "FFCE74"]
colors_rgb = [hex_to_rgb(color) for color in colors_hex]

download_dir = 'heat_island/pdf_export'
if not os.path.exists(download_dir):
    os.makedirs(download_dir)

pdf_file = os.path.join(download_dir, f"{city_name}_{start_year}_{end_year}_{start_month}_{end_month}_{address_type}.pdf")
logo_path = "heat_island/icon.png"

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(0, 10, f"\n\n\n\n\n", 0, 1, 'C')

# Add the title
pdf.set_font("Arial", 'B', 16)
pdf.cell(0, 10, f"{city_name} Analysis for Land cover and Heat Islands", 0, 1, 'C')

# Add the logo
pdf.image(logo_path, x=pdf.w - 30, y=8, w=20)  # Adjust x, y, w as needed

# Reset font for body content
pdf.set_font("Arial", size=12)

# Add the content
pdf.multi_cell(0, 7, landcover_pdf + "\n\n" + response)
pdf.output(pdf_file)
