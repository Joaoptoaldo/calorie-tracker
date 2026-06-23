# Tarefas: Configuração da Estrutura do Projeto

## Etapa 1 — Estrutura Inicial
- [x] Criar arquivo `backend/requirements.txt`
- [x] Criar arquivo `backend/models.py` (modelos iniciais)
- [x] Criar arquivo `backend/app.py` (Flask + CORS + SQLite)
- [x] Criar pasta `backend/instance/`
- [x] Inicializar projeto Vite com template React + TypeScript

## Etapa 2 — Modelo Unificado e Rotas REST
- [x] Substituir modelos separados pelo modelo unificado `Log` (id, user_id, description, category, calories, date)
- [x] `POST /api/log` — criar entrada de log com validação de campos
- [x] `GET /api/logs` — listar entradas com filtros opcionais `?category=` e `?date=`
- [x] `GET /api/summary` — retornar saldo de calorias (food_calories, workout_calories, net_balance)
- [x] CORS restrito à origem `http://localhost:5173`
