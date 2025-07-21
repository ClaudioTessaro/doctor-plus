package com.doctorplus.controller;

import com.doctorplus.dto.request.EstoqueCreateRequest;
import com.doctorplus.dto.response.EstoqueResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.security.CurrentUser;
import com.doctorplus.security.UserPrincipal;
import com.doctorplus.service.EstoqueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estoque")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Estoque", description = "Gerenciamento de estoque de medicamentos e produtos")
public class EstoqueController {

    private final EstoqueService estoqueService;

    @Autowired
    public EstoqueController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Criar item de estoque", description = "Cadastra um novo item no estoque")
    public ResponseEntity<EstoqueResponse> criarItem(@Valid @RequestBody EstoqueCreateRequest request,
                                                    @CurrentUser UserPrincipal currentUser) {
        EstoqueResponse response = estoqueService.criarItem(request, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Buscar item por ID", description = "Retorna os dados de um item específico")
    public ResponseEntity<EstoqueResponse> buscarPorId(@PathVariable Long id) {
        EstoqueResponse response = estoqueService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/codigo/{codigo}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Buscar item por código", description = "Retorna os dados de um item pelo código")
    public ResponseEntity<EstoqueResponse> buscarPorCodigo(@PathVariable String codigo) {
        EstoqueResponse response = estoqueService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Listar itens paginados", description = "Retorna lista paginada de itens do estoque")
    public ResponseEntity<PageResponse<EstoqueResponse>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @CurrentUser UserPrincipal currentUser) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<EstoqueResponse> response = estoqueService.listarTodos(pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/simples")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Listar todos os itens simples", description = "Retorna lista simples de todos os itens para seleção")
    public ResponseEntity<List<EstoqueResponse>> listarTodosSimples(@CurrentUser UserPrincipal currentUser) {
        List<EstoqueResponse> response = estoqueService.listarTodosSimples(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categoria/{categoria}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Listar itens por categoria", description = "Retorna itens filtrados por categoria")
    public ResponseEntity<List<EstoqueResponse>> listarPorCategoria(@PathVariable String categoria,
                                                                   @CurrentUser UserPrincipal currentUser) {
        List<EstoqueResponse> response = estoqueService.listarPorCategoria(categoria, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alertas/baixo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Itens com estoque baixo", description = "Retorna itens com quantidade abaixo do limite mínimo")
    public ResponseEntity<List<EstoqueResponse>> listarItensComEstoqueBaixo(@CurrentUser UserPrincipal currentUser) {
        List<EstoqueResponse> response = estoqueService.listarItensComEstoqueBaixo(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alertas/esgotados")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Itens esgotados", description = "Retorna itens com quantidade zero")
    public ResponseEntity<List<EstoqueResponse>> listarItensEsgotados(@CurrentUser UserPrincipal currentUser) {
        List<EstoqueResponse> response = estoqueService.listarItensEsgotados(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Buscar itens paginados", description = "Busca itens por nome, código ou categoria com paginação")
    public ResponseEntity<PageResponse<EstoqueResponse>> buscarPorTermo(
            @RequestParam String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUser UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        PageResponse<EstoqueResponse> response = estoqueService.buscarPorTermo(termo, pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categorias")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Listar categorias", description = "Retorna todas as categorias disponíveis")
    public ResponseEntity<List<String>> listarCategorias(@CurrentUser UserPrincipal currentUser) {
        List<String> response = estoqueService.listarCategorias(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Atualizar item", description = "Atualiza os dados de um item do estoque")
    public ResponseEntity<EstoqueResponse> atualizarItem(
            @PathVariable Long id,
            @Valid @RequestBody EstoqueCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        EstoqueResponse response = estoqueService.atualizarItem(id, request, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/quantidade")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Ajustar quantidade", description = "Define uma nova quantidade para o item")
    public ResponseEntity<EstoqueResponse> ajustarQuantidade(
            @PathVariable Long id,
            @RequestParam Integer quantidade,
            @CurrentUser UserPrincipal currentUser) {
        EstoqueResponse response = estoqueService.ajustarQuantidade(id, quantidade, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/adicionar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Adicionar quantidade", description = "Adiciona quantidade ao estoque do item")
    public ResponseEntity<EstoqueResponse> adicionarQuantidade(
            @PathVariable Long id,
            @RequestParam Integer quantidade,
            @CurrentUser UserPrincipal currentUser) {
        EstoqueResponse response = estoqueService.adicionarQuantidade(id, quantidade, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/remover")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Remover quantidade", description = "Remove quantidade do estoque do item")
    public ResponseEntity<EstoqueResponse> removerQuantidade(
            @PathVariable Long id,
            @RequestParam Integer quantidade,
            @CurrentUser UserPrincipal currentUser) {
        EstoqueResponse response = estoqueService.removerQuantidade(id, quantidade, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/desativar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Desativar item", description = "Desativa um item do estoque")
    public ResponseEntity<Void> desativarItem(@PathVariable Long id,
                                             @CurrentUser UserPrincipal currentUser) {
        estoqueService.desativarItem(id, currentUser.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Ativar item", description = "Ativa um item do estoque")
    public ResponseEntity<Void> ativarItem(@PathVariable Long id,
                                          @CurrentUser UserPrincipal currentUser) {
        estoqueService.ativarItem(id, currentUser.getEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estatisticas/total")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de itens", description = "Retorna o número total de itens no estoque")
    public ResponseEntity<Long> contarTotalItens(@CurrentUser UserPrincipal currentUser) {
        Long total = estoqueService.contarTotalItens(currentUser.getEmail());
        return ResponseEntity.ok(total);
    }

    @GetMapping("/estatisticas/alertas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de alertas", description = "Retorna o número de itens com estoque baixo")
    public ResponseEntity<Long> contarItensComAlerta(@CurrentUser UserPrincipal currentUser) {
        Long total = estoqueService.contarItensComEstoqueBaixo(currentUser.getEmail());
        return ResponseEntity.ok(total);
    }
}