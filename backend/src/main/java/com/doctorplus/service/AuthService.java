package com.doctorplus.service;

import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.dto.request.LoginRequest;
import com.doctorplus.dto.request.UsuarioCreateRequest;
import com.doctorplus.dto.response.LoginResponse;
import com.doctorplus.dto.response.UsuarioResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.mapper.UsuarioMapper;
import com.doctorplus.repository.UsuarioRepository;
import com.doctorplus.security.JwtTokenProvider;
import com.doctorplus.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final MessageService messageService;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                      JwtTokenProvider tokenProvider,
                      UsuarioService usuarioService,
                      UsuarioRepository usuarioRepository,
                      UsuarioMapper usuarioMapper,
                      MessageService messageService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.messageService = messageService;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            logger.info("Tentativa de login para: {}", request.getEmail());

            // Autenticar usuário
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
            );

            // Buscar usuário
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BusinessException(messageService.getMessage("auth.user.not.found")));

            // Verificar se está ativo
            if (!usuario.getAtivo()) {
                throw new BusinessException(messageService.getMessage("auth.login.inactive"));
            }

            // Gerar token
            String token = tokenProvider.generateToken(authentication);

            // Criar response
            UsuarioResponse usuarioResponse = usuarioMapper.toResponse(usuario);
            LoginResponse response = new LoginResponse(token, usuarioResponse);

            logger.info("Login realizado com sucesso para: {}", request.getEmail());
            return response;

        } catch (AuthenticationException e) {
            logger.warn("Falha na autenticação para: {}", request.getEmail());
            throw new BusinessException(messageService.getMessage("auth.login.invalid"));
        }
    }

    public UsuarioResponse registrar(UsuarioCreateRequest request) {
        logger.info("Registrando novo usuário: {}", request.getEmail());

        // Validar se email já existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(messageService.getMessage("auth.email.already.exists"));
        }

        // Criar usuário
        return usuarioService.criarUsuario(request);
    }

    public UsuarioResponse processarLoginOAuth(String email, String nome, String oauthId) {
        logger.info("Processando login OAuth para: {}", email);

        // Verificar se usuário já existe por OAuth ID
        return usuarioRepository.findByOauthId(oauthId)
                .map(usuario -> {
                    logger.info("Usuário OAuth encontrado: {}", usuario.getEmail());
                    return usuarioMapper.toResponse(usuario);
                })
                .orElseGet(() -> {
                    // Verificar se existe por email
                    return usuarioRepository.findByEmail(email)
                            .map(usuario -> {
                                // Vincular OAuth ID ao usuário existente
                                usuario.setOauthId(oauthId);
                                usuario = usuarioRepository.save(usuario);
                                logger.info("OAuth ID vinculado ao usuário existente: {}", email);
                                return usuarioMapper.toResponse(usuario);
                            })
                            .orElseGet(() -> {
                                // Criar novo usuário OAuth
                                logger.info("Criando novo usuário OAuth: {}", email);
                                return criarUsuarioOAuth(email, nome, oauthId);
                            });
                });
    }

    private UsuarioResponse criarUsuarioOAuth(String email, String nome, String oauthId) {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setEmail(email);
        request.setNome(nome);
        request.setTipo(com.doctorplus.domain.enums.TipoUsuario.PROFISSIONAL); // Default
        request.setDataNascimento(java.time.LocalDate.of(1990, 1, 1)); // Default

        UsuarioResponse response = usuarioService.criarUsuario(request);

        // Atualizar com OAuth ID
        Usuario usuario = usuarioRepository.findById(response.getId()).orElseThrow();
        usuario.setOauthId(oauthId);
        usuario.setSenha(null); // OAuth users don't need password
        usuarioRepository.save(usuario);

        return usuarioMapper.toResponse(usuario);
    }
}