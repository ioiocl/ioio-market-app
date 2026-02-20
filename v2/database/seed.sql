-- IOIO V2 Seed Data

-- Insert default slider images
INSERT INTO slider (title, description, image_url, cta_text, cta_url, display_order) VALUES
('Bienvenido a IOIO', 'Espacio de trabajo colaborativo donde la creatividad y la productividad se encuentran', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', 'Conocer Más', '#events', 1),
('Eventos Únicos', 'Participa en nuestros eventos exclusivos y conecta con profesionales de tu industria', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200', 'Ver Eventos', '#events', 2),
('Tienda IOIO', 'Descubre productos exclusivos para potenciar tu espacio de trabajo', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', 'Ir a Tienda', '#shop', 3);

-- Insert default events
INSERT INTO events (title, description, image_url, date, location) VALUES
('Networking Tech 2026', 'Conecta con líderes de la industria tecnológica en un ambiente colaborativo', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', '2026-03-15 18:00:00', 'IOIO Santiago Centro'),
('Workshop de Diseño UX', 'Aprende las últimas tendencias en diseño de experiencia de usuario', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', '2026-03-22 15:00:00', 'IOIO Providencia'),
('Pitch Night Startups', 'Presenta tu startup ante inversores y mentores experimentados', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', '2026-04-05 19:00:00', 'IOIO Las Condes');

-- Insert default activities
INSERT INTO activities (title, description, image_url, duration) VALUES
('Yoga Matutino', 'Comienza tu día con energía positiva y claridad mental', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', '1 hora'),
('Sesiones de Coworking', 'Trabaja en un ambiente inspirador rodeado de profesionales motivados', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', '4 horas'),
('Café y Networking', 'Conversaciones informales que pueden convertirse en grandes oportunidades', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', '30 minutos');

-- Insert default products
INSERT INTO products (name, description, image_url, price, sku, quantity) VALUES
('Membresía Mensual', 'Acceso completo a todos los espacios de coworking durante un mes', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', 150000, 'MEM-MONTH-001', 50),
('Sala de Reuniones (4h)', 'Reserva de sala de reuniones equipada para 8 personas', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600', 45000, 'ROOM-4H-001', 20),
('Taza IOIO Edición Limitada', 'Taza de cerámica premium con diseño exclusivo IOIO', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', 12000, 'MUG-IOIO-001', 100);
