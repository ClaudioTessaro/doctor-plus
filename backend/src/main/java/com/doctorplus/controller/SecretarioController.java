package com.doctorplus.controller;

import com.doctorplus.dto.request.SecretarioCreateRequest;
import com.doctorplus.dto.request.VinculoProfissionalRequest;
import com.doctorplus.dto.response.SecretarioResponse;
import com.doctorplus.service.SecretarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/secretarios")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Secretários", description = "Gerenciamento de secretários e suas vinculações")
public class SecretarioController {

    private final SecretarioService secretarioService;

    @Autowired
    public SecretarioController(SecretarioService secretarioService) {
        this.secretarioService = secretarioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Criar secretário", description = "Cadastra um novo secretário no sistema")
    public ResponseEntity<SecretarioResponse> criarSecretario(@Valid @RequestBody SecretarioCreateRequest request) {
        SecretarioResponse response = secretarioService.criarSecretario(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar secretário por ID", description = "Retorna os dados de um secretário específico")
    public ResponseEntity<SecretarioResponse> buscarPorId(@PathVariable UUID id) {
        SecretarioResponse response = secretarioService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar todos os secretários", description = "Retorna lista de todos os secretários ativos")
    public ResponseEntity<List<SecretarioResponse>> listarTodos(@CurrentUser UserPrincipal currentUser) {
        List<SecretarioResponse> response = secretarioService.listarTodos(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar secretários", description = "Busca secretários por nome ou email")
    public ResponseEntity<List<SecretarioResponse>> buscarPorTermo(@RequestParam String termo,
                                                                  @CurrentUser UserPrincipal currentUser) {
        List<SecretarioResponse> response = secretarioService.buscarPorTermo(termo, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Atualizar secretário", description = "Atualiza os dados de um secretário")
    public ResponseEntity<SecretarioResponse> atualizarSecretario(
            @PathVariable UUID id,
            @Valid @RequestBody SecretarioCreateRequest request) {
        SecretarioResponse response = secretarioService.atualizarSecretario(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{secretarioId}/vincular/{profissionalId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Vincular profissional", description = "Vincula um profissional ao secretário")
    public ResponseEntity<SecretarioResponse> vincularProfissional(
            @PathVariable UUID secretarioId,
            @PathVariable UUID profissionalId) {
        SecretarioResponse response = secretarioService.vincularProfissional(secretarioId, profissionalId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{secretarioId}/desvincular/{profissionalId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Desvincular profissional", description = "Remove vinculação entre secretário e profissional")
    public ResponseEntity<Void> desvincularProfissional(
            @PathVariable UUID secretarioId,
            @PathVariable UUID profissionalId) {
        secretarioService.desvincularProfissional(secretarioId, profissionalId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar secretário", description = "Ativa um secretário no sistema")
    public ResponseEntity<Void> ativarSecretario(@PathVariable UUID id) {
        secretarioService.ativarSecretario(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desativar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desativar secretário", description = "Desativa um secretário do sistema")
    public ResponseEntity<Void> desativarSecretario(@PathVariable UUID id) {
        secretarioService.desativarSecretario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estatisticas/total")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de secretários", description = "Retorna o número total de secretários ativos")
    public ResponseEntity<Long> contarTotalSecretarios() {
        Long total = secretarioService.contarTotalSecretarios();
        return ResponseEntity.ok(total);
    }
}