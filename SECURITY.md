# 🔒 Guia de Segurança - Publicação no GitHub Pages

## ✅ Melhorias de Segurança Implementadas

### 1. **Credenciais Removidas do Código**

- ✔️ `.gitignore` criado para excluir `js/config.js`
- ✔️ `js/config.example.js` como template
- ✔️ Hardcoded credentials removidas de `api/supabase.js`

### 2. **Content Security Policy (CSP)**

- ✔️ Headers CSP adicionados via `<meta>` tag
- ✔️ Proteção contra injeção XSS
- ✔️ Scripts limitados a fontes confiáveis

### 3. **Subresource Integrity (SRI)**

- ✔️ CDN do Supabase com hash de integridade
- ✔️ Protege contra corrupção de dependências

### 4. **Autenticação com Supabase Auth**

- ✔️ Classe `AuthManager` implementada
- ✔️ Operações sensíveis requerem login
- ✔️ Token JWT armazenado de forma segura

### 5. **Validação de Entrada**

- ✔️ IPv de imagens validado em `validateImageData()`
- ✔️ IDs sanitizados com `encodeURIComponent()`
- ✔️ Limite de tamanho impostos (100 caracteres para tipo)

### 6. **Sem Inline JavaScript**

- ✔️ Onclick removido, replaced com event listeners
- ✔️ Compatível com CSP policy

### 7. **Row-Level Security (RLS)**

- ✔️ Instruções SQL incluídas em `js/config.example.js`
- ✔️ Políticas de acesso por utilizador
- ✔️ Apenas proprietários podem editar/deletar

---

## 📋 Passos para Publicar de Forma Segura

### Estágio 1: Preparação Local

**1. Clone ou faça fork do repositório**

```bash
git clone https://github.com/seu-usuario/gallery_2.git
cd gallery_2
```

**2. Configure Supabase**

- Aceda a https://supabase.com
- Crie um novo projeto
- Vá para Settings > API
- Copie a URL do projeto e a "anon key"

**3. Crie o ficheiro de configuração**

```bash
cp js/config.example.js js/config.js
```

**4. Edite `js/config.js` com as credenciais**

```javascript
const SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co",
  key: "sua-chave-publica-aqui",
  table: "fotos",
  storageBucket: "fotos",
  pageSize: 20,
};
```

**5. Verifique que `.gitignore` exclui `js/config.js`**

```bash
cat .gitignore | grep "js/config.js"
```

### Estágio 2: Configurar Supabase de Forma Segura

**1. Ativar Row Level Security (RLS)**

No Supabase SQL Editor, execute:

```sql
-- Criar tabela de imagens com owner
CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_fotos_tipo ON fotos(tipo);
CREATE INDEX idx_fotos_created_at ON fotos(created_at);
CREATE INDEX idx_fotos_owner_id ON fotos(owner_id);

-- Ativar RLS
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos podem ler (leitura pública)
CREATE POLICY "Enable read access for all users"
  ON fotos
  FOR SELECT
  USING (true);

-- Política 2: Apenas utilizadores autenticados podem inserir
CREATE POLICY "Enable insert for authenticated users"
  ON fotos
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Política 3: Apenas proprietários podem atualizar
CREATE POLICY "Enable update for owner"
  ON fotos
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Política 4: Apenas proprietários podem deletar
CREATE POLICY "Enable delete for owner"
  ON fotos
  FOR DELETE
  USING (owner_id = auth.uid());
```

**2. Criar Storage Bucket com RLS**

```sql
-- Criar bucket public para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos', 'fotos', true);

-- RLS para Storage (similar)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fotos' AND auth.role() = 'authenticated');
```

**3. Ativar Email Auth**

- Vá para Authentication > Providers > Email
- Ative "Email Authentication"
- Configure email provider (recomendado: SMTP próprio)

**4. Configurar Redirects**

- Vá para Authentication > URL Configuration
- Adicione redirect URL:
  - Site URL: `https://seu-usuario.github.io/gallery_2`
  - Redirect URLs: `https://seu-usuario.github.io/gallery_2`

### Estágio 3: Publicar no GitHub Pages

**1. Faça push do código (sem `js/config.js`)**

```bash
git add .
git commit -m "Security improvements and auth system"
git push origin main
```

**2. Configure GitHub Pages**

- Vá para Settings > Pages
- Source: Deploy from a branch
- Branch: main, pasta: / (root)
- Clique Save

**3. Aceda ao seu site**

- URL: `https://seu-usuario.github.io/gallery_2`

**4. Primeira vez - Teste Localmente Antes**

- Abra `index.html` num servidor local:
  ```bash
  python -m http.server 8000
  # Ou use Live Server extension no VS Code
  ```
- Verifique que funciona: `http://localhost:8000`

---

## 🧪 Verificação de Segurança

### Checklist antes de publicar

- [ ] `js/config.js` **NÃO** está em .gitignore (NÃO deve ser commited)
- [ ] Credenciais não aparecem em nenhum commit
- [ ] RLS está ativado no Supabase
- [ ] Políticas de RLS estão corretas
- [ ] CSP headers estão no `<head>`
- [ ] SRI hash no CDN do Supabase
- [ ] Sem `onclick` inline em HTML
- [ ] Validação de entrada em todos os métodos
- [ ] Console log não expõe dados sensíveis

### Teste manuais

**1. Teste de leitura (sem autenticação)**

```javascript
// No console do browser
gallery.loadImages(); // Deve funcionar
```

**2. Teste de escrita (sem autenticação)**

```javascript
// Deve falhar com erro 403
supabaseAPI.addImage({ tipo: "Teste", imagem_url: "https://..." });
```

**3. Teste de autenticação**

- Clique em "Login"
- Use credenciais de teste
- Após login, botão "Logout" deve aparecer

---

## ⚠️ Notas Importantes

### Segurança em Produção

1. **Nunca commite credenciais**
   - Verificar sempre `.gitignore`
   - Usar `git diff` antes de push

2. **Regenere chaves se expostas**
   - Se `config.js` foi commited, regenere a chave no Supabase
   - Supabase > Settings > API > Regenerate Keys

3. **Monitore uso de API**
   - Supabase > Analytics > API Usage
   - Alerte para atividade suspeita

4. **Backups regularmente**
   - Supabase tem backups automáticos
   - Configure retenção adequada

### Limitações do GitHub Pages

- ❌ Variáveis de ambiente não suportadas (use `config.js`)
- ❌ Sem backend próprio (depende de Supabase)
- ❌ Sem CORS bypass (respeita politícas CORS)

### Melhorias Futuras

- [ ] Implementar modal de login/signup completo em HTML
- [ ] Adicionar recuperação de palavra-passe
- [ ] Implementar upload de imagens (sem backoffice.html)
- [ ] Adicionar autoria/comentários
- [ ] Cache service worker para offline

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique CSP headers**
   - Abra DevTools > Console
   - Procure por erros CSP

2. **Verifique RLS**
   - Supabase > Authentication > Logs
   - Procure por erros 403/401

3. **Verifique CORS**
   - DevTools > Network
   - Procure respostas com erro CORS

---

## ✨ Resultado

Agora o seu site está seguro por:

✅ Sem credenciais expostas  
✅ CSP contra XSS  
✅ Autenticação obrigatória para escrita  
✅ RLS no nível de banco de dados  
✅ Validação de entrada  
✅ SRI para dependências  
✅ Não há inline javascript

**Pronto para publicar no GitHub Pages com segurança!** 🚀
