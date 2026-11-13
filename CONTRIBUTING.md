# Guía de Contribución

¡Gracias por tu interés en contribuir a ECCI Control! Este documento proporciona lineamientos para contribuir al proyecto.

## Cómo Empezar

### 1. Fork y Clonación

```bash
# Fork el repositorio en GitHub

# Clonar tu fork
git clone https://github.com/TU-USUARIO/ecci-control.git
cd ecci-control

# Agregar upstream
git remote add upstream https://github.com/AUTOR-ORIGINAL/ecci-control.git
```

### 2. Configurar Entorno de Desarrollo

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -e .

# Frontend
cd frontend
npm install

# Mobile (opcional)
cd mobile2
npm install
```

## Flujo de Trabajo con Git

### Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama feature/bugfix
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

### Commits

Usa mensajes de commit descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar endpoint para exportar reportes
fix: corregir validación de email duplicado
docs: actualizar documentación de API
test: agregar tests para DeviceService
refactor: optimizar queries de acceso
style: formatear código con black
chore: actualizar dependencias
```

### Push y Pull Request

```bash
# Hacer push de tu rama
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# - Descripción clara del cambio
# - Referencias a issues relacionados
# - Screenshots si aplica
```

## Estándares de Código

### Backend (Python)

```bash
# Formatear código
black app/

# Linting
flake8 app/

# Type checking
mypy app/

# Tests antes de commit
pytest --cov=app
```

**Convenciones:**
- Seguir PEP 8
- Type hints en todas las funciones
- Docstrings en clases y funciones públicas
- Nombres descriptivos en inglés
- Máximo 100 caracteres por línea

### Frontend (JavaScript/React)

```bash
# Linting
npm run lint

# Formatear
npm run format
```

**Convenciones:**
- Componentes funcionales con hooks
- Nombres de componentes en PascalCase
- Variables/funciones en camelCase
- PropTypes o TypeScript para validación
- CSS modules o Tailwind classes

## Testing

### Requisitos de Testing

- **Nuevas features**: Deben incluir tests
- **Bug fixes**: Agregar test que reproduzca el bug
- **Cobertura mínima**: 80% para nuevas funciones
- **Tests deben pasar**: Antes de hacer PR

### Escribir Tests

```python
# backend/tests/test_nueva_feature.py
def test_nueva_funcionalidad(client, authenticated_client):
    """Descripción clara de qué se está probando"""
    # Arrange
    data = {"campo": "valor"}

    # Act
    response = authenticated_client.post("/api/endpoint", json=data)

    # Assert
    assert response.status_code == 200
    assert response.json()["campo"] == "valor"
```

## Documentación

### Actualizar Documentación

Cuando agregues/modifiques features:

1. **README.md**: Actualizar si cambia instalación o uso
2. **API Docs**: Agregar docstrings a endpoints
3. **CHANGELOG.md**: Documentar cambios
4. **Comentarios**: Código complejo debe tener comentarios

### Docstrings

```python
def crear_dispositivo(db: Session, user_id: UUID, data: DeviceCreate) -> Device:
    """
    Crea un nuevo dispositivo con código QR único.

    Args:
        db: Sesión de base de datos SQLAlchemy
        user_id: ID del usuario propietario
        data: Datos del dispositivo a crear

    Returns:
        Device: Instancia del dispositivo creado con QR

    Raises:
        ConflictException: Si el serial_number ya existe
        ValidationException: Si los datos son inválidos
    """
    pass
```

## Code Review

### Checklist antes de PR

- [ ] Código sigue los estándares del proyecto
- [ ] Tests agregados y pasando
- [ ] Documentación actualizada
- [ ] Sin conflictos con main
- [ ] Commits son claros y descriptivos
- [ ] Variables de entorno documentadas
- [ ] No hay secretos o credenciales en el código

### Proceso de Review

1. Mantainer revisa el PR
2. Puede solicitar cambios
3. Implementar feedback
4. Una vez aprobado, se hace merge

## Reportar Bugs

### Template de Issue

```markdown
## Descripción del Bug
[Descripción clara y concisa]

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué está pasando]

## Screenshots
[Si aplica]

## Entorno
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Versión: [1.0.0]

## Logs
```
[Pegar logs relevantes]
```
```

## Sugerir Features

### Template de Feature Request

```markdown
## Feature Propuesta
[Descripción clara de la funcionalidad]

## Problema que Resuelve
[Por qué es necesario]

## Solución Propuesta
[Cómo implementarla]

## Alternativas Consideradas
[Otras formas de resolver el problema]

## Contexto Adicional
[Screenshots, mockups, referencias]
```

## Pull Request Template

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Código formateado
- [ ] Commits siguiendo convenciones
- [ ] Sin warnings de linting

## Tests
[Cómo se probó]

## Screenshots
[Si aplica]

## Issues Relacionados
Closes #123
```

## Áreas para Contribuir

### Backend
- Agregar tests adicionales
- Optimizar queries de base de datos
- Implementar cache (Redis)
- Agregar rate limiting
- Mejorar logging y monitoring

### Frontend
- Mejorar UX/UI
- Agregar modo oscuro
- Implementar PWA
- Optimizar performance
- Agregar más validaciones

### Mobile
- Optimizar rendimiento
- Agregar notificaciones push
- Mejorar UX de escaneo QR
- Soporte offline

### Documentación
- Tutoriales
- Videos explicativos
- Diagramas de arquitectura
- Ejemplos de uso avanzado

### DevOps
- CI/CD pipelines
- Scripts de deployment
- Monitoring y alertas
- Kubernetes configs

## Contacto

¿Preguntas sobre contribuciones?

- **Issues**: Para bugs y features
- **Discussions**: Para preguntas generales
- **Email**: [tu-email@ejemplo.com]

---

## Reconocimiento

Todos los contribuidores serán reconocidos en el README.md

---

¡Gracias por contribuir a ECCI Control!
