-- Delete all existing products
DELETE FROM products;

-- Reset the sequence (optional, for clean IDs)
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Insert 5 new products (update image URLs after uploading to GCP Storage or image host)
INSERT INTO products (category_id, name_en, name_es, description_en, description_es, price, stock, image_url, images) VALUES
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Pixel Lion T-Shirt',
    'Polera León Pixel',
    'Burgundy t-shirt featuring a majestic lion design in pixel/ASCII art style. Premium cotton, unique urban style.',
    'Polera color burdeo con diseño de león majestuoso en estilo pixel/ASCII art. Algodón premium, estilo urbano único.',
    30.00,
    50,
    'https://storage.googleapis.com/ioio-products/lion-pixel-tshirt.jpg',
    '["https://storage.googleapis.com/ioio-products/lion-pixel-tshirt.jpg"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Happy Day T-Shirt',
    'Polera Happy Day',
    'Light blue t-shirt with pixelated sun design and "HAPPY DAY!" text. Spread positivity with this unique ASCII art piece.',
    'Polera celeste con diseño de sol pixelado y texto "HAPPY DAY!". Difunde positividad con esta pieza única de arte ASCII.',
    30.00,
    50,
    'https://storage.googleapis.com/ioio-products/happy-day-tshirt.jpg',
    '["https://storage.googleapis.com/ioio-products/happy-day-tshirt.jpg"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'ASCII Demon T-Shirt',
    'Polera Demonio ASCII',
    'Green t-shirt featuring a demon face created entirely from ASCII characters. Bold cyberpunk aesthetic.',
    'Polera verde con cara de demonio creada completamente con caracteres ASCII. Estética cyberpunk audaz.',
    30.00,
    50,
    'https://storage.googleapis.com/ioio-products/demon-ascii-tshirt.jpg',
    '["https://storage.googleapis.com/ioio-products/demon-ascii-tshirt.jpg"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Code Butterfly T-Shirt',
    'Polera Mariposa Code',
    'Purple t-shirt with a beautiful butterfly made from code symbols and characters. Tech meets nature.',
    'Polera morada con una hermosa mariposa hecha de símbolos y caracteres de código. La tecnología se encuentra con la naturaleza.',
    30.00,
    50,
    'https://storage.googleapis.com/ioio-products/butterfly-code-tshirt.jpg',
    '["https://storage.googleapis.com/ioio-products/butterfly-code-tshirt.jpg"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Matrix Eagle T-Shirt',
    'Polera Águila Matrix',
    'Yellow t-shirt with a powerful eagle design in matrix/code style. Symbol of freedom in digital form.',
    'Polera amarilla con diseño de águila poderosa en estilo matrix/código. Símbolo de libertad en forma digital.',
    30.00,
    50,
    'https://storage.googleapis.com/ioio-products/eagle-matrix-tshirt.jpg',
    '["https://storage.googleapis.com/ioio-products/eagle-matrix-tshirt.jpg"]'
);
