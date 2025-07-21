package com.doctorplus.service;

import com.doctorplus.domain.entity.Estoque;
import com.doctorplus.dto.request.EstoqueCreateRequest;
import com.doctorplus.dto.response.EstoqueResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.EstoqueMapper;
import com.doctorplus.repository.EstoqueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EstoqueService {

    private static final Logger logger = LoggerFactory.getLogger(EstoqueService.class);

    private final EstoqueRepository estoqueRepository;
    private final EstoqueMapper estoqueMapper;

    @Autowired
    public EstoqueService(EstoqueRepository estoqueRepository, EstoqueMapper estoqueMapper) {
        this.estoqueRepository = estoqueRepository;
        this.estoqueMapper = estoqueMapper;
    }

    public EstoqueResponse criarItem(EstoqueCreateRequest request) {
        logger.info("Criando novo item de estoque: {}", request.getNome());

        // Validar código único
        validarCodigoUnico(request.getCodigo());

        // Criar item
        Estoque estoque = estoqueMapper.toEntity(request);
        estoque = estoqueRepository.save(estoque);

        logger.info("Item de estoque criado com sucesso: {}", estoque.getId());
        return estoqueMapper.toResponse(estoque);
    }

    @Transactional(readOnly = true)
    public EstoqueResponse buscarPorId(UUID id) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));
        return estoqueMapper.toResponse(estoque);
    }

    @Transactional(readOnly = true)
    public EstoqueResponse buscarPorCodigo(String codigo) {
        Estoque estoque = estoqueRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));
        return estoqueMapper.toResponse(estoque);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarTodos() {
        List<Estoque> itens = estoqueRepository.findByAtivoTrueOrderByNome();
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarPorCategoria(String categoria) {
        List<Estoque> itens = estoqueRepository.findByCategoria(categoria);
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarItensComEstoqueBaixo() {
        List<Estoque> itens = estoqueRepository.findItensComEstoqueBaixo();
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarItensEsgotados() {
        List<Estoque> itens = estoqueRepository.findItensEsgotados();
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> buscarPorTermo(String termo) {
        List<Estoque> itens = estoqueRepository.buscarPorTermo(termo);
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<String> listarCategorias() {
        return estoqueRepository.findAllCategorias();
    }

    public EstoqueResponse atualizarItem(UUID id, EstoqueCreateRequest request) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        // Validar código único se foi alterado
        if (!estoque.getCodigo().equals(request.getCodigo())) {
            validarCodigoUnico(request.getCodigo());
        }

        // Atualizar dados
        estoqueMapper.updateEntityFromRequest(request, estoque);
        estoque = estoqueRepository.save(estoque);

        logger.info("Item de estoque atualizado: {}", estoque.getId());
        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse ajustarQuantidade(UUID id, Integer novaQuantidade) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        if (novaQuantidade < 0) {
            throw new BusinessException("Quantidade não pode ser negativa");
        }

        Integer quantidadeAnterior = estoque.getQuantidade();
        estoque.setQuantidade(novaQuantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Quantidade do item {} ajustada de {} para {}", 
                   estoque.getCodigo(), quantidadeAnterior, novaQuantidade);

        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse adicionarQuantidade(UUID id, Integer quantidade) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        if (quantidade <= 0) {
            throw new BusinessException("Quantidade a adicionar deve ser positiva");
        }

        estoque.setQuantidade(estoque.getQuantidade() + quantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Adicionadas {} unidades ao item {}", quantidade, estoque.getCodigo());
        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse removerQuantidade(UUID id, Integer quantidade) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        if (quantidade <= 0) {
            throw new BusinessException("Quantidade a remover deve ser positiva");
        }

        if (estoque.getQuantidade() < quantidade) {
            throw new BusinessException("Quantidade insuficiente em estoque");
        }

        estoque.setQuantidade(estoque.getQuantidade() - quantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Removidas {} unidades do item {}", quantidade, estoque.getCodigo());
        return estoqueMapper.toResponse(estoque);
    }

    public void desativarItem(UUID id) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        estoque.setAtivo(false);
        estoqueRepository.save(estoque);

        logger.info("Item de estoque desativado: {}", estoque.getCodigo());
    }

    public void ativarItem(UUID id) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        estoque.setAtivo(true);
        estoqueRepository.save(estoque);

        logger.info("Item de estoque ativado: {}", estoque.getCodigo());
    }

    @Transactional(readOnly = true)
    public Long contarItensComEstoqueBaixo() {
        return estoqueRepository.countItensComEstoqueBaixo();
    }

    private void validarCodigoUnico(String codigo) {
        if (estoqueRepository.existsByCodigo(codigo)) {
            throw new BusinessException("Código já está em uso");
        }
    }
}