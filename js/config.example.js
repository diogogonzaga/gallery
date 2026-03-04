/* ========================================
   CONFIGURAÇÃO DO SUPABASE - TEMPLATE
   ======================================== */

/**
 * INSTRUÇÕES:
 * 1. Copie este ficheiro para js/config.js
 * 2. Preencha com as suas credenciais do Supabase
 * 3. NÃO faça commit de js/config.js (está em .gitignore)
 * 
 * OBTENHA AS CREDENCIAIS:
 * - Aceda a https://supabase.com
 * - Vá para Settings > API
 * - Copie a "Project URL"
 * - Copie a "anon key"
 */

const SUPABASE_CONFIG = {
    // URL do seu projeto Supabase
    url: 'https://seu-projeto.supabase.co',
    
    // Chave pública (ANON KEY) do Supabase
    // Esta chave é segura no contexto do navegador, pois estará associada 
    // apenas a utilizadores autenticados via Supabase Auth
    key: 'sua-chave-publica-aqui',
    
    // Nome da tabela que contém as imagens
    table: 'fotos',
    
    // Nome do storage bucket (se usar Supabase Storage)
    storageBucket: 'fotos',
    
    // Configurações adicionais
    pageSize: 20,
};

/* ========================================
   SEGURANÇA - CONFIGURAÇÃO DO SUPABASE
   ======================================== */

/*
PASSO 1: Ativar Row Level Security (RLS)
Execute no Supabase SQL editor:

-- Ativar RLS na tabela fotos
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

-- Política de leitura: todos podem ver imagens (públicas)
CREATE POLICY "Enable public read access to fotos"
  ON fotos
  FOR SELECT
  USING (true);

-- Política de escrita: apenas utilizadores autenticados com owner_id correto
CREATE POLICY "Enable insert for authenticated users only"
  ON fotos
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Enable update for owner only"
  ON fotos
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Enable delete for owner only"
  ON fotos
  FOR DELETE
  USING (owner_id = auth.uid());

PASSO 2: Adicione coluna owner_id à tabela:

ALTER TABLE fotos ADD COLUMN owner_id uuid REFERENCES auth.users;

PASSO 3: Ativar Supabase Auth
- Vá para Settings > Auth
- Ative "Email Auth" ou os provedores desejados
- Configure os redirects para seu domínio GitHub Pages
  Exemplo: https://seu-usuario.github.io/gallery_2

PASSO 4: Crie Storage bucket com RLS
- Vá para Storage
- Crie um bucket chamado "fotos"
- Configure as políticas de RLS (similar à tabela)
*/
