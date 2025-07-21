package com.doctorplus.service;

import com.doctorplus.domain.entity.Historico;
import com.doctorplus.domain.entity.Paciente;
import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.dto.request.HistoricoCreateRequest;
import com.doctorplus.dto.response.HistoricoResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.HistoricoMapper;
import com.doctorplus.repository.HistoricoRepository;
import com.doctorplus.repository.PacienteRepository;
import com.doctorplus.repository.ProfissionalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HistoricoService {

    private static final Logger logger = LoggerFactory.getLogger(HistoricoService.class);

    private final HistoricoRepository historicoRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfissionalRepository profissionalRepository;
    private final HistoricoMapper historicoMapper;

    @Autowired
    public HistoricoService(HistoricoRepository historicoRepository,
                           PacienteRepository pacienteRepository,
                           ProfissionalRepository profissionalRepository,
                           HistoricoMapper historicoMapper) {
        this.historicoRepository = historicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.profissionalRepository = profissionalRepository;
        this.historicoMapper = historicoMapper;
    }

    public HistoricoResponse criarHistorico(HistoricoCreateRequest request, Long usuarioId) {
        logger.info("Criando novo histórico para paciente: {}", request.getPacienteId());

        // Buscar entidades
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        Profissional profissional = profissionalRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuário não é um profissional"));

        // Criar histórico
        Historico historico = historicoMapper.toEntity(request);
        historico.setPaciente(paciente);
        historico.setProfissional(profissional);

        historico = historicoRepository.save(historico);

        logger.info("Histórico criado com sucesso: {}", historico.getId());
        return historicoMapper.toResponse(historico);
    }

    @Transactional(readOnly = true)
    public HistoricoResponse buscarPorId(Long id) {
        Historico historico = historicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Histórico não encontrado"));
        return historicoMapper.toResponse(historico);
    }

    @Transactional(readOnly = true)
    public PageResponse<HistoricoResponse> listarTodos(Pageable pageable, String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        Page<Historico> historicosPage;
        if (accessibleIds == null) {
            // Admin - pode ver todos
            historicosPage = historicoRepository.findAll(pageable);
        } else {
            // Profissional/Secretário - apenas vinculados
            historicosPage = historicoRepository.findAccessibleHistoricos(accessibleIds, pageable);
        }
        
        List<HistoricoResponse> historicos = historicoMapper.toResponseList(historicosPage.getContent());
        return new PageResponse<>(
            historicos,
            historicosPage.getNumber(),
            historicosPage.getSize(),
            historicosPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public List<HistoricoResponse> listarPorPaciente(Long pacienteId) {
        return historicoMapper.toResponseList(historicos);
    }

    @Transactional(readOnly = true)
    public List<HistoricoResponse> listarPorProfissional(Long profissionalId) {
        List<Historico> historicos = historicoRepository.findByProfissionalIdOrderByDataConsultaDesc(profissionalId);
        return historicoMapper.toResponseList(historicos);
    }

    @Transactional(readOnly = true)
    public PageResponse<HistoricoResponse> buscarPorTermo(String termo, Pageable pageable, String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        Page<Historico> historicosPage;
        if (accessibleIds == null) {
            // Admin - pode buscar todos
            historicosPage = historicoRepository.buscarPorTermo(termo, pageable);
        } else {
            // Profissional/Secretário - apenas vinculados
            historicosPage = historicoRepository.buscarPorTermoAccessible(termo, accessibleIds, pageable);
        }
        
        List<HistoricoResponse> historicos = historicoMapper.toResponseList(historicosPage.getContent());
        return new PageResponse<>(
            historicos,
            historicosPage.getNumber(),
            historicosPage.getSize(),
            historicosPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public List<HistoricoResponse> listarPorPaciente(Long pacienteId, String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        List<Historico> historicos;
        if (accessibleIds == null) {
            // Admin - pode ver todos
            historicos = historicoRepository.findByPacienteIdOrderByDataConsultaDesc(pacienteId);
        } else {
            // Profissional/Secretário - apenas vinculados
            historicos = historicoRepository.findAccessibleHistoricosSimples(accessibleIds);
        }
        
        return historicoMapper.toResponseList(historicos);
    }

    public HistoricoResponse atualizarHistorico(Long id, HistoricoCreateRequest request) {
        Historico historico = historicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Histórico não encontrado"));

        // Atualizar dados
        historicoMapper.updateEntityFromRequest(request, historico);
        historico = historicoRepository.save(historico);

        logger.info("Histórico atualizado: {}", historico.getId());
        return historicoMapper.toResponse(historico);
    }

    public void excluirHistorico(Long id) {
        Historico historico = historicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Histórico não encontrado"));

        historicoRepository.delete(historico);
        logger.info("Histórico excluído: {}", id);
    }

    @Transactional(readOnly = true)
    public Long contarTotalHistoricos() {
        return historicoRepository.countTotalHistoricos();
    }
}