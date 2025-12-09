-- IOIO E-Commerce Seed Data

-- Insert admin user (password: admin123)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@ioio.com', '$2a$10$pU1KkRaMAcftcuzurhA3S.92QhvGkqxAWMTQ5/rylouvZrFwIrar2', 'Admin', 'IOIO', 'admin'),
('customer@example.com', '$2a$10$pU1KkRaMAcftcuzurhA3S.92QhvGkqxAWMTQ5/rylouvZrFwIrar2', 'John', 'Doe', 'customer');

-- Insert categories
INSERT INTO categories (name_en, name_es, slug, description_en, description_es) VALUES
('Clothes', 'Ropa', 'clothes', 'Cyberpunk and makerspace inspired clothing', 'Ropa inspirada en cyberpunk y makerspace'),
('Merchandising', 'Merchandising', 'merchandising', 'Unique IOIO branded merchandise and accessories', 'Merchandising y accesorios únicos de la marca IOIO');

-- Insert products for Clothes category
INSERT INTO products (category_id, name_en, name_es, description_en, description_es, price, stock, image_url, images) VALUES
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Neon Circuit T-Shirt',
    'Camiseta Circuito Neón',
    'Black t-shirt with glowing neon circuit board design. Made from premium cotton with reflective ink that glows under UV light.',
    'Camiseta negra con diseño de placa de circuito neón brillante. Hecha de algodón premium con tinta reflectante que brilla bajo luz UV.',
    29.99,
    50,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Cyberpunk Hoodie',
    'Sudadera Cyberpunk',
    'Premium black hoodie with geometric patterns and LED-compatible pockets. Perfect for the urban explorer.',
    'Sudadera negra premium con patrones geométricos y bolsillos compatibles con LED. Perfecta para el explorador urbano.',
    59.99,
    30,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Tech Cargo Pants',
    'Pantalones Cargo Tech',
    'Multi-pocket cargo pants with water-resistant fabric and reflective strips. Built for makers and hackers.',
    'Pantalones cargo con múltiples bolsillos, tela resistente al agua y tiras reflectantes. Hechos para makers y hackers.',
    69.99,
    40,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
    '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Matrix Jacket',
    'Chaqueta Matrix',
    'Sleek black jacket with hidden pockets and modular patches. Water-resistant and breathable.',
    'Chaqueta negra elegante con bolsillos ocultos y parches modulares. Resistente al agua y transpirable.',
    89.99,
    25,
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Binary Code Socks',
    'Calcetines Código Binario',
    'Comfortable socks with binary code pattern. Made from bamboo fiber for maximum comfort.',
    'Calcetines cómodos con patrón de código binario. Hechos de fibra de bambú para máxima comodidad.',
    12.99,
    100,
    'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500',
    '["https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'clothes'),
    'Hacker Cap',
    'Gorra Hacker',
    'Adjustable cap with embroidered IOIO logo and hidden pocket. Perfect for any occasion.',
    'Gorra ajustable con logo IOIO bordado y bolsillo oculto. Perfecta para cualquier ocasión.',
    24.99,
    60,
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
    '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500"]'
);

-- Insert products for Merchandising category
INSERT INTO products (category_id, name_en, name_es, description_en, description_es, price, stock, image_url, images) VALUES
(
    (SELECT id FROM categories WHERE slug = 'merchandising'),
    'IOIO Sticker Pack',
    'Pack de Stickers IOIO',
    'Set of 10 holographic stickers featuring IOIO logo and cyberpunk designs. Waterproof and UV resistant.',
    'Set de 10 stickers holográficos con el logo IOIO y diseños cyberpunk. Resistentes al agua y rayos UV.',
    9.99,
    200,
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500',
    '["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'merchandising'),
    'LED Keychain',
    'Llavero LED',
    'IOIO branded keychain with built-in LED light. USB rechargeable and durable metal construction.',
    'Llavero con marca IOIO y luz LED integrada. Recargable por USB y construcción de metal durable.',
    14.99,
    150,
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500',
    '["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'merchandising'),
    'Circuit Board Mug',
    'Taza Placa de Circuito',
    'Ceramic mug with circuit board design. Microwave and dishwasher safe. 350ml capacity.',
    'Taza de cerámica con diseño de placa de circuito. Apta para microondas y lavavajillas. Capacidad 350ml.',
    16.99,
    80,
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
    '["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'merchandising'),
    'Tech Backpack',
    'Mochila Tech',
    'Water-resistant backpack with laptop compartment and USB charging port. IOIO logo embroidered.',
    'Mochila resistente al agua con compartimento para laptop y puerto de carga USB. Logo IOIO bordado.',
    79.99,
    35,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'merchandising'),
    'Enamel Pin Set',
    'Set de Pins Esmaltados',
    'Collection of 5 enamel pins featuring IOIO designs. Metal backing and rubber clutch.',
    'Colección de 5 pins esmaltados con diseños IOIO. Respaldo de metal y cierre de goma.',
    19.99,
    120,
    'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=500',
    '["https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=500"]'
),
(
    (SELECT id FROM categories WHERE slug = 'merchandising'),
    'Neon Poster Set',
    'Set de Pósters Neón',
    'Set of 3 A3 posters with cyberpunk artwork. High-quality print on matte paper.',
    'Set de 3 pósters A3 con arte cyberpunk. Impresión de alta calidad en papel mate.',
    24.99,
    90,
    'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500',
    '["https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500"]'
);

