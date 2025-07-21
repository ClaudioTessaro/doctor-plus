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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ConsultaService {

    private static final Logger logger = LoggerFactory.getLogger(ConsultaService.class);

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;
    private final ConsultaMapper consultaMapper;
    private final EmailService emailService;

    @Autowired
    public ConsultaService(ConsultaRepository consultaRepository,
                          PacienteRepository pacienteRepository,
                          ProfissionalRepository profissionalRepository,
                          ConsultaMapper consultaMapper,
                          EmailService emailService) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.profissionalRepository = profissionalRepository;
        this.consultaMapper = consultaMapper;
        this.emailService = emailService;
    }

    public ConsultaResponse agendarConsulta(ConsultaCreateRequest request) {
        logger.info("Agendando nova consulta para paciente: {}", request.getPacienteId());

        // Buscar entidades
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        Profissional profissional = profissionalRepository.findById(request.getProfissionalId())
                .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado"));

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
    public ConsultaResponse buscarPorId(UUID id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada"));
        return consultaMapper.toResponse(consulta);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorPaciente(UUID pacienteId) {
        List<Consulta> consultas = consultaRepository.findByPacienteIdOrderByDataHoraDesc(pacienteId);
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorProfissional(UUID profissionalId) {
        List<Consulta> consultas = consultaRepository.findByProfissionalIdOrderByDataHoraDesc(profissionalId);
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        List<Consulta> consultas = consultaRepository.findByDataHoraBetween(inicio, fim);
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarPorProfissionalEPeriodo(UUID profissionalId, LocalDateTime inicio, LocalDateTime fim) {
        List<Consulta> consultas = consultaRepository.findByProfissionalIdAndDataHoraBetween(profissionalId, inicio, fim);
        return consultaMapper.toResponseList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> listarProximasConsultas() {
        List<Consulta> consultas = consultaRepository.findProximasConsultas(LocalDateTime.now());
        return consultaMapper.toResponseList(consultas);
    }

    public ConsultaResponse atualizarConsulta(UUID id, ConsultaCreateRequest request) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada"));

        // Validar se pode ser alterada
        if (consulta.getStatus() == StatusConsulta.REALIZADA) {
            throw new BusinessException("Não é possível alterar consulta já realizada");
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

    public ConsultaResponse alterarStatus(UUID id, StatusConsulta novoStatus) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada"));

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

    public void cancelarConsulta(UUID id) {
        alterarStatus(id, StatusConsulta.CANCELADA);
    }

    public void confirmarConsulta(UUID id) {
        alterarStatus(id, StatusConsulta.CONFIRMADA);
    }

    public void marcarComoRealizada(UUID id) {
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

    private void validarDisponibilidade(UUID profissionalId, LocalDateTime dataHora, Integer duracao) {
        validarDisponibilidade(profissionalId, dataHora, duracao, null);
    }

    private void validarDisponibilidade(UUID profissionalId, LocalDateTime dataHora, Integer duracao, UUID consultaExcluida) {
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
            throw new BusinessException("Horário não disponível para o profissional");
        }
    }
}