-- Cria o banco de testes (o banco principal já é criado pelo POSTGRES_DB)
CREATE DATABASE oficina_ellp_test;

-- Garante permissões nos dois bancos
GRANT ALL PRIVILEGES ON DATABASE oficina_ellp TO ellp;
GRANT ALL PRIVILEGES ON DATABASE oficina_ellp_test TO ellp;
