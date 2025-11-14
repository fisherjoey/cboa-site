from PIL import Image, ImageOps

# Open the local logo file
input_path = "public/images/logos/cboa-logo.png"
print(f"Opening logo from {input_path}...")
img = Image.open(input_path)

# Convert to RGBA if not already
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Invert the colors
print("Inverting colors...")
# Split into channels
r, g, b, a = img.split()

# Invert RGB channels, keep alpha
r_inv = ImageOps.invert(r)
g_inv = ImageOps.invert(g)
b_inv = ImageOps.invert(b)

# Merge back
inverted = Image.merge('RGBA', (r_inv, g_inv, b_inv, a))

# Save to public folder
output_path = "public/cboa-logo-inverted.png"
print(f"Saving inverted logo to {output_path}...")
inverted.save(output_path)

print("Done! Inverted logo saved successfully.")
