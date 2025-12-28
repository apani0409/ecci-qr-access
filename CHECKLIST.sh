#!/bin/bash
# ECCI Control - Checklist de Instalación y Configuración

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        ECCI CONTROL - CHECKLIST DE CONFIGURACIÓN             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Array para tracking
declare -a TASKS
declare -a STATUS

# Función para agregar tarea
add_task() {
    TASKS+=("$1")
    STATUS+=(0)  # 0 = No completado
}

# Función para marcar como completado
complete_task() {
    local index=$1
    STATUS[$index]=1
}

# Función para mostrar estado
show_status() {
    local total=${#TASKS[@]}
    local completed=0
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TAREAS DE CONFIGURACIÓN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for i in "${!TASKS[@]}"; do
        if [ ${STATUS[$i]} -eq 1 ]; then
            echo "✅ ${TASKS[$i]}"
            ((completed++))
        else
            echo "⭕ ${TASKS[$i]}"
        fi
    done
    
    echo ""
    echo "Progreso: $completed/$total"
    echo ""
}

# Definir tareas
add_task "Instalar PostgreSQL"
add_task "Crear base de datos 'ecci_control'"
add_task "Clonar/descargar proyecto"
add_task "Crear entorno virtual (Python)"
add_task "Instalar dependencias backend"
add_task "Configurar .env (backend)"
add_task "Ejecutar migraciones Alembic"
add_task "Inicializar datos de prueba"
add_task "Instalar dependencias frontend"
add_task "Configurar .env.local (frontend)"
add_task "Verificar estructura del proyecto"
add_task "Iniciar backend"
add_task "Iniciar frontend"
add_task "Acceder a http://localhost:3000"
add_task "Probar con credenciales demo"

echo "TAREAS RECOMENDADAS PARA COMPLETAR:"
echo ""

# Mostrar lista interactiva
PS3="Selecciona el número de la tarea completada (0 para salir): "
while true; do
    show_status
    read -p "¿Qué tareas has completado? (ej: 1 2 3 o 0 para salir): " input
    
    if [ "$input" == "0" ]; then
        break
    fi
    
    # Procesar números ingresados
    for num in $input; do
        if [ "$num" -gt 0 ] && [ "$num" -le ${#TASKS[@]} ]; then
            complete_task $((num - 1))
        fi
    done
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    CHECKLIST FINAL                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Resumen final
completed=0
for status in "${STATUS[@]}"; do
    if [ $status -eq 1 ]; then
        ((completed++))
    fi
done

total=${#TASKS[@]}
percentage=$((completed * 100 / total))

echo "TAREAS COMPLETADAS: $completed/$total ($percentage%)"
echo ""

if [ $completed -eq $total ]; then
    echo "🎉 ¡LISTO PARA USAR!"
    echo ""
    echo "Tu sistema ECCI Control está completamente configurado."
    echo ""
    echo "Accesos:"
    echo "  • API:      http://localhost:8000"
    echo "  • Docs:     http://localhost:8000/docs"
    echo "  • Frontend: http://localhost:3000"
    echo ""
    echo "Credenciales demo:"
    echo "  • Email:    juan@university.edu"
    echo "  • Password: SecurePassword123!"
else
    echo "⏳ TAREAS PENDIENTES: $((total - completed))"
    echo ""
    echo "Por favor completa todas las tareas antes de usar el sistema."
fi

echo ""
