package com.doctorplus.service;

import com.doctorplus.domain.entity.Estoque;
import com.doctorplus.dto.request.EstoqueCreateRequest;
import com.doctorplus.dto.response.EstoqueResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.exception.BusinessException;
import com.doctorplus.exception.ResourceNotFoundException;
import com.doctorplus.mapper.EstoqueMapper;
import com.doctorplus.repository.EstoqueRepository;
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
public class EstoqueService {

    private static final Logger logger = LoggerFactory.getLogger(EstoqueService.class);

    private final EstoqueRepository estoqueRepository;
    private final EstoqueMapper estoqueMapper;
    private final MessageService messageService;
    private final ProfissionalRepository profissionalRepository;
    private final SecurityService securityService;

    @Autowired
    public EstoqueService(EstoqueRepository estoqueRepository,
                          EstoqueMapper estoqueMapper,
                          MessageService messageService,
                          ProfissionalRepository profissionalRepository,
                          SecurityService securityService) {
        this.estoqueRepository = estoqueRepository;
        this.estoqueMapper = estoqueMapper;
        this.messageService = messageService;
        this.profissionalRepository = profissionalRepository;
        this.securityService = securityService;
    }

    public EstoqueResponse criarItem(EstoqueCreateRequest request, String userEmail) {
        logger.info("Criando novo item de estoque: {}", request.getNome());

        Long profissionalId = getProfissionalId(userEmail);

        // Validar código único para o profissional
        validarCodigoUnico(request.getCodigo(), profissionalId);

        // Criar item
        Estoque estoque = estoqueMapper.toEntity(request);

        // Vincular ao profissional se não for admin
        if (profissionalId != null) {
            estoque.setProfissional(profissionalRepository.findById(profissionalId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profissional não encontrado")));
        }

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
        Long profissionalId = getProfissionalId(userEmail);

        Page<Estoque> itensPage;
        if (profissionalId == null) {
            // Admin - vê todos os estoques
            itensPage = estoqueRepository.findByAtivoTrue(pageable);
        } else {
            // Profissional - vê apenas seu estoque
            itensPage = estoqueRepository.findByProfissionalIdAndAtivoTrue(profissionalId, pageable);
        }

        List<EstoqueResponse> itens = estoqueMapper.toResponseList(itensPage.getContent());
        return new PageResponse<>(
                itens,
                itensPage.getNumber(),
                itensPage.getSize(),
                itensPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarPorCategoria(String categoria, String userEmail) {
        Long profissionalId = getProfissionalId(userEmail);

        List<Estoque> itens;
        if (profissionalId == null) {
            // Admin - vê todas as categorias
            itens = estoqueRepository.findByCategoria(categoria);
        } else {
            // Profissional - vê apenas sua categoria
            itens = estoqueRepository.findByProfissionalIdAndCategoria(profissionalId, categoria);
        }

        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarItensComEstoqueBaixo(String userEmail) {
        Long profissionalId = getProfissionalId(userEmail);
        List<Estoque> itens = estoqueRepository.findItensComEstoqueBaixo(profissionalId);
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listarItensEsgotados(String userEmail) {
        Long profissionalId = getProfissionalId(userEmail);
        List<Estoque> itens = estoqueRepository.findItensEsgotados(profissionalId);
        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public PageResponse<EstoqueResponse> buscarPorTermo(String termo, Pageable pageable, String email) {
        Page<Estoque> itensPage = estoqueRepository.buscarPorTermoParteBusca(termo, email, pageable);
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
        Long profissionalId = getProfissionalId(userEmail);

        List<Estoque> itens;
        if (profissionalId == null) {
            // Admin - vê todos os estoques
            itens = estoqueRepository.findByAtivoTrueOrderByNome();
        } else {
            // Profissional - vê apenas seu estoque
            itens = estoqueRepository.findByProfissionalIdAndAtivoTrueOrderByNome(profissionalId);
        }

        return estoqueMapper.toResponseList(itens);
    }

    @Transactional(readOnly = true)
    public List<String> listarCategorias(String userEmail) {
        Long profissionalId = getProfissionalId(userEmail);
        return estoqueRepository.findAllCategorias(profissionalId);
    }

    public EstoqueResponse atualizarItem(Long id, EstoqueCreateRequest request, String userEmail) {
        Estoque estoque = buscarItemComValidacao(id, userEmail);

        // Validar código único se foi alterado
        if (!estoque.getCodigo().equals(request.getCodigo())) {
            Long profissionalId = getProfissionalId(userEmail);
            validarCodigoUnico(request.getCodigo(), profissionalId);
        }

        // Atualizar dados
        estoqueMapper.updateEntityFromRequest(request, estoque);
        estoque = estoqueRepository.save(estoque);

        logger.info("Item de estoque atualizado: {}", estoque.getId());
        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse ajustarQuantidade(Long id, Integer novaQuantidade, String userEmail) {
        Estoque estoque = buscarItemComValidacao(id, userEmail);

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

    public EstoqueResponse adicionarQuantidade(Long id, Integer quantidade, String userEmail) {
        Estoque estoque = buscarItemComValidacao(id, userEmail);

        if (quantidade <= 0) {
            throw new BusinessException(messageService.getMessage("estoque.positive.quantity.required"));
        }

        estoque.setQuantidade(estoque.getQuantidade() + quantidade);
        estoque = estoqueRepository.save(estoque);

        logger.info("Adicionadas {} unidades ao item {}", quantidade, estoque.getCodigo());
        return estoqueMapper.toResponse(estoque);
    }

    public EstoqueResponse removerQuantidade(Long id, Integer quantidade, String userEmail) {
        Estoque estoque = buscarItemComValidacao(id, userEmail);

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

    public void desativarItem(Long id, String userEmail) {
        Estoque estoque = buscarItemComValidacao(id, userEmail);

        estoque.setAtivo(false);
        estoqueRepository.save(estoque);

        logger.info("Item de estoque desativado: {}", estoque.getCodigo());
    }

    public void ativarItem(Long id, String userEmail) {
        Estoque estoque = buscarItemComValidacao(id, userEmail);

        estoque.setAtivo(true);
        estoqueRepository.save(estoque);

        logger.info("Item de estoque ativado: {}", estoque.getCodigo());
    }

    @Transactional(readOnly = true)
    public Long contarItensComEstoqueBaixo(String userEmail) {
        Long profissionalId = getProfissionalId(userEmail);
        return estoqueRepository.countItensComEstoqueBaixo(profissionalId);
    }

    @Transactional(readOnly = true)
    public Long contarTotalItens(String userEmail) {
        Long profissionalId = getProfissionalId(userEmail);
        return estoqueRepository.countByAtivoTrue(profissionalId);
    }

    // Métodos auxiliares
    private Long getProfissionalId(String userEmail) {
        if (securityService.isAdmin(userEmail)) {
            return null; // Admin vê todos os estoques
        }

        return profissionalRepository.findByUsuarioEmail(userEmail)
                .map(p -> p.getId())
                .orElse(null);
    }

    private Estoque buscarItemComValidacao(Long id, String userEmail) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("estoque.not.found")));

        // Verificar se o usuário pode acessar este item
        if (!securityService.isAdmin(userEmail)) {
            Long profissionalId = getProfissionalId(userEmail);
            if (profissionalId == null || !estoque.getProfissional().getId().equals(profissionalId)) {
                throw new BusinessException("Acesso negado ao item de estoque");
            }
        }
        return estoque;
    }

    private void validarCodigoUnico(String codigo, Long profissionalId) {
        boolean existe;
        if (profissionalId == null) {
            existe = estoqueRepository.existsByCodigoAndProfissionalIdIsNull(codigo);
        } else {
            existe = estoqueRepository.existsByCodigoAndProfissionalId(codigo, profissionalId);
        }
        if (existe) {
            throw new BusinessException(messageService.getMessage("estoque.code.already.exists"));
        }
    }
}