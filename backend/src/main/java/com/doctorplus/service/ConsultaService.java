package com.doctorplus.service;

import com.doctorplus.domain.entity.Consulta;
import com.doctorplus.domain.entity.Paciente;
import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.domain.enums.StatusConsulta;
import com.doctorplus.dto.request.ConsultaCreateRequest;
import com.doctorplus.dto.response.ConsultaResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.ConsultaMapper;
import com.doctorplus.repository.ConsultaRepository;
import com.doctorplus.repository.PacienteRepository;
import com.doctorplus.repository.ProfissionalRepository;
import com.doctorplus.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ConsultaService {

    private static final Logger logger = LoggerFactory.getLogger(ConsultaService.class);

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;
    private final ConsultaMapper consultaMapper;
    private final EmailService emailService;
    private final MessageService messageService;
    private final SecurityService securityService;

    @Autowired
    public ConsultaService(ConsultaRepository consultaRepository,
                           PacienteRepository pacienteRepository,
                           ProfissionalRepository profissionalRepository,
                           ConsultaMapper consultaMapper,
                           EmailService emailService,
                           MessageService messageService, SecurityService securityService) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.profissionalRepository = profissionalRepository;
        this.consultaMapper = consultaMapper;
        this.emailService = emailService;
        this.messageService = messageService;
        this.securityService = securityService;
    }

    public ConsultaResponse agendarConsulta(ConsultaCreateRequest request) {
        logger.info("Agendando nova consulta para paciente: {}", request.getPacienteId());

        // Buscar entidades
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("consulta.patient.not.found")));

        Profissional profissional = profissionalRepository.findById(request.getProfissionalId())
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("consulta.professional.not.found")));

        // Validar disponibilidade
        validarDisponibilidade(request.getProfissionalId(), request.getDataHora(), request.getDuracaoMinutos());

        // Criar consulta
        Consulta consulta = consultaMapper.toEntity(request);
        consulta.setPaciente(paciente);
        consulta.setProfissional(profissional);

        consulta = consultaRepository.save(consulta);

        // Enviar email de confirmação
        try {
            emailService.enviarConfirmacaoConsulta(consulta);
        } catch (Exception e) {
            logger.warn("Erro ao enviar email de confirmação: {}", e.getMessage());
        }

        logger.info("Consulta agendada com sucesso: {}", consulta.getId());
        return consultaMapper.toResponse(consulta);
    }

    @Transactional(readOnly = true)
    public ConsultaResponse buscarPorId(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("consulta.not.found")));
        return consultaMapper.toResponse(consulta);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorPaciente(Long pacienteId, String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        List<Consulta> consultas;
        if (accessibleIds == null) {
            // Admin - pode ver todas
            consultas = consultaRepository.findByPacienteIdOrderByDataHoraDesc(pacienteId);
        } else {
            // Profissional/Secretário - apenas vinculados
            consultas = consultaRepository.findAccessibleByPacienteId(pacienteId, accessibleIds);
        }
        
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorProfissional(Long profissionalId) {
        List<Consulta> consultas = consultaRepository.findByProfissionalIdOrderByDataHoraDesc(profissionalId);
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorPeriodo(LocalDateTime inicio, LocalDateTime fim, String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        List<Consulta> consultas;
        if (accessibleIds == null) {
            // Admin - pode ver todas
            consultas = consultaRepository.findByDataHoraBetween(inicio, fim);
        } else {
            // Profissional/Secretário - apenas vinculados
            consultas = consultaRepository.findAccessibleByDataHoraBetween(inicio, fim, accessibleIds);
        }
        
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorProfissionalEPeriodo(Long profissionalId, LocalDateTime inicio, LocalDateTime fim) {
        List<Consulta> consultas = consultaRepository.findByProfissionalIdAndDataHoraBetween(profissionalId, inicio, fim);
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarProximasConsultas(String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        List<Consulta> consultas;
        if (accessibleIds == null) {
            // Admin - pode ver todas
            consultas = consultaRepository.findProximasConsultas(LocalDateTime.now());
        } else {
            // Profissional/Secretário - apenas vinculados
            consultas = consultaRepository.findProximasConsultasAccessible(LocalDateTime.now(), accessibleIds);
        }
        
        return consultaMapper.toResponseList(consultas);
    }

    public ConsultaResponse atualizarConsulta(Long id, ConsultaCreateRequest request) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("consulta.not.found")));

        // Validar se pode ser alterada
        if (consulta.getStatus() == StatusConsulta.REALIZADA) {
            throw new BusinessException(messageService.getMessage("consulta.already.realized"));
        }

        // Validar nova disponibilidade se data/hora foi alterada
        if (!consulta.getDataHora().equals(request.getDataHora())) {
            validarDisponibilidade(request.getProfissionalId(), request.getDataHora(), request.getDuracaoMinutos(), id);
        }

        // Atualizar dados
        consultaMapper.updateEntityFromRequest(request, consulta);
        consulta = consultaRepository.save(consulta);

        logger.info("Consulta atualizada: {}", consulta.getId());
        return consultaMapper.toResponse(consulta);
    }

    public ConsultaResponse alterarStatus(Long id, StatusConsulta novoStatus) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("consulta.not.found")));

        StatusConsulta statusAnterior = consulta.getStatus();
        consulta.setStatus(novoStatus);
        consulta = consultaRepository.save(consulta);

        // Enviar notificação se necessário
        if (novoStatus == StatusConsulta.CANCELADA) {
            try {
                emailService.enviarCancelamentoConsulta(consulta);
            } catch (Exception e) {
                logger.warn("Erro ao enviar email de cancelamento: {}", e.getMessage());
            }
        }

        logger.info("Status da consulta {} alterado de {} para {}", id, statusAnterior, novoStatus);
        return consultaMapper.toResponse(consulta);
    }

    public void cancelarConsulta(Long id) {
        alterarStatus(id, StatusConsulta.CANCELADA);
    }

    public void confirmarConsulta(Long id) {
        alterarStatus(id, StatusConsulta.CONFIRMADA);
    }

    public void marcarComoRealizada(Long id) {
        alterarStatus(id, StatusConsulta.REALIZADA);
    }

    @Transactional(readOnly = true)
    public Long contarConsultasNoPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return consultaRepository.countConsultasNoPeriodo(inicio, fim);
    }

    @Transactional(readOnly = true)
    public Long contarTotalConsultas() {
        return consultaRepository.count();
    }

    private void validarDisponibilidade(Long profissionalId, LocalDateTime dataHora, Integer duracao) {
        validarDisponibilidade(profissionalId, dataHora, duracao, null);
    }

    private void validarDisponibilidade(Long profissionalId, LocalDateTime dataHora, Integer duracao, Long consultaExcluida) {
        LocalDateTime inicio = dataHora;
        LocalDateTime fim = dataHora.plusMinutes(duracao);

        List<Consulta> consultasConflitantes = consultaRepository
                .findByProfissionalIdAndDataHoraBetween(profissionalId, inicio.minusMinutes(60), fim.plusMinutes(60))
                .stream()
                .filter(c -> c.getStatus() != StatusConsulta.CANCELADA)
                .filter(c -> consultaExcluida == null || !c.getId().equals(consultaExcluida))
                .filter(c -> {
                    LocalDateTime consultaInicio = c.getDataHora();
                    LocalDateTime consultaFim = c.getDataHora().plusMinutes(c.getDuracaoMinutos());
                    return !(fim.isBefore(consultaInicio) || inicio.isAfter(consultaFim));
                })
                .toList();

        if (!consultasConflitantes.isEmpty()) {
            throw new BusinessException(messageService.getMessage("consulta.time.unavailable"));
        }
    }
}