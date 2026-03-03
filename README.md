# 🎨 Gallery - Galeria Moderna com Supabase

Uma galeria de imagens moderna e responsiva que obtém dados diretamente do Supabase. Design limpo, animações suaves e uma experiência de utilizador excepcional.

## 🚀 Características

- ✨ **Design Moderno** - Interface limpa com tema escuro elegante
- 📱 **Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- 🖼️ **Grid Dinâmico** - Layout adaptativo que se ajusta ao tamanho da tela
- 🔍 **Modal Completo** - Visualize imagens em tamanho grande com informações
- 🎯 **Integração Supabase** - Obtenha dados em tempo real do seu banco de dados
- 🎬 **Animações** - Transições suaves e efeitos hover elegantes
- 🔒 **Seguro** - Proteção contra XSS com desinfecção de dados
- 📂 **Bem Organizado** - Estrutura clara de ficheiros (HTML, CSS, JS, API)

## 📁 Estrutura do Projeto

```
gallery_2/
├── index.html                 # Arquivo HTML principal
├── css/
│   ├── style.css             # Estilos globais e layout
│   └── gallery.css           # Estilos específicos da galeria
├── js/
│   ├── config.js             # Configuração do Supabase
│   ├── main.js               # Script principal e funções utilitárias
│   └── gallery.js            # Classe de gestão da galeria
├── api/
│   └── supabase.js           # Classe de integração com Supabase API
├── assets/                   # Pasta para recursos (imagens, etc)
└── README.md                 # Este ficheiro
```

## 🛠️ Setup Inicial

### 1. Crie uma conta no Supabase

- Aceda a [https://supabase.com](https://supabase.com)
- Crie uma conta
- Crie um novo projeto

### 2. Configure o Banco de Dados

Execute a seguinte query SQL no editor SQL do Supabase:

```sql
-- Criar tabela de imagens (se ainda não existir)
CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_fotos_tipo ON fotos(tipo);
CREATE INDEX idx_fotos_created_at ON fotos(created_at);

-- Ativar Row Level Security (opcional)
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

-- Criar política para leitura pública
CREATE POLICY "Enable read access for all users"
  ON fotos
  FOR SELECT
  USING (true);
```

### 3. Adicione dados de exemplo

```sql
INSERT INTO fotos (tipo, imagem_url) VALUES
('Natureza', 'https://images.unsplash.com/photo-1495567720989-cebfadad6d75?w=800'),
('Paisagem', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),
('Natureza', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'),
('Urbano', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800'),
('Natureza', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800'),
('Paisagem', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800');
```

### 4. Obtém suas credenciais

1. Vá para **Settings** > **API** no dashboard do Supabase
2. Copie:
   - **URL do Projeto** (`Project URL`)
   - **Chave Pública** (`anon key`)

### 5. Configure o ficheiro config.js

Abra `js/config.js` e preencha:

```javascript
const SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co", // Substitua com a sua URL
  key: "sua-chave-publica-aqui", // Substitua com a sua chave
  table: "gallery_images",
  storageBucket: "gallery_images",
  pageSize: 12,
};
```

### 6. Inicie o projeto

Abra `index.html` no seu navegador:

- Clique com o botão direito em `index.html`
- Selecione "Open with Live Server" (se tiver a extensão Live Server)
- Ou simplesmente abra o ficheiro diretamente no navegador

## 📖 Como Usar

### Funcionalidades Básicas

1. **Ver Galeria** - As imagens serão carregadas automaticamente
2. **Clicar em Imagem** - Abre modal com visualização completa
3. **Fechar Modal** - Clique no X, fora da imagem ou pressione ESC
4. **Atalhos de Teclado**:
   - `Ctrl + R` - Recarregar imagens
   - `Ctrl + F` - Pesquisar na galeria
   - `ESC` - Fechar modal

### Funções de Console

No console do navegador (F12), pode usar:

```javascript
// Recarregar imagens
reloadGallery();

// Filtrar por categoria
filterGallery("Natureza");

// Pesquisar
searchGallery("pôr do sol");

// Obter total de imagens
getTotalImages();

// Obter categorias disponíveis
getAvailableCategories();

// Exportar dados em JSON
exportGalleryData();

// Ver informações de debug
debugInfo();

// Validar configuração do Supabase
validateSupabaseConfig();
```

## 📝 Estrutura de Dados (Tabela)

| Campo        | Tipo      | Descrição                |
| ------------ | --------- | ------------------------ |
| `id`         | UUID      | Identificador único      |
| `tipo`       | TEXT      | Tipo/Categoria da imagem |
| `imagem_url` | TEXT      | URL da imagem            |
| `created_at` | TIMESTAMP | Data de criação          |

## 🎨 Customizações

### Mudar Cores

Edite as variáveis CSS em `css/style.css`:

```css
:root {
  --primary-color: #6366f1; /* Azul índigo */
  --secondary-color: #8b5cf6; /* Roxo */
  --accent-color: #ec4899; /* Rosa */
  --dark-bg: #0f172a; /* Fundo escuro */
  /* ... mais cores ... */
}
```

### Mudar Layout da Grid

Em `css/gallery.css`:

```css
.gallery-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  /* 280px: tamanho mínimo dos cards */
  /* auto-fill: preenchimento automático */
  gap: 2rem; /* Espaçamento entre items */
}
```

### Adicionar Novos Campos

1. Modifique a tabela no Supabase
2. Atualize `createGalleryItem()` em `gallery.js`

## 🚀 Deploy

### GitHub Pages

1. Faça push dos ficheiros para um repositório GitHub
2. Vá para Settings > Pages
3. Selecione a branch principal

### Netlify

1. Faça deploy arrastando a pasta do projeto
2. Ou conecte seu repositório GitHub
3. Defina como pasta de publicação: raiz do projeto

### Seu próprio servidor

Copie todos os ficheiros para seu servidor web.

## 🔐 Segurança

- **Dados Validados**: Todos os dados do Supabase são desinfectados contra XSS
- **URLs Verificadas**: Apenas URLs HTTP/HTTPS válidas são aceites
- **Row Level Security** (RLS): Configure no Supabase para maior segurança

## 🐛 Troubleshooting

### Imagens não carregam

- [ ] Verifique a URL do Supabase em `config.js`
- [ ] Verifique a chave API em `config.js`
- [ ] Verifique se as URLs das imagens são válidas
- [ ] Abra console (F12) para ver erros

### Erro de CORS

- [ ] Configure CORS nas definições do Supabase
- [ ] Certifique-se de que está a usar a chave pública (anon)

### Dados não atualizam

- [ ] Recarregue a página com F5
- [ ] Use `reloadGallery()` no console
- [ ] Verifique se há dados na tabela

## 📚 Documentação Útil

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 💡 Ideias de Extensão

- ✅ Adicionar sistema de comentários
- ✅ Implementar likes/favoritos
- ✅ Upload de imagens do cliente
- ✅ Autenticação de utilizadores
- ✅ Filtros avançados
- ✅ Paginação
- ✅ Modo claro/escuro
- ✅ Integração com redes sociais

## 📄 Licença

Este projeto é código aberto e livre para usar e modificar.

## 👨‍💻 Autor

Criado com ❤️ para amantes de galerrias e desenvolvimento web.

---

**Dúvidas?** Abra o console (F12) e use `debugInfo()` para ver informações de debug.

**Bom uso! 🚀**
