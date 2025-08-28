
# Todo App - Aplicativo de Gerenciamento de Tarefas


## 🚀 Funcionalidades

- ✅ **Criar Tarefas**: Adicione novas tarefas com título e descrição opcional
- 📋 **Listar Tarefas**: Visualize todas as suas tarefas em uma interface limpa
- ✏️ **Editar Tarefas**: Modifique o título e descrição de tarefas existentes
- ✅ **Marcar como Concluída**: Toggle de status de conclusão das tarefas
- 🗑️ **Excluir Tarefas**: Remova tarefas que não são mais necessárias
- 🔍 **Filtrar Tarefas**: Filtre por todas, pendentes ou concluídas
- 📊 **Estatísticas**: Veja contadores de total, pendentes e concluídas
- 💾 **Persistência Local**: As tarefas são salvas no localStorage do navegador
- 📱 **Design Responsivo**: Interface adaptada para desktop e mobile
- ♿ **Acessibilidade**: Suporte a leitores de tela e navegação por teclado

## 🛠️ Tecnologias Utilizadas

- **Angular 19** - Framework principal
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa
- **CSS3** - Estilização e responsividade
- **Server-Side Rendering (SSR)** - Para melhor performance
- **Hot Module Replacement (HMR)** - Desenvolvimento otimizado

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior recomendada)
- npm ou yarn

### Passos para executar

1. **Clone o repositório** (se aplicável)
   ```bash
   git clone <url-do-repositorio>
   cd todo-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento**
   ```bash
   npm start
   # ou
   ng serve
   ```

4. **Acesse o aplicativo**
   Abra o navegador e vá para `http://localhost:4200`

## 🏗️ Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm test` - Executa os testes unitários
- `npm run e2e` - Executa os testes end-to-end

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── task-form/     # Formulário para criar/editar tarefas
│   │   ├── task-item/     # Item individual de tarefa
│   │   └── task-list/     # Lista de tarefas com filtros
│   ├── models/
│   │   └── task.model.ts  # Interface da tarefa
│   ├── services/
│   │   └── task.service.ts # Serviço de gerenciamento de tarefas
│   └── app.component.*    # Componente principal
└── styles.css            # Estilos globais
```

## 🎯 Como Usar

1. **Adicionar uma Tarefa**:
   - Digite o título da tarefa (obrigatório)
   - Adicione uma descrição opcional
   - Clique em "Adicionar Tarefa"

2. **Editar uma Tarefa**:
   - Clique no botão ✏️ ao lado da tarefa
   - Modifique o título e/ou descrição
   - Clique em "Atualizar Tarefa"

3. **Marcar como Concluída**:
   - Clique na checkbox ao lado da tarefa

4. **Filtrar Tarefas**:
   - Use os botões "Todas", "Pendentes" ou "Concluídas"

5. **Excluir uma Tarefa**:
   - Clique no botão 🗑️ ao lado da tarefa
   - Confirme a exclusão




**Desenvolvido com ❤️ usando Angular**


