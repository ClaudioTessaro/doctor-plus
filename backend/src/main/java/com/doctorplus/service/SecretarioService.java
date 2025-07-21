package com.doctorplus.service;

import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.domain.entity.Secretario;
import com.doctorplus.domain.entity.SecretarioProfissional;
import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.domain.enums.TipoUsuario;
import com.doctorplus.dto.request.SecretarioCreateRequest;
import com.doctorplus.dto.response.SecretarioResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.SecretarioMapper;
import com.doctorplus.repository.ProfissionalRepository;
import com.doctorplus.repository.SecretarioProfissionalRepository;
import com.doctorplus.repository.SecretarioRepository;
import com.doctorplus.repository.UsuarioRepository;
import com.doctorplus.service.validation.IdadeValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SecretarioService {

    private static final Logger logger = LoggerFactory.getLogger(SecretarioService.class);

    private final SecretarioRepository secretarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfissionalRepository profissionalRepository;
    private final SecretarioProfissionalRepository secretarioProfissionalRepository;
    private final SecretarioMapper secretarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final IdadeValidator idadeValidator;
    private final SecurityService securityService;

    @Autowired
    public SecretarioService(SecretarioRepository secretarioRepository,
                             UsuarioRepository usuarioRepository,
                             ProfissionalRepository profissionalRepository,
                             SecretarioProfissionalRepository secretarioProfissionalRepository,
                             SecretarioMapper secretarioMapper,
                             PasswordEncoder passwordEncoder,
                             IdadeValidator idadeValidator, SecurityService securityService) {
        this.secretarioRepository = secretarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.profissionalRepository = profissionalRepository;
        this.secretarioProfissionalRepository = secretarioProfissionalRepository;
        this.secretarioMapper = secretarioMapper;
        this.passwordEncoder = passwordEncoder;
        this.idadeValidator = idadeValidator;
        this.securityService = securityService;
    }

    public SecretarioResponse criarSecretario(SecretarioCreateRequest request) {
        logger.info("Criando novo secretário: {}", request.getEmail());

        // Validações de negócio
        validarEmailUnico(request.getEmail());
        idadeValidator.validarIdadeMinima(request.getDataNascimento());

        // Criar usuário
        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setTipo(TipoUsuario.SECRETARIO);
        usuario.setDataNascimento(request.getDataNascimento());
        usuario.setAtivo(true);

        usuario = usuarioRepository.save(usuario);

        // Criar secretário
        Secretario secretario = new Secretario();
        secretario.setUsuario(usuario);

        secretario = secretarioRepository.save(secretario);

        logger.info("Secretário criado com sucesso: {}", secretario.getId());
        return secretarioMapper.toResponse(secretario);
    }

    @Transactional(readOnly = true)
    public SecretarioResponse buscarPorId(Long id) {
        Secretario secretario = secretarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Secretário não encontrado"));
        return secretarioMapper.toResponse(secretario);
    }

    @Transactional(readOnly = true)
    public List<SecretarioResponse> listarTodos(String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleSecretarioIds(userEmail);
        
        List<Secretario> secretarios;
        if (accessibleIds == null) {
            // Admin - pode ver todos
            secretarios = secretarioRepository.findAllAtivos();
        } else {
            // Profissional/Secretário - apenas vinculados
            secretarios = secretarioRepository.findAccessibleSecretarios(accessibleIds);
        }
        
        return secretarioMapper.toResponseList(secretarios);
    }

    @Transactional(readOnly = true)
    public List<SecretarioResponse> buscarPorTermo(String termo, String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleSecretarioIds(userEmail);
        
        List<Secretario> secretarios;
        if (accessibleIds == null) {
            // Admin - pode buscar todos
            secretarios = secretarioRepository.buscarPorTermo(termo);
        } else {
            // Profissional/Secretário - apenas vinculados
            secretarios = secretarioRepository.buscarPorTermoAccessible(termo, accessibleIds);
        }
        
        return secretarioMapper.toResponseList(secretarios);
    }

    public SecretarioResponse atualizarSecretario(Long id, SecretarioCreateRequest request) {
        Secretario secretario = secretarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Secretário não encontrado"));

        Usuario usuario = secretario.getUsuario();

        // Validar email único se foi alterado
        if (!usuario.getEmail().equals(request.getEmail())) {
            validarEmailUnico(request.getEmail());
        }

        // Atualizar dados do usuário
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setDataNascimento(request.getDataNascimento());

        if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        usuarioRepository.save(usuario);

        logger.info("Secretário atualizado: {}", secretario.getId());
        return secretarioMapper.toResponse(secretario);
    }

    public SecretarioResponse vincularProfissional(Long secretarioId, Long profissionalId) {
        Secretario secretario = secretarioRepository.findById(secretarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Secretário não encontrado"));

        Profissional profissional = profissionalRepository.findById(profissionalId)
                .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado"));

        // Verificar se já existe vinculação
        if (secretarioProfissionalRepository.existsBySecretarioIdAndProfissionalId(secretarioId, profissionalId)) {
            throw new BusinessException("Secretário já está vinculado a este profissional");
        }

        // Criar vinculação
        SecretarioProfissional vinculo = new SecretarioProfissional();
        vinculo.setSecretario(secretario);
        vinculo.setProfissional(profissional);

        secretarioProfissionalRepository.save(vinculo);

        logger.info("Profissional {} vinculado ao secretário {}", profissionalId, secretarioId);
        return secretarioMapper.toResponse(secretario);
    }

    public void desvincularProfissional(Long secretarioId, Long profissionalId) {
        SecretarioProfissional vinculo = secretarioProfissionalRepository
                .findBySecretarioIdAndProfissionalId(secretarioId, profissionalId)
                .orElseThrow(() -> new ResourceNotFoundException("Vinculação não encontrada"));

        secretarioProfissionalRepository.delete(vinculo);

        logger.info("Profissional {} desvinculado do secretário {}", profissionalId, secretarioId);
    }

    public void ativarSecretario(Long id) {
        Secretario secretario = secretarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Secretário não encontrado"));

        secretario.getUsuario().setAtivo(true);
        usuarioRepository.save(secretario.getUsuario());

        logger.info("Secretário ativado: {}", id);
    }

    public void desativarSecretario(Long id) {
        Secretario secretario = secretarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Secretário não encontrado"));

        secretario.getUsuario().setAtivo(false);
        usuarioRepository.save(secretario.getUsuario());

        logger.info("Secretário desativado: {}", id);
    }

    @Transactional(readOnly = true)
    public Long contarTotalSecretarios() {
        return secretarioRepository.countTotalSecretarios();
    }

    private void validarEmailUnico(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new BusinessException("Email já está em uso");
        }
    }
}