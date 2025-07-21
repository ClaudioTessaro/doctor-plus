package com.doctorplus.service;

import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.domain.entity.Secretario;
import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.domain.enums.TipoUsuario;
import com.doctorplus.dto.request.UsuarioCreateRequest;
import com.doctorplus.dto.response.UsuarioResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.UsuarioMapper;
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
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;
    private final IdadeValidator idadeValidator;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository,
                         PasswordEncoder passwordEncoder,
                         UsuarioMapper usuarioMapper,
                         IdadeValidator idadeValidator) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioMapper = usuarioMapper;
        this.idadeValidator = idadeValidator;
    }

    public UsuarioResponse criarUsuario(UsuarioCreateRequest request) {
        logger.info("Criando novo usuário: {}", request.getEmail());

        // Validações de negócio
        validarEmailUnico(request.getEmail());
        idadeValidator.validarIdadeMinima(request.getDataNascimento());

        // Criar usuário
        Usuario usuario = usuarioMapper.toEntity(request);
        
        if (request.getSenha() != null) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        usuario = usuarioRepository.save(usuario);

        // Criar entidades específicas baseadas no tipo
        criarEntidadeEspecifica(usuario, request);

        logger.info("Usuário criado com sucesso: {}", usuario.getId());
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        List<Usuario> usuarios = usuarioRepository.findAllAtivos();
        return usuarioMapper.toResponseList(usuarios);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarPorTipo(TipoUsuario tipo) {
        List<Usuario> usuarios = usuarioRepository.findByTipoAndAtivoTrue(tipo);
        return usuarioMapper.toResponseList(usuarios);
    }

    public UsuarioResponse atualizarUsuario(Long id, UsuarioCreateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Validar email único se foi alterado
        if (!usuario.getEmail().equals(request.getEmail())) {
            validarEmailUnico(request.getEmail());
        }

        // Atualizar dados
        usuarioMapper.updateEntityFromRequest(request, usuario);
        
        if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        usuario = usuarioRepository.save(usuario);
        
        logger.info("Usuário atualizado: {}", usuario.getId());
        return usuarioMapper.toResponse(usuario);
    }

    public void desativarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
        
        logger.info("Usuário desativado: {}", usuario.getId());
    }

    public void ativarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        usuario.setAtivo(true);
        usuarioRepository.save(usuario);
        
        logger.info("Usuário ativado: {}", usuario.getId());
    }

    private void validarEmailUnico(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new BusinessException("Email já está em uso");
        }
    }

    private void criarEntidadeEspecifica(Usuario usuario, UsuarioCreateRequest request) {
        switch (usuario.getTipo()) {
            case PROFISSIONAL -> {
                Profissional profissional = new Profissional();
                profissional.setUsuario(usuario);
                profissional.setEspecialidade(request.getEspecialidade() != null ? 
                    request.getEspecialidade() : "Medicina Geral");
                profissional.setCrm(request.getCrm() != null ? 
                    request.getCrm() : gerarCrmTemporario());
                usuario.setProfissional(profissional);
            }
            case SECRETARIO -> {
                Secretario secretario = new Secretario();
                secretario.setUsuario(usuario);
                usuario.setSecretario(secretario);
            }
            case ADMIN -> {
                // Admin não precisa de entidade específica
            }
        }
    }

    private String gerarCrmTemporario() {
        return "CRM-" + System.currentTimeMillis();
    }
}