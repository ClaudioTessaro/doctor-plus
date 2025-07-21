package com.doctorplus.service;

import com.doctorplus.domain.entity.Estoque;
import com.doctorplus.dto.request.EstoqueCreateRequest;
import com.doctorplus.dto.response.EstoqueResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.EstoqueMapper;
import com.doctorplus.repository.EstoqueRepository;
import com.doctorplus.service.MessageService;
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
public class EstoqueService {

    private static final Logger logger = LoggerFactory.getLogger(EstoqueService.class);

    private final EstoqueRepository estoqueRepository;
    private final EstoqueMapper estoqueMapper;
    private final MessageService messageService;
    private final SecurityService securityService;

    @Autowired
    public EstoqueService(EstoqueRepository estoqueRepository, EstoqueMapper estoqueMapper, MessageService messageService, SecurityService securityService) {
        this.estoqueRepository = estoqueRepository;
        this.estoqueMapper = estoqueMapper;
        this.messageService = messageService;
        this.securityService = securityService;
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
    public EstoqueResponse buscarPorId(Long id) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));
        return estoqueMapper.toResponse(estoque);
    }

    @Transactional(readOnly = true)
    public EstoqueResponse buscarPorCodigo(String codigo) {
        Estoque estoque = estoqueRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));
        return estoqueMapper.toResponse(estoque);
    }

    @Transactional(readOnly = true)
    public PageResponse<EstoqueResponse> listarTodos(Pageable pageable, String userEmail) {
        // Verificar se é admin
        if (!securityService.isAdmin(userEmail)) {
            throw new BusinessException("Acesso negado. Apenas administradores podem acessar estoque.");
        }
        
        Page<Estoque> itensPage = estoqueRepository.findByAtivoTrue(pageable);
        List<EstoqueResponse> itens = estoqueMapper.toResponseList(itensPage.getContent());
        return new PageResponse<>(
            itens,
            itensPage.getNumber(),
            itensPage.getSize(),
            itensPage.getTotalElements()
        );
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
    public PageResponse<EstoqueResponse> buscarPorTermo(String termo, Pageable pageable) {
        Page<Estoque> itensPage = estoqueRepository.buscarPorTermo(termo, pageable);
        List<EstoqueResponse> itens = estoqueMapper.toResponseList(itensPage.getContent());
        return new PageResponse<>(
            itens,
            itensPage.getNumber(),
            itensPage.getSize(),
            itensPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarTodosSimples(String userEmail) {
        // Verificar se é admin
        if (!securityService.isAdmin(userEmail)) {
            throw new BusinessException("Acesso negado. Apenas administradores podem acessar estoque.");
        }
        
        List<Estoque> itens = estoqueRepository.findByAtivoTrueOrderByNome();
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<String> listarCategorias(String userEmail) {
        // Verificar se é admin
        if (!securityService.isAdmin(userEmail)) {
            throw new BusinessException("Acesso negado. Apenas administradores podem acessar estoque.");
        }
        
        return estoqueRepository.findAllCategorias();
    }

    @Transactional(readOnly = true)
    public PageResponse<EstoqueResponse> buscarPorTermo(String termo, Pageable pageable, String userEmail) {
        // Verificar se é admin
        if (!securityService.isAdmin(userEmail)) {
            throw new BusinessException("Acesso negado. Apenas administradores podem acessar estoque.");
        }
        
        Page<Estoque> itensPage = estoqueRepository.buscarPorTermo(termo, pageable);
        List<EstoqueResponse> itens = estoqueMapper.toResponseList(itensPage.getContent());
        return new PageResponse<>(
            itens,
            itensPage.getNumber(),
            itensPage.getSize(),
            itensPage.getTotalElements()
        );
    }

    public EstoqueResponse atualizarItem(Long id, EstoqueCreateRequest request) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));

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

    public EstoqueResponse ajustarQuantidade(Long id, Integer novaQuantidade) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));

        if (novaQuantidade < 0) {
            throw new BusinessException(messageService.getMessage("estoque.negative.quantity"));
        }

        Integer quantidadeAnterior = estoque.getQuantidade();
        estoque.setQuantidade(novaQuantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Quantidade do item {} ajustada de {} para {}", 
                   estoque.getCodigo(), quantidadeAnterior, novaQuantidade);

        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse adicionarQuantidade(Long id, Integer quantidade) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));

        if (quantidade <= 0) {
            throw new BusinessException(messageService.getMessage("estoque.positive.quantity.required"));
        }

        estoque.setQuantidade(estoque.getQuantidade() + quantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Adicionadas {} unidades ao item {}", quantidade, estoque.getCodigo());
        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse removerQuantidade(Long id, Integer quantidade) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));

        if (quantidade <= 0) {
            throw new BusinessException(messageService.getMessage("estoque.positive.quantity.required"));
        }

        if (estoque.getQuantidade() < quantidade) {
            throw new BusinessException(messageService.getMessage("estoque.insufficient.quantity"));
        }

        estoque.setQuantidade(estoque.getQuantidade() - quantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Removidas {} unidades do item {}", quantidade, estoque.getCodigo());
        return estoqueMapper.toResponse(estoque);
    }

    public void desativarItem(Long id) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado"));

        estoque.setAtivo(false);
        estoqueRepository.save(estoque);

        logger.info("Item de estoque desativado: {}", estoque.getCodigo());
    }

    public void ativarItem(Long id) {
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

    @Transactional(readOnly = true)
    public Long contarTotalItens() {
        return estoqueRepository.countByAtivoTrue();
    }

    private void validarCodigoUnico(String codigo) {
        if (estoqueRepository.existsByCodigo(codigo)) {
            throw new BusinessException(messageService.getMessage("estoque.code.already.exists"));
        }
    }
}