package com.doctorplus.controller;

import com.doctorplus.dto.request.EstoqueCreateRequest;
import com.doctorplus.dto.response.EstoqueResponse;
import com.doctorplus.dto.response.PageResponse;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Criar item de estoque", description = "Cadastra um novo item no estoque")
    public ResponseEntity<EstoqueResponse> criarItem(@Valid @RequestBody EstoqueCreateRequest request) {
        EstoqueResponse response = estoqueService.criarItem(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar item por ID", description = "Retorna os dados de um item específico")
    public ResponseEntity<EstoqueResponse> buscarPorId(@PathVariable Long id) {
        EstoqueResponse response = estoqueService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/codigo/{codigo}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar item por código", description = "Retorna os dados de um item pelo código")
    public ResponseEntity<EstoqueResponse> buscarPorCodigo(@PathVariable String codigo) {
        EstoqueResponse response = estoqueService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar itens paginados", description = "Retorna lista paginada de itens do estoque")
    public ResponseEntity<PageResponse<EstoqueResponse>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<EstoqueResponse> response = estoqueService.listarTodos(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/simples")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar todos os itens simples", description = "Retorna lista simples de todos os itens para seleção")
    public ResponseEntity<List<EstoqueResponse>> listarTodosSimples() {
        List<EstoqueResponse> response = estoqueService.listarTodosSimples();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categoria/{categoria}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar itens por categoria", description = "Retorna itens filtrados por categoria")
    public ResponseEntity<List<EstoqueResponse>> listarPorCategoria(@PathVariable String categoria) {
        List<EstoqueResponse> response = estoqueService.listarPorCategoria(categoria);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alertas/baixo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Itens com estoque baixo", description = "Retorna itens com quantidade abaixo do limite mínimo")
    public ResponseEntity<List<EstoqueResponse>> listarItensComEstoqueBaixo() {
        List<EstoqueResponse> response = estoqueService.listarItensComEstoqueBaixo();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alertas/esgotados")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Itens esgotados", description = "Retorna itens com quantidade zero")
    public ResponseEntity<List<EstoqueResponse>> listarItensEsgotados() {
        List<EstoqueResponse> response = estoqueService.listarItensEsgotados();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar itens paginados", description = "Busca itens por nome, código ou categoria com paginação")
    public ResponseEntity<PageResponse<EstoqueResponse>> buscarPorTermo(
            @RequestParam String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        PageResponse<EstoqueResponse> response = estoqueService.buscarPorTermo(termo, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categorias")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar categorias", description = "Retorna todas as categorias disponíveis")
    public ResponseEntity<List<String>> listarCategorias() {
        List<String> response = estoqueService.listarCategorias();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Atualizar item", description = "Atualiza os dados de um item do estoque")
    public ResponseEntity<EstoqueResponse> atualizarItem(
            @PathVariable Long id,
            @Valid @RequestBody EstoqueCreateRequest request) {
        EstoqueResponse response = estoqueService.atualizarItem(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/quantidade")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Ajustar quantidade", description = "Define uma nova quantidade para o item")
    public ResponseEntity<EstoqueResponse> ajustarQuantidade(
            @PathVariable Long id,
            @RequestParam Integer quantidade) {
        EstoqueResponse response = estoqueService.ajustarQuantidade(id, quantidade);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/adicionar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Adicionar quantidade", description = "Adiciona quantidade ao estoque do item")
    public ResponseEntity<EstoqueResponse> adicionarQuantidade(
            @PathVariable Long id,
            @RequestParam Integer quantidade) {
        EstoqueResponse response = estoqueService.adicionarQuantidade(id, quantidade);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/remover")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Remover quantidade", description = "Remove quantidade do estoque do item")
    public ResponseEntity<EstoqueResponse> removerQuantidade(
            @PathVariable Long id,
            @RequestParam Integer quantidade) {
        EstoqueResponse response = estoqueService.removerQuantidade(id, quantidade);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/desativar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desativar item", description = "Desativa um item do estoque")
    public ResponseEntity<Void> desativarItem(@PathVariable Long id) {
        estoqueService.desativarItem(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar item", description = "Ativa um item do estoque")
    public ResponseEntity<Void> ativarItem(@PathVariable Long id) {
        estoqueService.ativarItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estatisticas/total")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de itens", description = "Retorna o número total de itens no estoque")
    public ResponseEntity<Long> contarTotalItens() {
        Long total = estoqueService.contarTotalItens();
        return ResponseEntity.ok(total);
    }

    @GetMapping("/estatisticas/alertas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de alertas", description = "Retorna o número de itens com estoque baixo")
    public ResponseEntity<Long> contarItensComAlerta() {
        Long total = estoqueService.contarItensComEstoqueBaixo();
        return ResponseEntity.ok(total);
    }
}