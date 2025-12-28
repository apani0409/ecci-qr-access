# ECCI Control - Guía de Desarrollo

Documentación para desarrolladores que trabajen en el proyecto ECCI Control.

## 🏗️ Arquitectura del Proyecto

### Patrón MVC en Backend
- **Models**: Definen la estructura de datos (SQLAlchemy)
- **Views/Endpoints**: Definen las rutas y respuestas (FastAPI)
- **Controllers**: Lógica en Services

### Patrones Implementados
- **Repository Pattern**: `services/` contiene la lógica de negocio
- **Dependency Injection**: FastAPI `Depends()` para inyectar dependencias
- **JWT Bearer Token**: Autenticación stateless
- **Factory Pattern**: Creación de QR codes

## 📝 Guía de Código

### Agregar un nuevo endpoint

```python
# En app/api/endpoints/mi_endpoint.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/", response_model=list[ItemResponse])
async def get_items(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener items del usuario"""
    # Tu lógica aquí
    pass

# En app/main.py, agregar:
from app.api.endpoints import mi_endpoint
app.include_router(mi_endpoint.router)
```

### Crear un nuevo Pydantic Schema

```python
# En app/schemas/item.py

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class ItemCreate(BaseModel):
    name: str = Field(..., min_length=3)
    description: str

class ItemResponse(BaseModel):
    id: UUID
    name: str
    description: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Crear un Service

```python
# En app/services/item_service.py

from sqlalchemy.orm import Session
from app.models import Item
from fastapi import HTTPException, status

class ItemService:
    @staticmethod
    def create_item(db: Session, name: str, description: str) -> Item:
        item = Item(name=name, description=description)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    
    @staticmethod
    def get_item(db: Session, item_id: str) -> Item:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        return item
```

## 🗄️ Crear una Migración

```bash
# 1. Crear archivo de migración
alembic revision --autogenerate -m "Add: descripción"

# 2. Editar alembic/versions/xxx_descripcion.py
# 3. Aplicar migración
alembic upgrade head

# 4. Deshacer última migración
alembic downgrade -1
```

### Ejemplo de Migración Manual

```python
# alembic/versions/002_add_fields.py

def upgrade() -> None:
    op.add_column(
        'devices',
        sa.Column('status', sa.String(20), nullable=False, server_default='active')
    )

def downgrade() -> None:
    op.drop_column('devices', 'status')
```

## ⚛️ Componentes React

### Estructura de un Componente

```jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { myService } from '../services/my-service'

export const MyComponent = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await myService.getData()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      {error && <p>{error}</p>}
      {/* Tu contenido */}
    </div>
  )
}
```

### Usar Zustand Store

```javascript
// store.js
import { create } from 'zustand'

export const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))

// Component.jsx
const { count, increment } = useStore()
```

### Llamar a API con Axios

```javascript
// service.js
import api from './api'

export const myService = {
  getData: async () => {
    const response = await api.get('/items/')
    return response.data
  },

  createItem: async (itemData) => {
    const response = await api.post('/items/', itemData)
    return response.data
  },

  updateItem: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData)
    return response.data
  },

  deleteItem: async (id) => {
    await api.delete(`/items/${id}`)
  },
}
```

## 🧪 Testing

### Backend - Testing de Endpoints

```python
# test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register():
    response = client.post(
        "/auth/register",
        json={
            "email": "test@test.com",
            "password": "TestPass123!",
            "full_name": "Test User",
            "student_id": "2024001"
        }
    )
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_login():
    response = client.post(
        "/auth/login",
        json={
            "email": "test@test.com",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### Frontend - Testing de Componentes

```javascript
// LoginPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginPage } from '../pages/LoginPage'

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />)
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByText(/iniciar sesión/i))
    // Assertions...
  })
})
```

## 🔍 Debugging

### Backend

```python
# Logs básicos
import logging
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")

# Usar debugger
import pdb; pdb.set_trace()  # Pausar en este punto
```

### Frontend

```javascript
// Console logs
console.log(data)
console.error(error)
console.warn("Warning")

// Debugger
debugger  // Pausar en este punto

// React DevTools
// Instalar extensión en navegador
```

## 📦 Variables de Entorno

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=your-secret-key-very-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
```

## 🚀 CI/CD (GitHub Actions - Ejemplo)

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/
```

## 📊 Monitoreo en Producción

Considera agregar:
- Sentry para error tracking
- DataDog o similar para performance monitoring
- Prometheus para métricas
- ELK stack para logs

## 🔐 Seguridad

### Checklist Producción
- [ ] Cambiar SECRET_KEY a valor muy largo y aleatorio
- [ ] Configurar CORS con dominios específicos
- [ ] Usar HTTPS/SSL
- [ ] Configurar CSRF protection
- [ ] Rate limiting en endpoints públicos
- [ ] Validar y sanitizar todas las entradas
- [ ] Usar variables de entorno para credenciales
- [ ] Implementar logging de accesos
- [ ] Hacer backup regular de BD
- [ ] Usar gunicorn en producción (no uvicorn)

## 📚 Recursos Útiles

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [React Docs](https://react.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 💡 Tips

1. **Usar FastAPI docs**: http://localhost:8000/docs para testear endpoints
2. **Hot reload**: `--reload` en uvicorn permite desarrollo rápido
3. **Async/await**: Usar async en endpoints para mejor performance
4. **Type hints**: Siempre especificar tipos para mejor IDE support
5. **Validaciones**: Dejar que Pydantic valide, no duplicar validación

---

**Última actualización**: Enero 2024
