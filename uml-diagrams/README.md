# Diagramas UML - Sistema IOIO E-Commerce

Este directorio contiene los diagramas UML que representan la arquitectura y funcionalidades del sistema IOIO.

## 📋 Lista de Diagramas

### 1. **Diagrama de Clases - Backend** (`01-class-diagram-backend.puml`)
Muestra la estructura de clases del backend siguiendo la arquitectura hexagonal:
- **Domain Layer**: Entidades (Order, Product, User, Cart) y Ports (Interfaces)
- **Application Layer**: Use Cases (CreateOrderUseCase, GetOrdersUseCase, etc.)
- **Infrastructure Layer**: Adapters (PostgreSQL Repositories), Controllers, Services, Middlewares

### 2. **Diagrama de Componentes - Frontend** (`02-component-diagram-frontend.puml`)
Representa la organización de componentes del frontend React:
- Pages (Home, Products, Cart, Checkout, Admin, etc.)
- Components reutilizables (Header, Footer, HtmlContent, RichTextEditor)
- Services (API Layer)
- HTTP Client (Axios con interceptores)
- State Management (Zustand)
- Routing (React Router)
- Internacionalización (i18next)

### 3. **Diagrama de Secuencia - Proceso de Compra** (`03-sequence-diagram-checkout.puml`)
Flujo completo del proceso de compra:
- Ver carrito
- Checkout
- Validación de stock
- Creación de orden (transaccional)
- Procesamiento de pago (MercadoPago/Crypto)
- Actualización de estado

### 4. **Diagrama de Casos de Uso** (`04-use-case-diagram.puml`)
Funcionalidades del sistema organizadas por actor:
- **Usuario Anónimo**: Ver productos, registrarse, ver contenido
- **Usuario Registrado**: Carrito, checkout, historial de órdenes
- **Administrador**: Gestión completa de productos, órdenes, contenido

### 5. **Diagrama de Estados - Orden** (`05-state-diagram-order.puml`)
Ciclo de vida de una orden:
- Estados: Pending → Processing → Approved → Shipped → Delivered
- Estados finales: Cancelled, Rejected
- Transiciones automáticas y manuales

### 6. **Diagrama de Arquitectura General** (`06-architecture-diagram.puml`)
Vista general del sistema:
- Frontend Layer (React SPA)
- Backend Layer (Node.js/Express con arquitectura hexagonal)
- Database Layer (PostgreSQL)
- External Services (MercadoPago, Bitcoin, Ethereum)

### 7. **Diagrama de Despliegue** (`07-deployment-diagram.puml`)
Infraestructura y deployment:
- Cliente (Browser con React)
- Servidor Web (Nginx)
- Servidor de Aplicación (Node.js/Express)
- Servidor de Base de Datos (PostgreSQL)
- Servicios externos (MercadoPago, Blockchain)
- Infrastructure as Code (Terraform)

### 8. **Diagrama de Actividad - Admin Orders** (`08-activity-diagram-admin-order.puml`)
Flujo de actividades para gestión de órdenes por administrador:
- Cargar lista de órdenes
- Revisar órdenes pendientes
- Aprobar/Rechazar órdenes
- Actualización de estado

## 🛠️ Cómo Visualizar los Diagramas

### Opción 1: PlantUML Online
1. Visita [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copia y pega el contenido de cualquier archivo `.puml`
3. El diagrama se generará automáticamente

### Opción 2: VS Code Extension
1. Instala la extensión "PlantUML" en VS Code
2. Abre cualquier archivo `.puml`
3. Presiona `Alt+D` para previsualizar el diagrama

### Opción 3: PlantUML Desktop
1. Descarga [PlantUML JAR](https://plantuml.com/download)
2. Ejecuta: `java -jar plantuml.jar archivo.puml`
3. Se generará una imagen PNG/SVG

### Opción 4: IntelliJ IDEA / PyCharm
1. Instala el plugin "PlantUML integration"
2. Abre cualquier archivo `.puml`
3. El preview se mostrará automáticamente

## 📦 Dependencias

Para generar los diagramas necesitas:
- **Java 8+** (para PlantUML)
- **Graphviz** (opcional, para diagramas más complejos)

### Instalación en Windows:
```powershell
# Instalar Graphviz con Chocolatey
choco install graphviz

# O descargar desde: https://graphviz.org/download/
```

### Instalación en Linux:
```bash
sudo apt-get install graphviz
```

### Instalación en macOS:
```bash
brew install graphviz
```

## 🎨 Convenciones de Color

Los diagramas usan colores para diferenciar capas/componentes:

- **#E1F5FE** (Azul claro): Entidades del dominio
- **#FFF9C4** (Amarillo): Use Cases / Pages
- **#F3E5F5** (Púrpura): Repositories / Adapters
- **#E8F5E9** (Verde): Controllers / Database
- **#FFE0B2** (Naranja): Services
- **#B3E5FC** (Azul): Components
- **#C8E6C9** (Verde claro): Services API
- **#F8BBD0** (Rosa): State Management

## 📚 Patrones de Diseño Representados

Los diagramas ilustran los siguientes patrones:

### Creacionales:
- Factory Pattern
- Dependency Injection
- Singleton Pattern

### Estructurales:
- Repository Pattern
- Adapter Pattern
- Module Pattern
- Layered Architecture (Hexagonal)
- Proxy Pattern

### Comportamiento:
- Strategy Pattern
- Use Case Pattern (Command)
- Middleware Pattern (Chain of Responsibility)
- Observer Pattern
- Template Method Pattern
- Interceptor Pattern
- State Pattern

## 🔗 Referencias

- [PlantUML Documentation](https://plantuml.com/)
- [UML Diagrams Guide](https://www.uml-diagrams.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

## 📝 Notas

- Los diagramas están sincronizados con el código actual del proyecto
- Última actualización: Enero 2026
- Para sugerencias o correcciones, contactar al equipo de desarrollo

---

**Proyecto**: IOIO E-Commerce Platform  
**Arquitectura**: Hexagonal (Backend) + Component-based (Frontend)  
**Stack**: Node.js, Express, PostgreSQL, React, Zustand, TailwindCSS
