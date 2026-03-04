# ⚡ Setup Rápido - Galeria de Fotos

## 🚨 Se as fotos NÃO estão a carregar:

**É porque `js/config.js` não foi preenchido com as credenciais do Supabase!**

---

## 📋 Passos (5 minutos):

### 1️⃣ Aceda a Supabase

- Abra https://supabase.com
- Faça login ou crie conta
- Clique "New Project"

### 2️⃣ Crie um Projeto

- Nome: `gallery` (ou à sua escolha)
- Database password: qualquer senha
- Region: eu-west-1 (ou perto de si)
- Clique "Create new project" (espere 2-3 minutos)

### 3️⃣ Crie a Tabela de Fotos

- Vá para "SQL Editor" (lado esquerdo)
- Cole isto e clique "Run":

```sql
CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO fotos (tipo, imagem_url) VALUES
('Natureza', 'https://images.unsplash.com/photo-1495567720989-cebfadad6d75?w=400'),
('Paisagem', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'),
('Urbano', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400');
```

### 4️⃣ Copie as Credenciais

Supabase > Settings (engrenagem) > API

Copie:

- **Project URL** → `url` em config.js
- **anon key** → `key` em config.js

### 5️⃣ Configure o Ficheiro

Edite `gallery_2/js/config.js`:

> **Nota**: o código inclui um conjunto de imagens de exemplo que serão exibidas se a
> configuração do Supabase estiver ausente ou inválida. Isto evita que a página fique em
> branco mesmo quando você abrir `index.html` localmente. Continue e cole as credenciais
> corretas para carregar dados reais.

```javascript
const SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co", // ← Cole a URL daqui
  key: "eyJhbGciOiJIUzI1NiI...", // ← Cole a chave aqui
  table: "fotos",
  storageBucket: "fotos",
  pageSize: 20,
};
```

### 6️⃣ Teste Localmente

> **ATENÇÃO:** abra o ficheiro usando um servidor HTTP. Navegadores podem bloquear
> scripts e chamadas de rede quando a página é aberta via `file://`, o que faz com que
> `config.js` não seja executado e a galeria apareça vazia.

```bash
# Na pasta do projeto você pode usar um servidor rápido (precisa do Node ou Python):
# com Node.js:
#   npx http-server .          # ou npx serve .
# com Python (se estiver instalado):
#   python -m http.server 8000

# Depois abra no browser:
#   http://localhost:8000
```

Se vir as 3 fotos → ✅ Funcionando!

---

## ❌ Ainda não funciona?

Abra DevTools (F12) > Console e veja:

### Erro: "Configuracao incompleta"

→ Ainda tem placeholders em `js/config.js`
→ Substitua a URL e chave

### Erro: "URL invalida"

→ URL copiada incorrectamente
→ Deve começar com `https://` e terminar com `.supabase.co`

### Erro: "401 Unauthorized"

→ Chave inválida ou expirada
→ Copie novamente de Settings > API

### Erro: "CORS" ou "ERR_FAILED"

→ URL do Supabase incorrecta
→ Verifique em Supabase Dashboard

---

## 📱 Publicar no GitHub Pages

Depois de testar localmente:

```bash
git add .
git commit -m "Add Supabase credentials"
git push origin main
```

(O `config.js` está em `.gitignore` → seguro, não será público)

---

## 💡 Dicas

- **Ver logs**: F12 (DevTools) > Console
- **Adicionar mais fotos**: SQL Editor > INSERT INTO fotos
- **Alterar tabela**: Vá para Tables (lado esquerdo)
- **Row Level Security**: Recomendado para produção (ver SECURITY.md)

---

## 🎯 Resumo dos Ficheiros Importantes

```
gallery_2/
├── js/config.js          ← EDITE AQUI COM CREDENCIAIS
├── js/config.example.js  ← Template de referência
├── SETUP_RAPIDO.md       ← Este ficheiro
├── SECURITY.md           ← Para produção/GitHub Pages
└── ...
```

---

**Dúvidas? Verifique o Console do browser (F12)!** 🔍
