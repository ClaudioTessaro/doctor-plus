package com.doctorplus.service;

import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.dto.response.ProfissionalResponse;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.ProfissionalMapper;
import com.doctorplus.repository.ProfissionalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProfissionalService {

    private static final Logger logger = LoggerFactory.getLogger(ProfissionalService.class);

    private final ProfissionalRepository profissionalRepository;
    private final ProfissionalMapper profissionalMapper;

    @Autowired
    public ProfissionalService(ProfissionalRepository profissionalRepository,
                              ProfissionalMapper profissionalMapper) {
        this.profissionalRepository = profissionalRepository;
        this.profissionalMapper = profissionalMapper;
    }

    @Transactional(readOnly = true)
    public ProfissionalResponse buscarPorId(UUID id) {
        Profissional profissional = profissionalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado"));
        return profissionalMapper.toResponse(profissional);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponse> listarTodos() {
        List<Profissional> profissionais = profissionalRepository.findAllAtivos();
        return profissionalMapper.toResponseList(profissionais);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponse> buscarPorTermo(String termo) {
        List<Profissional> profissionais = profissionalRepository.buscarPorTermo(termo);
        return profissionalMapper.toResponseList(profissionais);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponse> listarPorEspecialidade(String especialidade) {
        List<Profissional> profissionais = profissionalRepository.findByEspecialidade(especialidade);
        return profissionalMapper.toResponseList(profissionais);
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