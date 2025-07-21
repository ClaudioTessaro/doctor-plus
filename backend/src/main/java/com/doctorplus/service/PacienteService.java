package com.doctorplus.service;

import com.doctorplus.domain.entity.Paciente;
import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.dto.request.PacienteCreateRequest;
import com.doctorplus.dto.response.PacienteResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.PacienteMapper;
import com.doctorplus.repository.PacienteRepository;
import com.doctorplus.repository.UsuarioRepository;
import com.doctorplus.service.validation.CpfValidator;
import com.doctorplus.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PacienteService {

    private static final Logger logger = LoggerFactory.getLogger(PacienteService.class);

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PacienteMapper pacienteMapper;
    private final CpfValidator cpfValidator;
    private final MessageService messageService;

    @Autowired
    public PacienteService(PacienteRepository pacienteRepository,
                          UsuarioRepository usuarioRepository,
                          PacienteMapper pacienteMapper,
                          CpfValidator cpfValidator,
                          MessageService messageService) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.pacienteMapper = pacienteMapper;
        this.cpfValidator = cpfValidator;
        this.messageService = messageService;
    }

    public PacienteResponse criarPaciente(PacienteCreateRequest request, UUID usuarioId) {
        logger.info("Criando novo paciente: {}", request.getNome());

        // Validações
        cpfValidator.validar(request.getCpf());
        validarCpfUnico(request.getCpf());
        validarEmailUnico(request.getEmail());

        // Buscar usuário responsável
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("auth.user.not.found")));

        // Criar paciente
        Paciente paciente = pacienteMapper.toEntity(request);
        paciente.setUsuario(usuario);

        paciente = pacienteRepository.save(paciente);

        logger.info("Paciente criado com sucesso: {}", paciente.getId());
        return pacienteMapper.toResponse(paciente);
    }

    @Transactional(readOnly = true)
    public PacienteResponse buscarPorId(UUID id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("paciente.not.found")));
        return pacienteMapper.toResponse(paciente);
    }

    @Transactional(readOnly = true)
    public PacienteResponse buscarPorCpf(String cpf) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("paciente.not.found")));
        return pacienteMapper.toResponse(paciente);
    }

    @Transactional(readOnly = true)
    public PageResponse<PacienteResponse> listarTodos(Pageable pageable) {
        Page<Paciente> pacientesPage = pacienteRepository.findAll(pageable);
        List<PacienteResponse> pacientes = pacienteMapper.toResponseList(pacientesPage.getContent());
        return new PageResponse<>(
            pacientes,
            pacientesPage.getNumber(),
            pacientesPage.getSize(),
            pacientesPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public List<PacienteResponse> listarPorUsuario(UUID usuarioId) {
        List<Paciente> pacientes = pacienteRepository.findByUsuarioId(usuarioId);
        return pacienteMapper.toResponseList(pacientes);
    }

    @Transactional(readOnly = true)
    public PageResponse<PacienteResponse> buscarPorTermo(String termo, Pageable pageable) {
        Page<Paciente> pacientesPage = pacienteRepository.buscarPorTermo(termo, pageable);
        List<PacienteResponse> pacientes = pacienteMapper.toResponseList(pacientesPage.getContent());
        return new PageResponse<>(
            pacientes,
            pacientesPage.getNumber(),
            pacientesPage.getSize(),
            pacientesPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public List<PacienteResponse> listarTodosSimples() {
        List<Paciente> pacientes = pacienteRepository.findAll();
        return pacienteMapper.toResponseList(pacientes);
    }

    public PacienteResponse atualizarPaciente(UUID id, PacienteCreateRequest request) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("paciente.not.found")));

        // Validar CPF único se foi alterado
        if (!paciente.getCpf().equals(request.getCpf())) {
            cpfValidator.validar(request.getCpf());
            validarCpfUnico(request.getCpf());
        }

        // Validar email único se foi alterado
        if (!paciente.getEmail().equals(request.getEmail())) {
            validarEmailUnico(request.getEmail());
        }

        // Atualizar dados
        pacienteMapper.updateEntityFromRequest(request, paciente);
        paciente = pacienteRepository.save(paciente);

        logger.info("Paciente atualizado: {}", paciente.getId());
        return pacienteMapper.toResponse(paciente);
    }

    public void excluirPaciente(UUID id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("paciente.not.found")));

        pacienteRepository.delete(paciente);
        logger.info("Paciente excluído: {}", id);
    }

    @Transactional(readOnly = true)
    public Long contarTotalPacientes() {
        return pacienteRepository.countTotalPacientes();
    }

    private void validarCpfUnico(String cpf) {
        if (pacienteRepository.existsByCpf(cpf)) {
            throw new BusinessException(messageService.getMessage("paciente.cpf.already.exists"));
        }
    }

    private void validarEmailUnico(String email) {
        if (pacienteRepository.existsByEmail(email)) {
            throw new BusinessException(messageService.getMessage("paciente.email.already.exists"));
        }
    }
}