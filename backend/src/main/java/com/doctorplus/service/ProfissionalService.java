package com.doctorplus.service;

import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.dto.response.ProfissionalResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.ProfissionalMapper;
import com.doctorplus.repository.ProfissionalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProfissionalService {

    private static final Logger logger = LoggerFactory.getLogger(ProfissionalService.class);

    private final ProfissionalRepository profissionalRepository;
    private final ProfissionalMapper profissionalMapper;
    private final SecurityService securityService;

    @Autowired
    public ProfissionalService(ProfissionalRepository profissionalRepository,
                              ProfissionalMapper profissionalMapper,
                              SecurityService securityService) {
        this.profissionalRepository = profissionalRepository;
        this.profissionalMapper = profissionalMapper;
        this.securityService = securityService;
    }

    @Transactional(readOnly = true)
    public ProfissionalResponse buscarPorId(Long id, String userEmail) {
        // Verificar acesso
        if (!securityService.canAccessProfissional(userEmail, id)) {
            throw new BusinessException("Acesso negado ao profissional");
        }

        Profissional profissional = profissionalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado"));
        return profissionalMapper.toResponse(profissional);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponse> listarTodos(String userEmail) {
        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        List<Profissional> profissionais;
        if (accessibleIds.isEmpty()) {
            // Admin - pode ver todos
            profissionais = profissionalRepository.findAllAtivos();
        } else {
            // Profissional/Secretário - apenas vinculados
            profissionais = profissionalRepository.findAccessibleProfissionais(accessibleIds);
        }
        
        return profissionalMapper.toResponseList(profissionais);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponse> buscarPorTermo(String termo, String userEmail) {
        // Para busca, aplicamos filtro após buscar todos acessíveis
        List<ProfissionalResponse> todosProfissionais = listarTodos(userEmail);
        
        return todosProfissionais.stream()
                .filter(p -> 
                    p.getEspecialidade().toLowerCase().contains(termo.toLowerCase()) ||
                    p.getUsuario().getNome().toLowerCase().contains(termo.toLowerCase()) ||
                    p.getCrm().toLowerCase().contains(termo.toLowerCase())
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponse> listarPorEspecialidade(String especialidade, String userEmail) {
        List<ProfissionalResponse> todosProfissionais = listarTodos(userEmail);
        
        return todosProfissionais.stream()
                .filter(p -> p.getEspecialidade().equals(especialidade))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> listarEspecialidades() {
        return profissionalRepository.findAllEspecialidades();
    }

    @Transactional(readOnly = true)
    public Long contarTotalProfissionais() {
        return profissionalRepository.countTotalProfissionais();
    }
}