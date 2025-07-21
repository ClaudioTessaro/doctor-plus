# DoctorPlus Backend

Sistema de Gerenciamento Clínico desenvolvido em Spring Boot 3.3 seguindo as melhores práticas de Clean Code e arquitetura em camadas.

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas bem definida:

- **Controller**: Camada de apresentação (REST APIs)
- **Service**: Camada de lógica de negócio
- **Repository**: Camada de acesso a dados
- **Entity**: Entidades do domínio
- **DTO**: Objetos de transferência de dados
- **Mapper**: Conversão entre entidades e DTOs

## 🚀 Tecnologias

- **Spring Boot 3.3**: Framework principal
- **Spring Security**: Autenticação e autorização
- **Spring Data JPA**: Persistência de dados
- **PostgreSQL**: Banco de dados
- **JWT**: Tokens de autenticação
- **MapStruct**: Mapeamento de objetos
- **Swagger/OpenAPI**: Documentação da API
- **JUnit 5 + Mockito**: Testes unitários
- **TestContainers**: Testes de integração

## 📋 Funcionalidades

### Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de usuários
- ✅ OAuth2 com Google
- ✅ JWT para controle de sessão
- ✅ Validação de idade (18+ anos)

### Gestão de Usuários
- ✅ CRUD completo de usuários
- ✅ Tipos: ADMIN, PROFISSIONAL, SECRETARIO
- ✅ Ativação/desativação de contas

### Gestão de Pacientes
- ✅ CRUD completo de pacientes
- ✅ Validação de CPF
- ✅ Busca por nome, CPF ou email
- ✅ Histórico médico completo

### Sistema de Consultas
- ✅ Agendamento de consultas
- ✅ Validação de disponibilidade
- ✅ Status: AGENDADA, CONFIRMADA, CANCELADA, REALIZADA
- ✅ Notificações por email
- ✅ Visualização por período

### Controle de Estoque
- ✅ CRUD de produtos/medicamentos
- ✅ Controle de quantidade
- ✅ Alertas de estoque baixo
- ✅ Categorização de produtos

### Secretariado
- ✅ Cadastro de secretários
- ✅ Vinculação com profissionais
- ✅ Permissões específicas

## 🔧 Configuração

### Pré-requisitos
- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### Variáveis de Ambiente

```bash
# Database
DB_USERNAME=doctorplus
DB_PASSWORD=doctorplus123

# JWT
JWT_SECRET=mySecretKey123456789012345678901234567890

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@doctorplus.com

# Payment
STRIPE_API_KEY=your-stripe-api-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Executar Aplicação

```bash
# Clonar repositório
git clone <repository-url>
cd doctorplus-backend

# Instalar dependências
mvn clean install

# Executar aplicação
mvn spring-boot:run
```

### Executar Testes

```bash
# Testes unitários
mvn test

# Testes de integração
mvn verify
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs

## 🔐 Segurança

### Autenticação
- JWT com expiração de 24 horas
- Refresh tokens automáticos
- OAuth2 com Google

### Autorização
- Role-based access control (RBAC)
- Método-level security
- Resource-level permissions

### Endpoints Públicos
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/oauth/success`
- `GET /actuator/health`

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:8080/api/actuator/health
```

### Métricas
- Disponível em `/actuator/metrics`
- Integração com Prometheus/Grafana

## 🧪 Testes

### Estrutura de Testes
```
src/test/java/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
└── e2e/           # Testes end-to-end
```

### Cobertura de Testes
- Services: 90%+
- Controllers: 85%+
- Repositories: 80%+

## 🚀 Deploy

### Docker
```dockerfile
FROM openjdk:17-jre-slim
COPY target/doctorplus-backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: doctorplus-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: doctorplus-backend
  template:
    metadata:
      labels:
        app: doctorplus-backend
    spec:
      containers:
      - name: backend
        image: doctorplus/backend:latest
        ports:
        - containerPort: 8080
```

## 📝 Logs

### Configuração
- Logs estruturados em JSON
- Níveis: ERROR, WARN, INFO, DEBUG
- Rotação automática de arquivos

### Localização
- Console: stdout
- Arquivo: `logs/doctorplus.log`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- Email: suporte@doctorplus.com
- Documentação: https://docs.doctorplus.com
- Issues: https://github.com/doctorplus/backend/issues