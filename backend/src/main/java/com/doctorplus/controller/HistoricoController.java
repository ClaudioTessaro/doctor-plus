package com.doctorplus.controller;

import com.doctorplus.dto.request.HistoricoCreateRequest;
import com.doctorplus.dto.response.HistoricoResponse;
import com.doctorplus.dto.response.PageResponse;
import com.doctorplus.security.CurrentUser;
import com.doctorplus.security.UserPrincipal;
import com.doctorplus.service.HistoricoService;
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
import java.util.UUID;

@RestController
@RequestMapping("/historicos")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Históricos", description = "Gerenciamento de históricos médicos e prontuários")
public class HistoricoController {

    private final HistoricoService historicoService;

    @Autowired
    public HistoricoController(HistoricoService historicoService) {
        this.historicoService = historicoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Criar histórico", description = "Cria um novo registro no histórico médico")
    public ResponseEntity<HistoricoResponse> criarHistorico(
            @Valid @RequestBody HistoricoCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        HistoricoResponse response = historicoService.criarHistorico(request, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar histórico por ID", description = "Retorna os dados de um histórico específico")
    public ResponseEntity<HistoricoResponse> buscarPorId(@PathVariable UUID id) {
        HistoricoResponse response = historicoService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar históricos paginados", description = "Retorna lista paginada de históricos")
    public ResponseEntity<PageResponse<HistoricoResponse>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "dataConsulta") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @CurrentUser UserPrincipal currentUser) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<HistoricoResponse> response = historicoService.listarTodos(pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/simples")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar todos os históricos simples", description = "Retorna lista simples de todos os históricos")
    public ResponseEntity<List<HistoricoResponse>> listarTodosSimples(@CurrentUser UserPrincipal currentUser) {
        List<HistoricoResponse> response = historicoService.listarTodosSimples(currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Listar históricos do paciente", description = "Retorna histórico médico completo de um paciente")
    public ResponseEntity<List<HistoricoResponse>> listarPorPaciente(@PathVariable UUID pacienteId) {
        List<HistoricoResponse> response = historicoService.listarPorPaciente(pacienteId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profissional/{profissionalId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Listar históricos do profissional", description = "Retorna históricos criados por um profissional")
    public ResponseEntity<List<HistoricoResponse>> listarPorProfissional(@PathVariable UUID profissionalId) {
        List<HistoricoResponse> response = historicoService.listarPorProfissional(profissionalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL') or hasRole('SECRETARIO')")
    @Operation(summary = "Buscar históricos paginados", description = "Busca históricos por termo com paginação")
    public ResponseEntity<PageResponse<HistoricoResponse>> buscarPorTermo(
            @RequestParam String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUser UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dataConsulta"));
        PageResponse<HistoricoResponse> response = historicoService.buscarPorTermo(termo, pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Atualizar histórico", description = "Atualiza os dados de um histórico")
    public ResponseEntity<HistoricoResponse> atualizarHistorico(
            @PathVariable UUID id,
            @Valid @RequestBody HistoricoCreateRequest request) {
        HistoricoResponse response = historicoService.atualizarHistorico(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir histórico", description = "Remove um histórico do sistema")
    public ResponseEntity<Void> excluirHistorico(@PathVariable UUID id) {
        historicoService.excluirHistorico(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estatisticas/total")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFISSIONAL')")
    @Operation(summary = "Total de históricos", description = "Retorna o número total de históricos")
    public ResponseEntity<Long> contarTotalHistoricos() {
        Long total = historicoService.contarTotalHistoricos();
        return ResponseEntity.ok(total);
    }
}