-- Insert banner images
INSERT INTO banners (title_en, title_es, image_url, link_url, display_order, is_active) VALUES
('New Collection 2024', 'Nueva Colección 2024', 'https://images.unsplash.com/photo-1558769132-cb1aea1f1f57?w=1200', '/products', 1, true),
('Cyberpunk Style', 'Estilo Cyberpunk', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200', '/products/clothes', 2, true),
('Limited Edition Merch', 'Merch Edición Limitada', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200', '/products/merchandising', 3, true);

-- Insert events
INSERT INTO events (title_en, title_es, description_en, description_es, event_date, location, image_url) VALUES
(
    'Cyberpunk Fashion Show 2024',
    'Desfile de Moda Cyberpunk 2024',
    'Join us for an exclusive showcase of our latest cyberpunk-inspired fashion collection. Experience the fusion of technology and style in a unique makerspace environment. Live music, interactive installations, and special discounts for attendees.',
    'Únete a nosotros para una exhibición exclusiva de nuestra última colección de moda inspirada en cyberpunk. Experimenta la fusión de tecnología y estilo en un ambiente único de makerspace. Música en vivo, instalaciones interactivas y descuentos especiales para asistentes.',
    '2024-03-15 19:00:00',
    'IOIO Makerspace, Downtown',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
),
(
    'Maker Workshop: LED Wearables',
    'Taller Maker: Wearables LED',
    'Learn how to create your own LED-enhanced clothing and accessories. This hands-on workshop covers basic electronics, programming, and textile integration. All materials provided. Limited spots available.',
    'Aprende a crear tu propia ropa y accesorios mejorados con LED. Este taller práctico cubre electrónica básica, programación e integración textil. Todos los materiales incluidos. Cupos limitados.',
    '2024-03-22 14:00:00',
    'IOIO Makerspace Lab',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
);

-- Insert experiments
INSERT INTO experiments (title_en, title_es, description_en, description_es, content_en, content_es, image_url) VALUES
(
    'Smart Fabric Integration',
    'Integración de Telas Inteligentes',
    'Exploring the integration of conductive threads and flexible circuits into everyday clothing.',
    'Explorando la integración de hilos conductores y circuitos flexibles en ropa cotidiana.',
    'Our latest experiment focuses on creating washable, comfortable smart fabrics that can integrate with mobile devices. We''ve successfully embedded flexible LED strips and touch-sensitive areas into various textile types. The goal is to make technology seamlessly blend with fashion without compromising comfort or durability. Current prototypes include jackets with built-in heating elements controlled via smartphone app, and t-shirts with customizable LED displays.',
    'Nuestro último experimento se centra en crear telas inteligentes lavables y cómodas que puedan integrarse con dispositivos móviles. Hemos integrado exitosamente tiras LED flexibles y áreas sensibles al tacto en varios tipos de textiles. El objetivo es hacer que la tecnología se mezcle perfectamente con la moda sin comprometer la comodidad o durabilidad. Los prototipos actuales incluyen chaquetas con elementos calefactores integrados controlados por app, y camisetas con pantallas LED personalizables.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
),
(
    'Sustainable Cyberpunk Materials',
    'Materiales Cyberpunk Sostenibles',
    'Developing eco-friendly materials that maintain the aesthetic and functionality of cyberpunk fashion.',
    'Desarrollando materiales ecológicos que mantienen la estética y funcionalidad de la moda cyberpunk.',
    'This ongoing experiment explores sustainable alternatives to traditional synthetic materials used in cyberpunk fashion. We''re testing recycled plastics, bio-based polymers, and organic fabrics treated with eco-friendly reflective coatings. Early results show promising durability and visual appeal. We''ve created prototypes of water-resistant jackets made from recycled ocean plastics and reflective accessories using plant-based materials. The challenge is maintaining the futuristic aesthetic while reducing environmental impact.',
    'Este experimento en curso explora alternativas sostenibles a los materiales sintéticos tradicionales usados en moda cyberpunk. Estamos probando plásticos reciclados, polímeros de base biológica y telas orgánicas tratadas con recubrimientos reflectantes ecológicos. Los resultados tempranos muestran durabilidad y atractivo visual prometedores. Hemos creado prototipos de chaquetas resistentes al agua hechas de plásticos oceánicos reciclados y accesorios reflectantes usando materiales de origen vegetal. El desafío es mantener la estética futurista mientras reducimos el impacto ambiental.',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800'
);

-- Insert company info
INSERT INTO company_info (about_en, about_es, contact_email, contact_phone, address, social_media) VALUES
(
    'IOIO is a cyberpunk-inspired fashion and makerspace brand that bridges the gap between technology and style. We create unique clothing and merchandise for makers, hackers, and urban explorers who want to express their passion for innovation through what they wear.',
    'IOIO es una marca de moda y makerspace inspirada en cyberpunk que une la tecnología y el estilo. Creamos ropa y merchandising únicos para makers, hackers y exploradores urbanos que quieren expresar su pasión por la innovación a través de lo que visten.',
    'contact@ioio.com',
    '+1 (555) 123-4567',
    '123 Maker Street, Tech District, Innovation City, 12345',
    '{"instagram": "@ioio_official", "twitter": "@ioio_tech", "facebook": "ioio.official", "github": "ioio-labs"}'
);
