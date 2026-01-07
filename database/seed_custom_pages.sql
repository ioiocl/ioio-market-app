-- Seed data for custom pages (Servicios and Actividades)

-- Insert Servicios page
INSERT INTO custom_pages (slug, title_en, title_es, content_en, content_es, is_active)
VALUES (
  'servicios',
  'Services',
  'Servicios',
  '<h2>Our Services</h2>
<p>Welcome to our services page. Here you can find information about all the services we offer.</p>
<ul>
  <li>Service 1: Description of service 1</li>
  <li>Service 2: Description of service 2</li>
  <li>Service 3: Description of service 3</li>
</ul>
<p>Contact us for more information about our services.</p>',
  '<h2>Nuestros Servicios</h2>
<p>Bienvenido a nuestra página de servicios. Aquí puedes encontrar información sobre todos los servicios que ofrecemos.</p>
<ul>
  <li>Servicio 1: Descripción del servicio 1</li>
  <li>Servicio 2: Descripción del servicio 2</li>
  <li>Servicio 3: Descripción del servicio 3</li>
</ul>
<p>Contáctanos para más información sobre nuestros servicios.</p>',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Actividades page
INSERT INTO custom_pages (slug, title_en, title_es, content_en, content_es, is_active)
VALUES (
  'actividades',
  'Activities',
  'Actividades',
  '<h2>Our Activities</h2>
<p>Discover all the activities we organize throughout the year.</p>
<h3>Upcoming Activities</h3>
<ul>
  <li>Activity 1: Date and description</li>
  <li>Activity 2: Date and description</li>
  <li>Activity 3: Date and description</li>
</ul>
<p>Stay tuned for more updates on our activities!</p>',
  '<h2>Nuestras Actividades</h2>
<p>Descubre todas las actividades que organizamos durante el año.</p>
<h3>Próximas Actividades</h3>
<ul>
  <li>Actividad 1: Fecha y descripción</li>
  <li>Actividad 2: Fecha y descripción</li>
  <li>Actividad 3: Fecha y descripción</li>
</ul>
<p>¡Mantente atento para más actualizaciones sobre nuestras actividades!</p>',
  true
)
ON CONFLICT (slug) DO NOTHING;
